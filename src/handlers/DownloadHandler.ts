import { IReceipt } from "@/interfaces/IReceipt";
import { IReceiptItem } from "@/interfaces/IReceiptItem";
import { IResult } from "@/interfaces/IResult";
import BigNumber from 'bignumber.js';
import * as XLSX from 'xlsx';
import { deepCopyReceipts } from "./ReceiptModifier";

interface IExportExpensesRow {
    Name: string;
    Price: number;
    Amount: number;
    Category: string;
    IsMyItem: boolean;
    IsSharedItem: boolean;
    IsRejectedItem: boolean;
    Store: string;
}

export function downloadCSV(name: string, myReceipts: IReceipt[], otherReceipts: IReceipt[]) {
    const data: string[] = [_prepCSVDataReceipts(myReceipts, otherReceipts)];
    if (name === undefined || data === undefined || name === '' || data.length === 0 || data[0] === '') { return; }
    const link = document.createElement('a');
    const fileBlob = new Blob(data, { type: 'text/csv' });
    link.href = URL.createObjectURL(fileBlob);
    link.download = name + '.csv';
    document.body.appendChild(link);
    link.click();
}

export function downloadEXCEL(name: string, myName: string, otherName: string, myReceipts: IReceipt[], otherReceipts: IReceipt[], resultData: IResult) {
    const myReceiptsCopy = deepCopyReceipts(myReceipts);
    const otherReceiptsCopy = deepCopyReceipts(otherReceipts);
    const myExpenses: IExportExpensesRow[] = _prepExpenses(myReceiptsCopy, otherReceiptsCopy);
    const myReceiptsExport: IExportExpensesRow[] = _convertReceiptsToList(myReceiptsCopy);
    const otherExpenses: IExportExpensesRow[] = _prepExpenses(otherReceiptsCopy, myReceiptsCopy);
    const otherReceiptsExport: IExportExpensesRow[] = _convertReceiptsToList(otherReceiptsCopy);
    const result: any[] = _prepResult(resultData);

    if (name === undefined || name === '' || myExpenses.length === 0) { return; }

    const wb = XLSX.utils.book_new();
    const myExpensesWs = XLSX.utils.json_to_sheet(myExpenses);
    const myReceiptsWs = XLSX.utils.json_to_sheet(myReceiptsExport);
    const otherExpensesWs = XLSX.utils.json_to_sheet(otherExpenses);
    const otherReceiptsWs = XLSX.utils.json_to_sheet(otherReceiptsExport);
    const resultWs = XLSX.utils.json_to_sheet(result);

    XLSX.utils.book_append_sheet(wb, myExpensesWs, myName + ' Expenses');
    XLSX.utils.book_append_sheet(wb, otherExpensesWs, otherName + ' Expenses');
    XLSX.utils.book_append_sheet(wb, resultWs, 'Result');
    XLSX.utils.book_append_sheet(wb, myReceiptsWs, myName + ' Receipts');
    XLSX.utils.book_append_sheet(wb, otherReceiptsWs, otherName + ' Receipts');

    XLSX.writeFileXLSX(wb, name + '.xlsx', { type: 'file' });
}

function _convertReceiptsToList(myReceipts: IReceipt[]): IExportExpensesRow[] {
    if (myReceipts === undefined) { return []; }
    if (myReceipts.length === 0) { return []; }

    const receipts = deepCopyReceipts(myReceipts);

    const data: IExportExpensesRow[] = []

    for (let index = 0; index < receipts.length; index++) {
        const receipt = receipts[index];

        data.push({
            Name: receipt.store,
            Price: receipt.totalPrice,
            Amount: 0,
            Category: receipt.categoryForAllItems,
            IsMyItem: receipt.isAllMine,
            IsSharedItem: receipt.isAllShared,
            IsRejectedItem: receipt.isAllRejected,
            Store: ''
        })

        for (let jndex = 0; jndex < receipt.items.length; jndex++) {
            const item = receipt.items[jndex];
            data.push({
                Name: item.name,
                Price: item.price,
                Amount: item.amount,
                Category: item.category,
                IsMyItem: item.isMine,
                IsSharedItem: item.isShared,
                IsRejectedItem: item.isRejected,
                Store: receipt.store
            })
        }
    }

    return data;
}

function isNumeric(str: string): boolean {
    return !Number.isNaN(Number(str));
}

