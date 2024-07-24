/** @format */
import React, { useEffect } from "react";
import styles from '@/styles/components/receipt-manager/personCell/ReceiptsTable.module.css'
import { IReceipt } from '@/interfaces/IReceipt';
import { IReceiptItem } from '@/interfaces/IReceiptItem';
import { Sailboat, Star, ArrowUp, ArrowUpCircle, Goal, Handshake, Pencil, UserRound, X } from 'lucide-react';
import * as ReceiptModifier from '@/handlers/ReceiptModifier';
import { ChangeEvent, useState } from 'react';
import TableRow, { IEditableData } from "./TableRow";
import { DEFAULT_CATEGORY } from "@/enums/Category";

export default function ReceiptsTable(props: {
    myName: string,
    myReceipts: IReceipt[],
    otherName: string,
    isFirst: boolean,
    isInEditMode: boolean,
    categories: string[],
    setIsInEditMode: (isInEditMode: boolean, isFirst: boolean) => void,
    setReceipts: (receipts: IReceipt[], isFirst: boolean) => void,
    switchToNextTable: () => void,
    switchToDone: () => void,
    setPersonName: (name: string, isFirst: boolean) => void,
    uploadFile: (files: FileList | null, isFirst: boolean) => Promise<void>,
    setCategories: (categories: string[]) => void,
}) {
    const {
        myName,
        otherName,
        isFirst,
        isInEditMode,
        myReceipts,
        categories,
        setReceipts,
        setIsInEditMode,
        switchToNextTable,
        switchToDone,
        setPersonName,
        uploadFile,
        setCategories
    } = props;

    const [reload, setReload] = useState<boolean>(false);

    useEffect(() => { if (reload) { setReload(!reload) } }, [reload])

    function selectCategory(receiptNum: number, itemNum: number, isFirstList: boolean, selectedCategory: string) {
        const receipts: IReceipt[] = myReceipts;
        setReceipts(ReceiptModifier.selectCategory(receipts, receiptNum, itemNum, selectedCategory), isFirstList);
    }

    function toggleRejectItem(receiptNum: number, itemNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = myReceipts;
        setReceipts(ReceiptModifier.toggleRejectItem(receipts, receiptNum, itemNum), isFirstList);
    }

    function toggleShareItem(receiptNum: number, itemNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = myReceipts;
        setReceipts(ReceiptModifier.toggleShareItem(receipts, receiptNum, itemNum), isFirstList);
    }

    function toggleMyItem(receiptNum: number, itemNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = myReceipts;
        setReceipts(ReceiptModifier.toggleMyItem(receipts, receiptNum, itemNum), isFirstList);
    }

    function toggleAllRejectedItems(receiptNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = myReceipts;
        setReceipts(ReceiptModifier.toggleAllRejectedItems(receipts, receiptNum), isFirstList);
    }

    function toggleAllSharedItems(receiptNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = myReceipts;
        setReceipts(ReceiptModifier.toggleAllSharedItems(receipts, receiptNum), isFirstList);
    }

    function toggleAllMyItems(receiptNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = myReceipts;
        setReceipts(ReceiptModifier.toggleAllMyItems(receipts, receiptNum), isFirstList);
    }

    function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
        uploadFile(e.target.files, isFirst).then(() => {
            e.target.value = '';
        });
    }

    function generateItemTableRows(myName: string, isFirst: boolean, receiptNum: number, isInEditMode: boolean, categories: string[]): JSX.Element[] {
        const keyChar: string = isFirst ? 'k' : 'n';
        let key: number = -1;
        const rows: JSX.Element[] = [];

        isInEditMode && rows.push(
            <TableRow
                key={myName + keyChar + key + 'newItemInReceipt'}
                rowType={"Item"}
                isNewRow={true}
                isEditable={isInEditMode}
                updateData={(newData: IEditableData): void => {
                    let updatedReceipts = JSON.parse(JSON.stringify(myReceipts)) as IReceipt[];
                    const newItem: IReceiptItem = {
                        name: newData.name,
                        price: newData.price,
                        amount: newData.amount,
                        category: DEFAULT_CATEGORY,
                        isMine: false,
                        isShared: true,
                        isRejected: false
                    }

                    updatedReceipts[receiptNum].isAllShared = false;
                    updatedReceipts[receiptNum].isAllRejected = false;
                    updatedReceipts[receiptNum].isAllMine = false;
                    updatedReceipts[receiptNum].totalPrice += newData.price;
                    updatedReceipts[receiptNum].items.push(newItem);

                    setReceipts([...updatedReceipts], isFirst);
                }}
            />
        );

        rows.push(...myReceipts[receiptNum].items.map((item, itemNum) => {
            key++;
            return (
                <TableRow
                    key={myName + keyChar + key}
                    editableData={{
                        name: item.name,
                        price: item.price,
                        amount: item.amount
                    }}
                    rowType={"Item"}
                    shareState={
                        isFirst && (item.isMine) || (!isFirst && item.isRejected)
                            ? "Left"
                            : (!isFirst && (item.isMine) || (isFirst && item.isRejected) ? "Right" : item.isShared ? "Shared" : undefined)
                    }
                    isNewRow={false}
                    categories={categories}
                    category={item.category}
                    isEditable={isInEditMode}
                    updateData={(newData: IEditableData): void => {
                        let updatedReceipts = JSON.parse(JSON.stringify(myReceipts)) as IReceipt[];

                        if (newData.name === '') {
                            updatedReceipts[receiptNum].items = updatedReceipts[receiptNum].items.filter((_, i) => i !== itemNum);
                        } else {
                            updatedReceipts[receiptNum].totalPrice = updatedReceipts[receiptNum].totalPrice - item.price + newData.price;
                            updatedReceipts[receiptNum].items[itemNum].name = newData.name;
                            updatedReceipts[receiptNum].items[itemNum].price = newData.price;
                            updatedReceipts[receiptNum].items[itemNum].amount = newData.amount;
                        }

                        setReceipts([...updatedReceipts], isFirst);
                    }}
                    setShareState={function (shareState: "Left" | "Shared" | "Right"): void {
                        switch (shareState) {
                            case "Left":
                                let updatedReceipts = JSON.parse(JSON.stringify(myReceipts)) as IReceipt[];

                                updatedReceipts = updatedReceipts.filter((_, i) => i !== receiptNum);
                                setReceipts([...updatedReceipts], isFirst);
                                if (isFirst) {
                                    toggleMyItem(receiptNum, itemNum, isFirst)
                                } else {
                                    toggleRejectItem(receiptNum, itemNum, isFirst)
                                }
                                break;
                            case "Shared":
                                toggleShareItem(receiptNum, itemNum, isFirst);
                                break;
                            case "Right":
                                if (isFirst) {
                                    toggleRejectItem(receiptNum, itemNum, isFirst)
                                } else {
                                    toggleMyItem(receiptNum, itemNum, isFirst)
                                }
                                break;
                        }
                    }}
                    setCategory={(category: string): void => {
                        selectCategory(receiptNum, itemNum, isFirst, category)
                    }}
                    updateCategories={(categories: string[]): void => setCategories(categories)}
                />
            )
        }));
        return rows;
    }

    return (
        <div className={[styles.receiptsTable].join(' ')}>
            <div className={styles.headerSplit}>
                <div className={[styles.leftSide].join(' ')}>
                    <h3>{<input className={[styles.personName].join(' ')} type={'text'} value={myName} placeholder={'New name...'} onChange={(e) => {
                        setPersonName(e.currentTarget.value, isFirst);
                    }} />
                    }&#39;s Receipts</h3>
                </div>
                <div className={[styles.rightSide].join(' ')}>

                </div>
                <div className={[styles.rightSide].join(' ')}>
                    <button className={[styles.fancyButton].join(' ')} onClick={(e) => {
                        if (typeof window !== null && typeof window !== undefined) {
                            window.document.getElementById(isFirst ? 'firstUpload' : 'secondUpload')!.click()
                        }
                    }}><ArrowUpCircle width={16} /> Upload</button>
                    <button className={[styles.fancyButton].join(' ')} onClick={() => {
                        setReceipts([], isFirst);
                    }}><X width={16} /> Clear</button>
                    <input type='file' id={isFirst ? 'firstUpload' : 'secondUpload'} accept='.csv, .xlsx' multiple={true} onChange={handleFileUpload} style={{ display: 'none' }} />
                    <hr />
                    <button className={[styles.fancyButton].join(' ')} onClick={() => {
                        const top = document.getElementById(isFirst + 'top-of-table');
                        if (top) {
                            top.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
                        }
                    }}><ArrowUp width={16} /> Top</button>
                    <button className={[styles.fancyButton].join(' ')} onClick={() => {
                        setIsInEditMode(!isInEditMode, isFirst);
                    }}><Pencil width={16} /> Edit</button>
                    {isFirst
                        ? <button className={[styles.fancyButton].join(' ')} onClick={() => {
                            switchToNextTable();
                        }}><UserRound width={16} />Next</button>
                        : <button className={[styles.fancyButton].join(' ')} onClick={() => {
                            switchToNextTable();
                        }}><UserRound width={16} />Prev</button>
                    }
                    <button className={[styles.fancyButton].join(' ')} onClick={() => {
                        switchToDone();
                    }}><Goal width={16} />Done</button>
                </div>
            </div>
            {!reload &&
                <div className={[styles.tableWrapper].join(' ')}>
                    <div id={isFirst + 'top-of-table'}></div>
                    <table className={[styles.table].join(' ')}>
                        <thead>
                            <tr>
                                <th>Item / Store Name</th>
                                <th>Price €</th>
                                <th>Amount</th>
                                <th >{isInEditMode ? 'Actions' : (isFirst ? myName : otherName)}</th>
                                {!isInEditMode && <th>Shared</th>}
                                {!isInEditMode && <th >{isFirst ? otherName : myName}</th>}
                                {!isInEditMode && <th >Category</th>}
                            </tr>
                        </thead>
                        <tbody>
                            <TableRow
                                rowType={"Receipt"}
                                isNewRow={true}
                                isEditable={isInEditMode}
                                updateData={(newData: IEditableData): void => {
                                    let updatedReceipts = JSON.parse(JSON.stringify(myReceipts)) as IReceipt[];
                                    const newReceipt: IReceipt = {
                                        store: newData.name,
                                        date: "",
                                        owner: myName,
                                        totalPrice: 0,
                                        items: [],
                                        categoryForAllItems: "None",
                                        isAllShared: false,
                                        isAllRejected: false,
                                        isAllMine: false
                                    };

                                    updatedReceipts.push(newReceipt);

                                    setReceipts([...updatedReceipts], isFirst);
                                }} />
                            <TableRow
                                rowType={"Item"}
                                isNewRow={true}
                                isEditable={isInEditMode}
                                updateData={(newData: IEditableData): void => {
                                    let updatedReceipts = JSON.parse(JSON.stringify(myReceipts)) as IReceipt[];

                                    const newReceipt: IReceipt = {
                                        store: newData.name,
                                        date: "",
                                        owner: myName,
                                        totalPrice: newData.price,
                                        items: [],
                                        categoryForAllItems: "None",
                                        isAllShared: true,
                                        isAllRejected: false,
                                        isAllMine: false
                                    };

                                    const newItem: IReceiptItem = {
                                        name: newData.name,
                                        price: newData.price,
                                        amount: newData.amount,
                                        category: DEFAULT_CATEGORY,
                                        isMine: false,
                                        isShared: true,
                                        isRejected: false
                                    }

                                    newReceipt.items.push(newItem);

                                    updatedReceipts.push(newReceipt);

                                    setReceipts([...updatedReceipts], isFirst);
                                }}
                            />
                            {...myReceipts.map((receipt, receiptNum) => {
                                return [<TableRow
                                    key={myName + receiptNum + 'ReceiptRow'}
                                    editableData={{
                                        name: receipt.store,
                                        price: receipt.totalPrice,
                                        amount: receipt.items.length
                                    }}
                                    rowType={"Receipt"}
                                    shareState={
                                        isFirst && (receipt.isAllMine) || (!isFirst && receipt.isAllRejected)
                                            ? "Left"
                                            : (!isFirst && (receipt.isAllMine) || (isFirst && receipt.isAllRejected) ? "Right" : receipt.isAllShared ? "Shared" : undefined)
                                    }
                                    isNewRow={false}
                                    isEditable={isInEditMode}
                                    updateData={(newData: IEditableData): void => {
                                        let updatedReceipts = JSON.parse(JSON.stringify(myReceipts)) as IReceipt[];

                                        if (newData.name === '') {
                                            updatedReceipts = updatedReceipts.filter((_, i) => i !== receiptNum);
                                        } else {
                                            updatedReceipts[receiptNum].store = newData.name;
                                        }

                                        setReceipts([...updatedReceipts], isFirst);
                                        newData.name === '' && setReload(true);
                                    }}
                                    setShareState={function (shareState: "Left" | "Shared" | "Right"): void {
                                        switch (shareState) {
                                            case "Left":
                                                if (isFirst) {
                                                    toggleAllMyItems(receiptNum, isFirst)
                                                } else {
                                                    toggleAllRejectedItems(receiptNum, isFirst)
                                                }
                                                break;
                                            case "Shared":
                                                toggleAllSharedItems(receiptNum, isFirst);
                                                break;
                                            case "Right":
                                                if (isFirst) {
                                                    toggleAllRejectedItems(receiptNum, isFirst)
                                                } else {
                                                    toggleAllMyItems(receiptNum, isFirst)
                                                }
                                                break;
                                        }
                                    }}
                                />, ...generateItemTableRows(myName, isFirst, receiptNum, isInEditMode, categories)];
                            })}
                        </tbody>
                    </table>
                </div>
            }
        </div >
    );
}
