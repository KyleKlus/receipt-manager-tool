/** @format */
import styles from '@/styles/components/receipt-manager/personCell/PersonCard.module.css';
import { ChangeEvent, useEffect, useState } from 'react';
import { IReceiptItem } from '@/interfaces/IReceiptItem';
import { IReceipt } from '@/interfaces/IReceipt';
import * as DownloadHandler from '@/handlers/DownloadHandler';
import * as Calculator from '@/handlers/Calculator';
import ReceiptsOverview from './ReceiptsOverview';
import moment from 'moment';
import { IResult } from '@/interfaces/IResult';
import { Download, Plus, Upload, X, Pencil } from 'lucide-react';
import { DEFAULT_CATEGORY } from '@/enums/Category';
import BigNumber from 'bignumber.js';

export default function PersonCard(props: {
    myName: string,
    otherName: string,
    isFirst: boolean,
    myReceipts: IReceipt[],
    otherReceipts: IReceipt[],
    setPersonName: (name: string, isFirst: boolean) => void,
    setReceipts: (receipts: IReceipt[], isFirst: boolean) => void,
    uploadFile: (files: FileList | null, isFirst: boolean) => Promise<void>,
}) {
    const {
        myName,
        otherName,
        isFirst,
        myReceipts,
        otherReceipts,
        setPersonName,
        setReceipts,
        uploadFile,
    } = props;

    const [newItemStore, setNewItemStore] = useState<string>('');
    const [newItemName, setNewItemName] = useState<string>('');
    const [newItemPrice, setNewItemPrice] = useState<number>(NaN);
    const [newItemAmount, setNewItemAmount] = useState<number>(1);

    // --- shared ---
    const sharedExpensesFromMe = Calculator.calcSharedExpenses(myReceipts);
    const sharedExpensesFromOther: BigNumber = Calculator.calcSharedExpenses(otherReceipts);
    const sharedExpenses = parseFloat(sharedExpensesFromMe.plus(sharedExpensesFromOther).toFixed(2));

    // --- Me ---
    const myExpensesFromMe: number = parseFloat(Calculator.calcPersonalExpenses(myReceipts).toFixed(2));
    const myExpensesFromOther: number = parseFloat(Calculator.calcRejectedExpenses(otherReceipts).toFixed(2));

    const myTotalExpenses: number = parseFloat(BigNumber(sharedExpenses).plus(myExpensesFromMe).plus(myExpensesFromOther).multipliedBy(-1).toFixed(2));
    // --- Other ---
    const otherExpensesFromMe: number = parseFloat(Calculator.calcRejectedExpenses(myReceipts).toFixed(2));
    const otherExpensesFromOther: number = parseFloat(Calculator.calcPersonalExpenses(otherReceipts).toFixed(2));

    const otherTotalExpenses: number = parseFloat(BigNumber(sharedExpenses).plus(otherExpensesFromMe).plus(otherExpensesFromOther).multipliedBy(-1).toFixed(2));
    // --- Final Calculation ---
    const myPaidValue: number = parseFloat(Calculator.calcReceiptsExpenses(myReceipts).toFixed(2));
    const myLeftOverExpenses = parseFloat(BigNumber(myPaidValue).plus(myTotalExpenses).toFixed(2)); // minus == schulden & plus === bekomme geld
    const otherPaidValue: number = parseFloat(Calculator.calcReceiptsExpenses(otherReceipts).toFixed(2));
    const otherLeftOverExpenses = parseFloat(BigNumber(otherPaidValue).plus(otherTotalExpenses).toFixed(2));
    // --- Result ---
    const result: number = otherLeftOverExpenses <= 0 ? myLeftOverExpenses : otherLeftOverExpenses; // Negative number means other

    function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
        uploadFile(e.target.files, isFirst).then(() => {
            e.target.value = '';
        });
    }

    function handleAddItem() {
        if (newItemStore === '' || newItemName === '' || newItemPrice === 0 || newItemAmount < 0.01 || !Number.isInteger(newItemAmount)) { return }
        const tmpReceipts: IReceipt[] = myReceipts.slice(0);
        const newItem: IReceiptItem = {
            name: newItemName,
            price: newItemPrice,
            amount: newItemAmount,
            isMine: false,
            isShared: true,
            isRejected: false,
            category: DEFAULT_CATEGORY
        }

        const newReceipt: IReceipt = {
            store: newItemStore,
            owner: myName,
            date: moment().format('DD.MM.YYYY'),
            totalPrice: newItemPrice,
            items: [newItem],
            categoryForAllItems: DEFAULT_CATEGORY,
            isAllShared: false,
            isAllRejected: false,
            isAllMine: false
        }

        tmpReceipts.push(newReceipt)

        setReceipts([...tmpReceipts], isFirst)
        setNewItemStore('');
        setNewItemName('');
        setNewItemPrice(NaN);
        setNewItemAmount(1);
    }

    function handleDownLoad() {
        const isPayerMe: boolean = myLeftOverExpenses <= 0;
        const resultData: IResult = {
            payerName: isPayerMe ? myName : otherName,
            receiverName: isPayerMe ? otherName : myName,
            payerExpenses: isPayerMe ? myTotalExpenses : otherTotalExpenses,
            receiverExpenses: isPayerMe ? otherTotalExpenses : myTotalExpenses,
            sharedFromPayer: isPayerMe ? sharedExpensesFromMe.toNumber() : sharedExpensesFromOther.toNumber(),
            sharedFromReceiver: isPayerMe ? sharedExpensesFromOther.toNumber() : sharedExpensesFromMe.toNumber(),
            payerItemsFromPayer: isPayerMe ? myExpensesFromMe : otherExpensesFromOther,
            receiverItemsFromReceiver: isPayerMe ? otherExpensesFromOther : myExpensesFromMe,
            receiverItemsFromPayer: isPayerMe ? otherExpensesFromMe : myExpensesFromOther,
            payerItemsFromReceiver: isPayerMe ? myExpensesFromOther : otherExpensesFromMe,
            result: result
        };

        DownloadHandler.downloadEXCEL('Expenses_' + moment().format('DD_MM_YYYY'), myName, otherName, myReceipts.slice(0), props.otherReceipts.slice(0), resultData);
    }

    return (
        <div className={[styles.personCard].join(' ')}>
            <input className={[styles.personName].join(' ')} type={'text'} value={myName} placeholder={'Name'} onChange={(e) => {
                setPersonName(e.currentTarget.value, isFirst);
            }} />
            <ReceiptsOverview
                myName={myName}
                myReceiptsExpenses={myPaidValue}
                myTotalExpenses={myTotalExpenses}
                result={myLeftOverExpenses}
            />
            <div className={[styles.fileControls].join(' ')}>
                <button className={[styles.fancyButton].join('')} onClick={() => {
                    if (typeof window !== null && typeof window !== undefined) {
                        window.document.getElementById(isFirst ? 'firstUpload' : 'secondUpload')!.click()
                    }
                }}>
                    <Upload width={16} /> Upload
                </button>
                <button disabled={myReceipts.length === 0 && otherReceipts.length === 0} className={[styles.fancyButton].join('')} onClick={handleDownLoad}>
                    <Download width={16} /> Export
                </button>

                <button className={[styles.fancyButton].join('')} onClick={() => {
                    setReceipts([], isFirst);
                }}>
                    <X width={16} /> Clear
                </button>
                <input type='file' id={isFirst ? 'firstUpload' : 'secondUpload'} accept='.csv, .xlsx' multiple={true} onChange={handleFileUpload} style={{ display: 'none' }} />
            </div>
            <div className={[styles.personAddItemWrapper].join(' ')}>
                <input placeholder='Store' type='text' value={newItemStore}
                    onKeyDown={(k) => {
                        if (k.key === 'Enter') {
                            handleAddItem();
                        }
                    }}
                    onChange={(e) => {
                        setNewItemStore(e.target.value)
                    }}
                />
                <input placeholder='Name' type='text' value={newItemName}
                    onKeyDown={(k) => {
                        if (k.key === 'Enter') {
                            handleAddItem();
                        }
                    }}
                    onChange={(e) => {
                        setNewItemStore(e.target.value)
                        setNewItemName(e.target.value)
                    }} />
                <div className={[styles.hBox].join(' ')}>
                    <input placeholder='Amount' type='number' value={Number.isNaN(newItemAmount) ? '' : newItemAmount} step="1" min="1"
                        onKeyDown={(k) => {
                            if (k.key === 'Enter') {
                                handleAddItem();
                            }
                        }}
                        onChange={(e) => {
                            setNewItemAmount(e.target.valueAsNumber)
                        }} />
                    <input placeholder='Price' type='number' value={Number.isNaN(newItemPrice) ? '' : newItemPrice}
                        onKeyDown={(k) => {
                            if (k.key === 'Enter') {
                                handleAddItem();
                            }
                        }}
                        onChange={(e) => {
                            setNewItemPrice(e.target.valueAsNumber)
                        }} />
                    <button className={[styles.fancyButton].join('')} onClick={() => {
                        handleAddItem();
                    }}><Plus width={16} /> Add</button>
                </div>
            </div>
        </div>
    );
}
