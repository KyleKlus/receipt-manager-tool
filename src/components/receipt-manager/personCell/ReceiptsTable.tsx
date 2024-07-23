/** @format */
import styles from '@/styles/components/receipt-manager/personCell/ReceiptsTable.module.css'
import { IReceipt } from '@/interfaces/IReceipt';
import { IReceiptItem } from '@/interfaces/IReceiptItem';
import { Category } from "@/enums/Category";
import { Sailboat, Star, ArrowUp, ArrowUpCircle, Goal, Handshake, Pencil, UserRound, X } from 'lucide-react';
import * as ReceiptModifier from '@/handlers/ReceiptModifier';
import { ChangeEvent } from 'react';

export default function ReceiptsTable(props: {
    myName: string,
    myReceipts: IReceipt[],
    otherName: string,
    isFirst: boolean,
    isInEditMode: boolean,
    setIsInEditMode: (isInEditMode: boolean, isFirst: boolean) => void,
    setReceipts: (receipts: IReceipt[], isFirst: boolean) => void,
    switchToNextTable: () => void,
    switchToDone: () => void,
    setPersonName: (name: string, isFirst: boolean) => void,
    uploadFile: (files: FileList | null, isFirst: boolean) => Promise<void>,
}) {
    const {
        myName,
        otherName,
        isFirst,
        isInEditMode,
        myReceipts,
        setReceipts,
        setIsInEditMode,
        switchToNextTable,
        switchToDone,
        setPersonName,
        uploadFile
    } = props;

    function selectCategory(receiptNum: number, itemNum: number, isFirstList: boolean, selectedCategory: Category) {
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

    function selectCategoryForAllItems(receiptNum: number, isFirstList: boolean, selectedCategory: Category) {
        const receipts: IReceipt[] = myReceipts;
        setReceipts(ReceiptModifier.selectCategoryForAllItems(receipts, receiptNum, selectedCategory), isFirstList);
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

    function generateTableRows(isFirst: boolean, myReceipts: IReceipt[]): JSX.Element[] {
        const keyChar: string = isFirst ? 'k' : 'n';
        let key: number = -1;
        const rows: JSX.Element[] = [];

        for (let receiptNum: number = 0; receiptNum < myReceipts.length; receiptNum++) {
            const receipt: IReceipt = myReceipts[receiptNum];
            const receiptItems: IReceiptItem[] = receipt.items;
            key++;

            rows.push(
                <tr key={keyChar + key}>
                    <td className={[styles.personTableCellHeader].join(' ')}>
                        {receipt.store}
                    </td>
                    <td className={[styles.personTableCellHeader].join(' ')}>
                        {receipt.totalPrice.toFixed(2) + ' €'}
                    </td>
                    <td className={[styles.personTableCellHeader].join(' ')}>{''}</td>
                    {isFirst &&
                        <td className={[styles.personTableCellHeader].join(' ')}>
                            <button
                                className={[
                                    styles.toggleButton,
                                    receipt.isAllMine ? styles.isSelected : ''
                                ].join(' ')}
                                onClick={() => { toggleAllMyItems(receiptNum, isFirst) }}>
                                <Sailboat size={16} />
                            </button>

                            {/* <input checked={receipt.isAllMine} type='radio' onChange={() => { toggleAllMyItems(receiptNum, isFirst) }} /> */}
                        </td>
                    }
                    {!isFirst &&
                        <td className={[styles.personTableCellHeader].join(' ')}>
                            <button
                                className={[
                                    styles.toggleButton,
                                    receipt.isAllRejected ? styles.isSelected : ''
                                ].join(' ')}
                                onClick={() => { toggleAllRejectedItems(receiptNum, isFirst) }}>
                                <Sailboat size={16} />
                            </button>
                        </td>
                    }
                    <td className={[styles.personTableCellHeader].join(' ')}>
                        <button
                            className={[
                                styles.toggleButton,
                                receipt.isAllShared ? styles.isSelected : ''
                            ].join(' ')}
                            onClick={() => { toggleAllSharedItems(receiptNum, isFirst) }}>
                            <Handshake size={16} />
                        </button>
                    </td>
                    {!isFirst &&
                        <td className={[styles.personTableCellHeader].join(' ')}>
                            <button
                                className={[
                                    styles.toggleButton,
                                    receipt.isAllMine ? styles.isSelected : ''
                                ].join(' ')}
                                onClick={() => { toggleAllMyItems(receiptNum, isFirst) }}>
                                <Star size={16} />
                            </button>
                        </td>
                    }
                    {isFirst &&
                        <td className={[styles.personTableCellHeader].join(' ')}>
                            <button
                                className={[
                                    styles.toggleButton,
                                    receipt.isAllRejected ? styles.isSelected : ''
                                ].join(' ')}
                                onClick={() => { toggleAllRejectedItems(receiptNum, isFirst) }}>
                                <Star size={16} />
                            </button>
                        </td>
                    }
                    <td className={[styles.personTableCellHeader].join(' ')}>
                    </td>
                </tr>
            );

            rows.push(...receiptItems.map((item, itemNum) => {
                key++;
                return (
                    <tr key={keyChar + key}>
                        <td className={[].join(' ')}>
                            {item.name}
                        </td>
                        <td className={[].join(' ')}>
                            {item.price.toFixed(2) + ' €'}
                        </td>
                        <td className={[].join(' ')}>{item.amount}
                        </td>
                        {isFirst &&
                            <td className={[].join(' ')}>
                                <button
                                    className={[
                                        styles.toggleButton,
                                        item.isMine ? styles.isSelected : ''
                                    ].join(' ')}
                                    onClick={() => { toggleMyItem(receiptNum, itemNum, isFirst) }}>
                                    <Sailboat size={16} />
                                </button>
                            </td>
                        }
                        {!isFirst &&
                            <td className={[].join(' ')}>
                                <button
                                    className={[
                                        styles.toggleButton,
                                        item.isRejected ? styles.isSelected : ''
                                    ].join(' ')}
                                    onClick={() => { toggleRejectItem(receiptNum, itemNum, isFirst) }}>
                                    <Sailboat size={16} />
                                </button>
                            </td>
                        }
                        <td className={[].join(' ')}>
                            <button
                                className={[
                                    styles.toggleButton,
                                    item.isShared ? styles.isSelected : ''
                                ].join(' ')}
                                onClick={() => { toggleShareItem(receiptNum, itemNum, isFirst) }}>
                                <Handshake size={16} />
                            </button>
                        </td>
                        {!isFirst &&
                            <td className={[].join(' ')}>
                                <button
                                    className={[
                                        styles.toggleButton,
                                        item.isMine ? styles.isSelected : ''
                                    ].join(' ')}
                                    onClick={() => { toggleMyItem(receiptNum, itemNum, isFirst) }}>
                                    <Star size={16} />
                                </button>
                            </td>
                        }
                        {isFirst &&
                            <td className={[].join(' ')}>
                                <button
                                    className={[
                                        styles.toggleButton,
                                        item.isRejected ? styles.isSelected : ''
                                    ].join(' ')}
                                    onClick={() => { toggleRejectItem(receiptNum, itemNum, isFirst) }}>
                                    <Star size={16} />
                                </button>

                            </td>
                        }
                        <td className={[].join(' ')}>
                            <select defaultValue={Category[item.category]} onChange={(e) => {
                                // Parse the category from the select event
                                const categoryName: string = e.currentTarget.value;
                                const categoryIndex: number = (Object.keys(Category) as Array<keyof typeof Category>)
                                    .slice((Object.keys(Category).length / 2))
                                    .map((key) => { return key.toString() })
                                    .indexOf(categoryName);
                                const selectedCategory: Category = categoryIndex;
                                selectCategory(receiptNum, itemNum, isFirst, selectedCategory)
                            }}>
                                {(Object.keys(Category) as Array<keyof typeof Category>)
                                    .slice((Object.keys(Category).length / 2))
                                    .map((key, n) => { return (<option key={n} value={key}>{key}</option>) })}
                            </select>
                        </td>
                    </tr>
                )
            }));
            key++;
        }
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
            <div className={[styles.tableWrapper].join(' ')}>
                <div id={isFirst + 'top-of-table'}></div>
                <table className={[styles.table].join(' ')}>
                    <thead>
                        <tr>
                            <th>Item / Store Name</th>
                            <th>Price €</th>
                            <th>Amount</th>
                            <th >{isFirst ? myName : otherName}</th>
                            <th>Shared</th>
                            <th >{isFirst ? otherName : myName}</th>
                            <th >Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {...generateTableRows(isFirst, myReceipts)}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
