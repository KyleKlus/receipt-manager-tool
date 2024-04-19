import { Category, DEFAULT_CATEGORY } from "@/enums/Category";
import { IReceipt } from "@/interfaces/IReceipt";
import { IReceiptItem } from "@/interfaces/IReceiptItem";
import moment from "moment";
import * as XLSX from 'xlsx';

interface IDataRow {
    receiptData: string[],
    itemsData: string[]
}

const receiptDataSet = new Set(['Date', 'Store', 'Description']);
const itemDataSet = new Set(['Name', 'Price', 'Amount',]);
const unrecognizedStoreName = 'Unrecognized Store';
const unrecognizedItemName = 'Unrecognized Item';

export function parseFileToReceipts(file: File, ownerName: string): Promise<IReceipt[]> {
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

                let totalPrice = 0;

                let parsedReceiptItems: IReceiptItem[] = receiptItems.map(list => {
                    let itemName = _firstCharToUppercase(list[0]);
                    itemName = itemName !== '' ? itemName : unrecognizedItemName;
                    const itemAmount: number = list[2] === '' ? 1 : Math.floor(parseFloat(list[2]) * 100) / 100;
                    // NOTE: * -100 because all parsed prices have a - sign
                    const price: number = Math.floor(parseFloat(list[1]) * -100) / 100;
                    totalPrice += price;

                    return {
                        name: itemName,
                        isMine: false,
                        isShared: true,
                        isRejected: false,
                        price: itemName === unrecognizedItemName ? 0 : Math.round(price * 100) / 100,
                        amount: itemName === unrecognizedItemName ? 0 : itemAmount,
                        category: itemName === unrecognizedItemName ? Category.None : price < 0 ? Category.Discount : DEFAULT_CATEGORY
                    }
                })

                // Add store name to receipt
                let storeName = _firstCharToUppercase(receiptData[1] === '' ? receiptData[2] : receiptData[1]);
                storeName = storeName !== '' ? storeName : unrecognizedStoreName;

                const parsedReceipt: IReceipt = {
                    store: storeName,
                    date: receiptData[0] !== '' ? moment().format('DD.MM.YYYY') : '',
                    owner: ownerName,
                    categoryForAllItems: Category.None,
                    isAllShared: false,
                    isAllRejected: false,
                    isAllMine: false,
                    totalPrice: storeName === unrecognizedStoreName ? 0 : Math.round(totalPrice * 100) / 100,
                    items: storeName === unrecognizedStoreName ? [] : parsedReceiptItems,
                }

                receipts = receipts.concat(parsedReceipt)
            }

            resolve(receipts);
        };

        reader.readAsText(file);
    });
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
        const commaSplit = rowText.split(',');
        return {
            receiptData: commaSplit.slice(0, -1),
            itemsData: commaSplit.slice(-1, commaSplit.length)[0].split('|')
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