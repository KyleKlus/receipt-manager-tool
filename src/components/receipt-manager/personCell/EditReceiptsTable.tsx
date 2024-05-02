/** @format */
import styles from '@/styles/components/receipt-manager/personCell/ReceiptsTable.module.css'
import { IReceipt } from '@/interfaces/IReceipt';
import { IReceiptItem } from '@/interfaces/IReceiptItem';
import { Category, DEFAULT_CATEGORY } from "@/enums/Category";
import { Pencil, Plus, Save, Table, X } from 'lucide-react';
import * as ReceiptModifier from '@/handlers/ReceiptModifier';
import { useState } from 'react';
import moment from 'moment';
import EditableTableRow from './EditableTableRow';
import BigNumber from 'bignumber.js';

export default function ReceiptsTable(props: {
    myName: string,
    isFirst: boolean,
    isInEditMode: boolean,
    myReceipts: IReceipt[],
    setReceipts: (receipts: IReceipt[], isFirst: boolean) => void,
    setIsInEditMode: (isInEditMode: boolean, isFirst: boolean) => void,
    switchToNextTable: () => void
}) {
    const {
        myName,
        isFirst,
        myReceipts,
        isInEditMode,
        setReceipts,
        setIsInEditMode,
        switchToNextTable
    } = props;

    const [newItemStore, setNewItemStore] = useState<string>('');

    function setItemPrice(receiptNum: number, itemNum: number, isFirstList: boolean, newPrice: number) {
        const receipts: IReceipt[] = myReceipts;
        setReceipts(ReceiptModifier.setItemPrice(receipts, receiptNum, itemNum, newPrice), isFirstList);
    }

    function setItemAmount(receiptNum: number, itemNum: number, isFirstList: boolean, amount: number) {
        const receipts: IReceipt[] = myReceipts;
        setReceipts(ReceiptModifier.setItemAmount(receipts, receiptNum, itemNum, amount), isFirstList);
    }

    function setItemName(receiptNum: number, itemNum: number, isFirstList: boolean, name: string) {
        const receipts: IReceipt[] = myReceipts;
        setReceipts(ReceiptModifier.setItemName(receipts, receiptNum, itemNum, name), isFirstList);
    }

    function setStoreName(receiptNum: number, isFirstList: boolean, store: string) {
        const receipts: IReceipt[] = myReceipts;
        setReceipts(ReceiptModifier.setStoreName(receipts, receiptNum, store), isFirstList);
    }

    function deleteItem(receiptNum: number, itemNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = myReceipts;
        setReceipts(ReceiptModifier.deleteItem(receipts, receiptNum, itemNum), isFirstList);
    }

    function deleteReceipt(receiptNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = myReceipts;
        setReceipts(ReceiptModifier.deleteReceipt(receipts, receiptNum), isFirstList);
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
                        <input className={[styles.bigTextInput].join(' ')} type={'text'} value={receipt.store} placeholder={'Store name'}
                            onChange={(e) => {
                                setStoreName(receiptNum, isFirst, e.currentTarget.value);
                            }}
                        />
                    </td>
                    <td className={[styles.personTableCellHeader].join(' ')}>
                        {receipt.totalPrice + ' €'}</td>
                    <td className={[styles.personTableCellHeader].join(' ')}>{''}</td>
                    <td className={[styles.personTableCellHeader].join(' ')}>
                        <button className={styles.fancyButton} onClick={() => {
                            deleteReceipt(receiptNum, isFirst);
                        }}><X /> Delete</button>
                    </td>
                </tr>
            );

            rows.push(
                <EditableTableRow isFirst={isFirst} myReceipts={myReceipts} receiptNum={receiptNum} setReceipts={setReceipts} />
            )

            rows.push(...receiptItems.map((item, itemNum) => {
                key++;
                return (
                    <tr key={keyChar + key}>
                        <td className={[].join(' ')}>
                            <input className={[styles.textInput].join(' ')} type={'text'} value={item.name} placeholder={'Item name'}
                                onChange={(e) => {
                                    setItemName(receiptNum, itemNum, isFirst, e.currentTarget.value);
                                }}
                            />
                        </td>
                        <td className={[].join(' ')}>
                            <input className={[styles.textInput].join(' ')} type='number' value={item.price} placeholder={'Item price'}
                                onChange={(e) => {
                                    setItemPrice(receiptNum, itemNum, isFirst, e.currentTarget.valueAsNumber);
                                }}
                            />
                        </td>
                        <td className={[].join(' ')}>
                            <input className={[styles.textInput].join(' ')} type={'number'} value={item.amount} placeholder={'Item amount'}
                                onChange={(e) => {
                                    setItemAmount(receiptNum, itemNum, isFirst, e.currentTarget.valueAsNumber);
                                }}
                            />
                        </td>
                        <td className={[].join(' ')}>
                            <button className={styles.fancyButton} onClick={() => {
                                deleteItem(receiptNum, itemNum, isFirst);
                            }}><X /> Delete</button>
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
                    <h2>{myName} Receipts</h2>
                </div>
                <div className={[styles.rightSide].join(' ')}>
                    <button className={[styles.fancyButton].join(' ')} onClick={() => {
                        setIsInEditMode(!isInEditMode, isFirst);
                    }}><Save width={16} /> Save</button>
                    {isFirst
                        ? <button className={[styles.fancyButton].join(' ')} onClick={() => {
                            switchToNextTable();
                        }}><Table width={16} />Next</button>
                        : <button className={[styles.fancyButton].join(' ')} onClick={() => {
                            switchToNextTable();
                        }}><Table width={16} />Prev</button>
                    }
                </div>
            </div>
            <div className={[styles.tableWrapper].join(' ')}>
                <table className={[styles.table].join(' ')}>
                    <thead>
                        <tr>
                            <th>Item / Store Name</th>
                            <th>Price €</th>
                            <th>Amount</th>
                            <th >Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr >
                            <td className={[styles.personTableCellHeader].join(' ')}>
                                <input className={[styles.bigTextInput].join(' ')} type={'text'} value={newItemStore} placeholder={'Store name'}
                                    onChange={(e) => {
                                        setNewItemStore(e.currentTarget.value);
                                    }}
                                />
                            </td>
                            <td className={[styles.personTableCellHeader].join(' ')}>
                            </td>
                            <td className={[styles.personTableCellHeader].join(' ')}>{''}</td>
                            <td className={[styles.personTableCellHeader].join(' ')}>
                                <button className={styles.fancyButton} onClick={() => {
                                    const tmpReceipts = myReceipts.slice(0);
                                    tmpReceipts.push({
                                        store: newItemStore,
                                        owner: myName,
                                        date: moment().format('DD.MM.YYYY'),
                                        totalPrice: 0,
                                        items: [],
                                        categoryForAllItems: DEFAULT_CATEGORY,
                                        isAllShared: false,
                                        isAllRejected: false,
                                        isAllMine: false
                                    })
                                    setReceipts(tmpReceipts, isFirst);
                                    setNewItemStore('');
                                }}><Plus /> Add</button>
                            </td>
                        </tr>
                        {...generateTableRows(isFirst, myReceipts)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
