import { Category } from "@/enums/Category";
import { IReceiptItem } from "./IReceiptItem";

export interface IReceipt {
    store: string;
    date: string;
    owner: string;
    totalPrice: number;
    items: IReceiptItem[];
    categoryForAllItems: Category
    isAllShared: boolean;
    isAllRejected: boolean;
    isAllMine: boolean;
}