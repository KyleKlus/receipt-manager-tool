import { IReceiptItem } from "./IReceiptItem";

export interface IReceipt {
    store: string;
    date: string;
    owner: string;
    totalPrice: number;
    items: IReceiptItem[];
    categoryForAllItems: string;
    isAllShared: boolean;
    isAllRejected: boolean;
    isAllMine: boolean;
}