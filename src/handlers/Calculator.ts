import { IReceipt } from "@/interfaces/IReceipt";
import BigNumber from 'bignumber.js';
import { deepCopyReceipts } from "./ReceiptModifier";

export function calcReceiptsExpenses(receipts: IReceipt[]): BigNumber {
    let expenses: BigNumber = new BigNumber(0);
    let totalPrice: BigNumber = new BigNumber(0);
    const receiptsCopy = deepCopyReceipts(receipts);

    receiptsCopy.forEach((receipt) => {
        receipt.items.forEach((item) => {
            expenses = expenses.plus(item.price);
        });
        totalPrice = new BigNumber(0);
    })

    return expenses;
}

export function calcPersonalExpenses(receipts: IReceipt[]): BigNumber {
    let expenses: BigNumber = new BigNumber(0);
    const receiptsCopy = deepCopyReceipts(receipts);

    receiptsCopy.forEach((receipt) => {
        receipt.items.forEach((item) => {
            if (item.isMine) {
                expenses = expenses.plus(item.price);
            }
        })
    })

    return expenses;
}

export function calcSharedExpenses(receipts: IReceipt[]): BigNumber {
    let expenses: BigNumber = new BigNumber(0);
    const receiptsCopy = deepCopyReceipts(receipts);

    receiptsCopy.forEach((receipt) => {
        receipt.items.forEach((item) => {
            if (item.isShared) {
                const sharedPrice: BigNumber = new BigNumber(item.price).dividedBy(new BigNumber(2));
                expenses = expenses.plus(sharedPrice);
            }
        })
    })

    return expenses;
}

export function calcRejectedExpenses(receipts: IReceipt[]): BigNumber {
    let expenses: BigNumber = new BigNumber(0);
    const receiptsCopy = deepCopyReceipts(receipts);

    receiptsCopy.forEach((receipt) => {
        receipt.items.forEach((item) => {
            if (item.isRejected) {
                expenses = expenses.plus(item.price);
            }
        })
    })

    return expenses;
}