function _prepExpenses(myReceipts: IReceipt[], otherReceipts: IReceipt[]): IExportExpensesRow[] {
    if (myReceipts === undefined || otherReceipts === undefined) { return []; }
    if (myReceipts.length === 0 && otherReceipts.length === 0) { return []; }

    let filteredList: IReceiptItem[] = []
    let otherFilteredList: IReceiptItem[] = [];

    const firstReceipts = deepCopyReceipts(myReceipts);

    const secondReceipts = deepCopyReceipts(otherReceipts);

    firstReceipts.forEach((itemArray) => {
        for (let index = 0; index < itemArray.items.length; index++) {
            const item = itemArray.items[index];
            if (item.isRejected) { continue; }
            if (item.isShared) {
                item.price = parseFloat(new BigNumber(item.price).dividedBy(new BigNumber(2)).toFixed(2));
            }
            filteredList.push(item);
        }
    });

    secondReceipts.forEach((itemArray) => {
        for (let index = 0; index < itemArray.items.length; index++) {
            const item = itemArray.items[index];
            if (item.isMine) { continue; }
            if (item.isShared) {
                item.price = parseFloat(new BigNumber(item.price).dividedBy(new BigNumber(2)).toFixed(2));
            }
            otherFilteredList.push(item);
        }
    });

    const data: IExportExpensesRow[] = filteredList.concat(otherFilteredList).slice(0).map((e) => {
        const row: IExportExpensesRow = {
            Name: e.name,
            Price: e.price,
            Amount: e.amount,
            Category: e.category,
            IsMyItem: e.isMine,
            IsSharedItem: e.isShared,
            IsRejectedItem: e.isRejected,
            Store: ''
        }
        return row;
    }).slice(0);

    return data;
}

function _prepResult(resultData: IResult): any[] {

    if (resultData === undefined) { return []; }

    const firstValue = resultData.payerName + '`s Values';
    const secondValue = resultData.receiverName + '`s Values';

    const totalData: any[] = [
        {
            Stuff: 'Personal Items from ' + resultData.payerName + '`s receipts',
            [firstValue]: resultData.payerItemsFromPayer,
            [secondValue]: resultData.receiverItemsFromPayer
        },
        {
            Stuff: 'Personal Items from ' + resultData.receiverName + '`s receipts',
            [firstValue]: resultData.payerItemsFromReceiver,
            [secondValue]: resultData.receiverItemsFromReceiver
        },
        {
            Stuff: 'Shared Items from ' + resultData.payerName + '`s receipts',
            [firstValue]: resultData.sharedFromPayer,
            [secondValue]: resultData.sharedFromPayer
        },
        {
            Stuff: 'Shared Items from ' + resultData.receiverName + '`s receipts',
            [firstValue]: resultData.sharedFromReceiver,
            [secondValue]: resultData.sharedFromReceiver
        },
        {
            Stuff: 'Money paid',
            [firstValue]: resultData.payerExpenses,
            [secondValue]: resultData.receiverExpenses
        },
        {
            Stuff: 'Result',
            [firstValue]: -1 * resultData.result,
            [secondValue]: resultData.result
        }
    ]

    return totalData;
}

function _prepCSVDataReceipts(myReceipts: IReceipt[], otherReceipts: IReceipt[]): string {
    let dataString: string = '';

    if (myReceipts === undefined || otherReceipts === undefined) { return dataString; }
    if (myReceipts.length === 0 && otherReceipts.length === 0) { return dataString; }

    const data = _prepExpenses(myReceipts, otherReceipts);

    if (data.length === 0) { return dataString; }

    const csvHeaders: string = 'Name;Price;Amount;Category;IsMyItem;IsSharedItem;IsRejectedItem';
    const csvDataArray: string[] = [csvHeaders, ...data.map((row) => {
        return [row.Name, row.Price, row.Amount, row.Category, row.IsMyItem, row.IsSharedItem, row.IsRejectedItem].join(';')
    })]

    const csvData: string = csvDataArray.join('\n');
    return csvData;
}

function _prepCSVDataTotal(resultData: IResult): string {
    let dataString: string = '';

    if (resultData === undefined) { return dataString; }

    const csvHeaders: string = 'Stuff;' + resultData.payerName + '`s Values;' + resultData.receiverName + '`s Values;';
    const csvDataArray: string[] = [csvHeaders];

    csvDataArray.push('Personal Items from ' + resultData.payerName + '`s receipts;'
        + (resultData.payerItemsFromPayer).toString().replace('.', ',') + ';'
        + (resultData.receiverItemsFromPayer).toString().replace('.', ',') + ';');

    csvDataArray.push('Personal Items from ' + resultData.receiverName + '`s receipts;'
        + (resultData.payerItemsFromReceiver).toString().replace('.', ',') + ';'
        + (resultData.receiverItemsFromReceiver).toString().replace('.', ',') + ';');

    csvDataArray.push('Shared Items from ' + resultData.payerName + '`s receipts;'
        + (resultData.sharedFromPayer).toString().replace('.', ',') + ';'
        + (resultData.sharedFromPayer).toString().replace('.', ',') + ';');

    csvDataArray.push('Shared Items from ' + resultData.receiverName + '`s receipts;'
        + (resultData.sharedFromReceiver).toString().replace('.', ',') + ';'
        + (resultData.sharedFromReceiver).toString().replace('.', ',') + ';');

    csvDataArray.push('Money paid;'
        + (resultData.payerExpenses).toString().replace('.', ',') + ';'
        + (resultData.receiverExpenses).toString().replace('.', ',') + ';');

    csvDataArray.push('Result;' + (resultData.result).toString().replace('.', ',')
        + ';' + (resultData.result).toString().replace('.', ',') + ';');


    const csvData: string = csvDataArray.join('\n');

    return csvData;
}