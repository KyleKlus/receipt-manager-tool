import { IReceiptItem } from "./IReceiptItem";

export interface IReceipt {
    store: string;
    owner: string;
    totalPrice: number;
    items: IReceiptItem[];
    categoryForAllItems: string
    isAllShared: boolean;
    isAllRejected: boolean;
    isAllMine: boolean;
}