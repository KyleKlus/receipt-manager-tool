import { Category } from "@/enums/Category";


export interface IReceiptItem {
    name: string;
    price: number;
    amount: number;
    category: Category;
    isMine: boolean;
    isShared: boolean;
    isRejected: boolean;
}