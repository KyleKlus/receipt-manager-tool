import { Category } from "@/enums/Category";
import { IReceipt } from "@/interfaces/IReceipt";
import { IReceiptItem } from "@/interfaces/IReceiptItem";


export function setStoreName(receipts: IReceipt[], receiptNum: number, store: string): IReceipt[] {
    const updatedList: IReceipt[] = receipts;
    updatedList[receiptNum].store = store;
    return updatedList;
}

export function setItemName(receipts: IReceipt[], receiptNum: number, itemNum: number, name: string): IReceipt[] {
    const updatedList: IReceipt[] = receipts;
    updatedList[receiptNum].items[itemNum].name = name;
    return updatedList;
}

export function setItemAmount(receipts: IReceipt[], receiptNum: number, itemNum: number, amount: number): IReceipt[] {
    const updatedList: IReceipt[] = receipts;
    updatedList[receiptNum].items[itemNum].amount = amount;
    return updatedList;
}

export function setItemPrice(receipts: IReceipt[], receiptNum: number, itemNum: number, newPrice: number): IReceipt[] {
    const updatedList: IReceipt[] = receipts;
    updatedList[receiptNum].totalPrice = updatedList[receiptNum].totalPrice - updatedList[receiptNum].items[itemNum].price + newPrice;
    updatedList[receiptNum].items[itemNum].price = newPrice;
    return updatedList;
}

export function selectCategory(receipts: IReceipt[], receiptNum: number, itemNum: number, selectedCategory: Category): IReceipt[] {
    const updatedList: IReceipt[] = receipts;

    updatedList[receiptNum].categoryForAllItems = Category.None;
    updatedList[receiptNum].items[itemNum].category = selectedCategory;

    return updatedList;
}

export function toggleRejectItem(receipts: IReceipt[], receiptNum: number, itemNum: number): IReceipt[] {
    const updatedList: IReceipt[] = receipts;

    updatedList[receiptNum].isAllRejected = false;
    updatedList[receiptNum].isAllShared = false;
    updatedList[receiptNum].isAllMine = false;

    if (updatedList[receiptNum].items[itemNum].isMine === true) {
        updatedList[receiptNum].items[itemNum].isMine = false;
    };
    updatedList[receiptNum].items[itemNum].isRejected = !updatedList[receiptNum].items[itemNum].isRejected;
    updatedList[receiptNum].items[itemNum].isShared = !updatedList[receiptNum].items[itemNum].isRejected;


    return updatedList;
}

export function toggleShareItem(receipts: IReceipt[], receiptNum: number, itemNum: number): IReceipt[] {
    const updatedList: IReceipt[] = receipts;
    updatedList[receiptNum].isAllRejected = false;
    updatedList[receiptNum].isAllShared = false;
    updatedList[receiptNum].isAllMine = false;

    if (updatedList[receiptNum].items[itemNum].isRejected === true && !updatedList[receiptNum].items[itemNum].isShared === true) {
        updatedList[receiptNum].items[itemNum].isRejected = false;
    };
    updatedList[receiptNum].items[itemNum].isShared = !updatedList[receiptNum].items[itemNum].isShared;
    updatedList[receiptNum].items[itemNum].isMine = updatedList[receiptNum].items[itemNum].isShared && updatedList[receiptNum].items[itemNum].isRejected;

    return updatedList;
}

export function toggleMyItem(receipts: IReceipt[], receiptNum: number, itemNum: number): IReceipt[] {
    const updatedList: IReceipt[] = receipts;

    updatedList[receiptNum].isAllRejected = false;
    updatedList[receiptNum].isAllShared = false;
    updatedList[receiptNum].isAllMine = false;

    updatedList[receiptNum].items[itemNum].isMine = !updatedList[receiptNum].items[itemNum].isMine;
    updatedList[receiptNum].items[itemNum].isShared = !updatedList[receiptNum].items[itemNum].isMine;
    updatedList[receiptNum].items[itemNum].isRejected = false;

    return updatedList;
}

export function deleteItem(receipts: IReceipt[], receiptNum: number, itemNum: number): IReceipt[] {
    const updatedList: IReceipt[] = receipts;

    const deletedItem = updatedList[receiptNum].items.splice(itemNum, 1);
    updatedList[receiptNum].totalPrice -= deletedItem[0].price;

    if (updatedList[receiptNum].totalPrice < 0 && updatedList[receiptNum].items.length === 0) {
        updatedList[receiptNum].totalPrice = 0;
    }

    updatedList[receiptNum].totalPrice = Math.floor(updatedList[receiptNum].totalPrice * 100) / 100;

    return updatedList;
}

export function selectCategoryForAllItems(receipts: IReceipt[], receiptNum: number, selectedCategory: Category) {
    const updatedList: IReceipt[] = receipts;

    updatedList[receiptNum].categoryForAllItems = selectedCategory;

    const tmpItems: IReceiptItem[] = updatedList[receiptNum].items.slice(0);

    tmpItems.forEach((item) => {
        item.category = selectedCategory;
    })

    updatedList[receiptNum].items = tmpItems;
    return updatedList;
}

export function toggleAllRejectedItems(receipts: IReceipt[], receiptNum: number): IReceipt[] {
    const updatedList: IReceipt[] = receipts;

    if (updatedList[receiptNum].isAllMine === true) {
        updatedList[receiptNum].isAllMine = false;
    };
    updatedList[receiptNum].isAllRejected = !updatedList[receiptNum].isAllRejected;
    updatedList[receiptNum].isAllShared = !updatedList[receiptNum].isAllRejected;


    updatedList[receiptNum].items.forEach((item) => {
        item.isRejected = updatedList[receiptNum].isAllRejected;
        item.isShared = updatedList[receiptNum].isAllShared;
        item.isMine = updatedList[receiptNum].isAllMine;
    });

    return updatedList;
}

export function toggleAllSharedItems(receipts: IReceipt[], receiptNum: number): IReceipt[] {
    const updatedList: IReceipt[] = receipts;

    if (updatedList[receiptNum].isAllRejected === true && !updatedList[receiptNum].isAllShared === true) {
        updatedList[receiptNum].isAllRejected = false;
    };
    updatedList[receiptNum].isAllShared = !updatedList[receiptNum].isAllShared;
    updatedList[receiptNum].isAllMine = updatedList[receiptNum].isAllShared && updatedList[receiptNum].isAllRejected;

    updatedList[receiptNum].items.forEach((item) => {
        item.isRejected = updatedList[receiptNum].isAllRejected;
        item.isShared = updatedList[receiptNum].isAllShared;
        item.isMine = updatedList[receiptNum].isAllMine;
    });
    return updatedList;
}

export function toggleAllMyItems(receipts: IReceipt[], receiptNum: number): IReceipt[] {
    const updatedList: IReceipt[] = receipts;

    updatedList[receiptNum].isAllMine = !updatedList[receiptNum].isAllMine;
    updatedList[receiptNum].isAllShared = !updatedList[receiptNum].isAllMine;
    updatedList[receiptNum].isAllRejected = false;

    updatedList[receiptNum].items.forEach((item) => {
        item.isRejected = updatedList[receiptNum].isAllRejected;
        item.isShared = updatedList[receiptNum].isAllShared;
        item.isMine = updatedList[receiptNum].isAllMine;
    });
    return updatedList;
}

export function deleteReceipt(receipts: IReceipt[], receiptNum: number): IReceipt[] {
    const updatedList: IReceipt[] = receipts;
    updatedList.splice(receiptNum, 1);
    return updatedList;
}