import { DEFAULT_CATEGORY, defaultCategories } from "@/enums/Category";
import { IReceipt } from "@/interfaces/IReceipt";
import { IReceiptItem } from "@/interfaces/IReceiptItem";
import BigNumber from 'bignumber.js';
import moment from "moment";
import * as XLSX from 'xlsx';

interface IDataRow {
    receiptData: string[],
    itemsData: string[]
}

export interface IExcelImportData {
    firstName: string;
    secondName: string;
    firstReceipts: IReceipt[];
    secondReceipts: IReceipt[];
}

const receiptDataSet = new Set(['Date', 'Store', 'Description']);
const itemDataSet = new Set(['Name', 'Price', 'Amount',]);
export const unrecognizedStoreName = 'Unrecognized Store';
export const unrecognizedItemName = 'Unrecognized Item';

export async function parseXLSXToReceipts(file: File): Promise<IExcelImportData> {
    let receipts: IExcelImportData = {
        firstName: '',
        secondName: '',
        firstReceipts: [],
        secondReceipts: []
    }

    const workbook = XLSX.read(await file.arrayBuffer());
    receipts.firstName = workbook.SheetNames[3].replace(' Receipts', '');
    receipts.secondName = workbook.SheetNames[4].replace(' Receipts', '');

    const firstWorkSheet = workbook.Sheets[workbook.SheetNames[3]];
    const secondWorkSheet = workbook.Sheets[workbook.SheetNames[4]];

    const firstRawData: any[][] = (XLSX.utils.sheet_to_json(firstWorkSheet, { header: 1 }) as any[][]).slice(1);
    const secondRawData: any[][] = (XLSX.utils.sheet_to_json(secondWorkSheet, { header: 1 }) as any[][]).slice(1);

    receipts.firstReceipts = _parseRawExcelData(firstRawData, receipts.firstName);
    receipts.secondReceipts = _parseRawExcelData(secondRawData, receipts.secondName);

    return receipts;
}

export function parseCSVToReceipts(file: File, ownerName: string): Promise<IReceipt[]> {
    let receipts: IReceipt[] = []

    let reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onerror = () => {
            reader.abort();
            reject(new DOMException("Problem parsing input file."));
        };

        reader.onload = () => {
            const result = reader.result;
            if (result === null || result === undefined) {
                resolve([]);
                return;
            }

            const resultText = result.toString();
            const dataRowsAsText = resultText.split('\n').filter(r => r !== '');

            const dataRows: IDataRow[] = _convertDataStringToDataRows(dataRowsAsText);

            const receiptsHeader: string[] = dataRows[0].receiptData;
            const receiptDataIndices: number[] = _extractRelevantIndices(receiptsHeader, receiptDataSet);

            const itemHeaders: string[] = dataRows[0].itemsData;
            const itemHeadersCount: number = itemHeaders.length;
            const itemDataIndices: number[] = _extractRelevantIndices(itemHeaders, itemDataSet);

            for (let i: number = 1; i < dataRows.length; i++) {
                const receiptData: string[] = _extractRelevantData(dataRows[i].receiptData, receiptDataIndices);
                const receiptItems: string[][] = _listToMatrix(dataRows[i].itemsData.slice(0, -1), itemHeadersCount).map((item) => {
                    return _extractRelevantData(item, itemDataIndices)
                });

                let totalPrice = new BigNumber(0);

                let parsedReceiptItems: IReceiptItem[] = receiptItems.map(list => {
                    let itemName = _firstCharToUppercase(list[0]);
                    itemName = itemName !== '' ? itemName : unrecognizedItemName;
                    const itemAmount: number = list[2] === '' ? 1 : parseFloat(list[2]);
                    // NOTE: * -100 because all parsed prices have a - sign
                    const price: number = -1 * parseFloat(list[1]);
                    totalPrice = totalPrice.plus(price);
                    return {
                        name: itemName,
                        isMine: false,
                        isShared: true,
                        isRejected: false,
                        price: itemName === unrecognizedItemName ? 0 : price,
                        amount: itemName === unrecognizedItemName ? 0 : itemAmount,
                        category: itemName === unrecognizedItemName ? defaultCategories.None : price < 0 ? defaultCategories.Discount : DEFAULT_CATEGORY
                    }
                })

                // Add store name to receipt
                let storeName = _firstCharToUppercase(receiptData[1] === '' ? receiptData[2] : receiptData[1]);
                storeName = storeName !== '' ? storeName : unrecognizedStoreName;

                const parsedReceipt: IReceipt = {
                    store: storeName,
                    date: receiptData[0] !== '' ? moment().format('DD.MM.YYYY') : '',
                    owner: ownerName,
                    categoryForAllItems: defaultCategories.None,
                    isAllShared: false,
                    isAllRejected: false,
                    isAllMine: false,
                    totalPrice: storeName === unrecognizedStoreName ? 0 : totalPrice.toNumber(),
                    items: storeName === unrecognizedStoreName ? [] : parsedReceiptItems,
                }

                receipts = receipts.concat(parsedReceipt)
            }

            resolve(receipts);
        };

        reader.readAsText(file);
    });
}

function _parseRawExcelData(data: any[][], owner: string): IReceipt[] {
    const receipts: IReceipt[] = [];
    for (let index = 0; index < data.length; index++) {
        const row = data[index];

        if (row[2] === 0) {
            const newReceipt: IReceipt = {
                store: row[0],
                date: '',
                owner: owner,
                categoryForAllItems: row[3],
                isAllMine: row[4],
                isAllShared: row[5],
                isAllRejected: row[6],
                totalPrice: row[1],
                items: []
            }
            receipts.push(newReceipt)
        } else {
            const newItem: IReceiptItem = {
                name: row[0],
                price: row[1],
                amount: row[2],
                category: row[3],
                isMine: row[4],
                isShared: row[5],
                isRejected: row[6]
            }
            receipts[receipts.length - 1].items.push(newItem)
        }
    }
    return receipts;
}

function _extractRelevantIndices(dataHeaders: string[], relevantDataSet: Set<string>): number[] {
    return dataHeaders
        .map((header, index) => { return { header, index } })
        .filter(e => {
            return relevantDataSet.has(e.header)
        })
        .map(e => e.index);
}

function _extractRelevantData(row: string[], indices: number[]): string[] {
    return indices.map(index => {
        return row[index];
    });
}

function _convertDataStringToDataRows(textRows: string[]): IDataRow[] {
    return textRows.map(rowText => {
        const split = rowText.split('|');
        const commaSide = split[0].split(',').slice(0, -1);
        let barSide = [split[0].split(',').reverse()[0]];
        barSide = barSide.concat(split.slice(1));
        return {
            receiptData: commaSide,
            itemsData: barSide
        };
    });
}

function _listToMatrix(list: string[], elementsPerSubArray: number) {
    const matrix: string[][] = [];
    let k = -1;

    for (let i = 0; i < list.length; i++) {
        if (i % elementsPerSubArray === 0) {
            k++;
            matrix[k] = [];
        }

        matrix[k].push(list[i]);
    }

    return matrix;
}

function _firstCharToUppercase(text: string): string {
    if (text !== undefined && text !== '' && text.length > 1) {
        // Make first letter of text uppercase
        const firstLetterOfText: string = text[0].toUpperCase();
        const restOfText: string = text.slice(1);
        return firstLetterOfText + restOfText;
    }
    return '';
}