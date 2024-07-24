export interface IReceiptItem {
    name: string;
    price: number;
    amount: number;
    category: string;
    isMine: boolean;
    isShared: boolean;
    isRejected: boolean;
}