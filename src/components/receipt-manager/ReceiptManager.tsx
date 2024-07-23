/** @format */
import styles from '@/styles/components/receipt-manager/ReceiptManager.module.css';
import { useEffect, useState } from 'react';
import { IReceipt } from '@/interfaces/IReceipt';
import ReceiptsTable from '@/components/receipt-manager/personCell/ReceiptsTable';
import useStorage from '@/hooks/useStorage';
import * as UploadHandler from '@/handlers/UploadHandler';
import { IExcelImportData } from '@/handlers/UploadHandler';
import EditReceiptsTable from './personCell/EditReceiptsTable';
import PersonCard from './personCell/PersonCard';
import { ArrowLeft, Download } from 'lucide-react';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import * as DownloadHandler from '@/handlers/DownloadHandler';
import * as Calculator from '@/handlers/Calculator';
import { IResult } from '@/interfaces/IResult';
import { defaultCategories } from '@/enums/Category';

export default function ReceiptManager(props: {
}) {
    const {
    } = props;

    const storage = useStorage();
    const [showFirstTable, setShowFirstTable] = useState<boolean>(true);
    const [isDone, setIsDone] = useState<boolean>(false);

    const [firstPersonName, setFirstPersonName] = useState<string>('');
    const [firstReceipts, setFirstReceipts] = useState<IReceipt[]>([]);
    const [isFristInEditMode, setIsFirstInEditMode] = useState<boolean>(false);

    const [secondPersonName, setSecondPersonName] = useState<string>('');
    const [secondReceipts, setSecondReceipts] = useState<IReceipt[]>([]);
    const [isSecondInEditMode, setIsSecondInEditMode] = useState<boolean>(false);

    const [isLocalDataLoaded, setIsLocalDataLoaded] = useState<boolean>(false);
    const [categories, setCategories] = useState(Object.keys(defaultCategories));

    useEffect(() => {
        // Load saved data
        loadDataFromLocalStorage()
    });

    function completeMissingCategories(receipts: IReceipt[]) {
        receipts.forEach((receipt) => {
            receipt.items.forEach((item) => {
                const doesCategoryExist = categories.find((key) => key === item.category);
                if (doesCategoryExist === undefined) {
                    setCategories([...categories, item.category]);
                }
            });
        });
    }

    function loadDataFromLocalStorage() {
        if (isLocalDataLoaded || !storage.isBrowser) { return; }

        if (storage.isItemSet('firstName', 'local')) {
            const firstName = storage.getItem('firstName', 'local');
            setFirstPersonName(firstName);
        }

        if (storage.isItemSet('secondName', 'local')) {
            const secondName = storage.getItem('secondName', 'local');
            setSecondPersonName(secondName);
        }

        if (storage.isItemSet('firstReceipts', 'local')) {
            const firstReceipts = storage.getItem('firstReceipts', 'local');
            const receipts = JSON.parse(firstReceipts) as IReceipt[];

            completeMissingCategories(receipts);
            setFirstReceipts(receipts);
        }

        if (storage.isItemSet('secondReceipts', 'local')) {
            const secondReceipts = storage.getItem('secondReceipts', 'local');
            const receipts = JSON.parse(secondReceipts) as IReceipt[];

            completeMissingCategories(receipts);

            setSecondReceipts(receipts);
        }

        setIsLocalDataLoaded(true);
    }

    function saveFirstReceipts(receipts: IReceipt[]) {
        storage.setItem('firstReceipts', JSON.stringify(receipts), 'local')
        setFirstReceipts(receipts);
    }

    function saveFirstPersonName(name: string) {
        storage.setItem('firstName', name, 'local')
        setFirstPersonName(name);
    }

    function saveSecondReceipts(receipts: IReceipt[]) {
        storage.setItem('secondReceipts', JSON.stringify(receipts), 'local')
        setSecondReceipts(receipts);
    }

    function saveSecondPersonName(name: string) {
        storage.setItem('secondName', name, 'local')
        setSecondPersonName(name);
    }

    function getReceipts(isFirstList: boolean): IReceipt[] {
        return isFirstList ? firstReceipts.slice(0) : secondReceipts.slice(0);
    }

    function setReceipts(receipts: IReceipt[], isFirstList: boolean) {
        if (isFirstList) {
            saveFirstReceipts([...receipts]);
        } else {
            saveSecondReceipts([...receipts]);
        }
    }

    function setIsInEditMode(isInEditMode: boolean, isFirst: boolean) {
        if (isFirst) {
            setIsFirstInEditMode(isInEditMode);
        } else {
            setIsSecondInEditMode(isInEditMode);
        }
    }

    // --- shared ---
    const sharedExpensesFromFirst = Calculator.calcSharedExpenses(firstReceipts);
    const sharedExpensesFromSecond: BigNumber = Calculator.calcSharedExpenses(secondReceipts);
    const sharedExpenses = parseFloat(sharedExpensesFromFirst.plus(sharedExpensesFromSecond).toFixed(2));

    // --- First ---
    const firstExpensesFromFirst: number = parseFloat(Calculator.calcPersonalExpenses(firstReceipts).toFixed(2));
    const firstExpensesFromSecond: number = parseFloat(Calculator.calcRejectedExpenses(secondReceipts).toFixed(2));

    const firstTotalExpenses: number = parseFloat(BigNumber(sharedExpenses).plus(firstExpensesFromFirst).plus(firstExpensesFromSecond).multipliedBy(-1).toFixed(2));
    // --- Second ---
    const secondExpensesFromFirst: number = parseFloat(Calculator.calcRejectedExpenses(firstReceipts).toFixed(2));
    const secondExpensesFromSecond: number = parseFloat(Calculator.calcPersonalExpenses(secondReceipts).toFixed(2));

    const secondTotalExpenses: number = parseFloat(BigNumber(sharedExpenses).plus(secondExpensesFromFirst).plus(secondExpensesFromSecond).multipliedBy(-1).toFixed(2));
    // --- Final Calculation ---
    const firstPaidValue: number = parseFloat(Calculator.calcReceiptsExpenses(firstReceipts).toFixed(2));
    const firstLeftOverExpenses = parseFloat(BigNumber(firstPaidValue).plus(firstTotalExpenses).toFixed(2)); // minus == schulden & plus === bekomme geld
    const secondPaidValue: number = parseFloat(Calculator.calcReceiptsExpenses(secondReceipts).toFixed(2));
    const secondLeftOverExpenses = parseFloat(BigNumber(secondPaidValue).plus(secondTotalExpenses).toFixed(2));
    // --- Result ---
    const result: number = secondLeftOverExpenses <= 0 ? firstLeftOverExpenses : secondLeftOverExpenses; // Negative number means second

    function handleDownLoad() {
        const isPayerFirstPerson: boolean = firstLeftOverExpenses <= 0;
        const resultData: IResult = {
            payerName: isPayerFirstPerson ? firstPersonName : secondPersonName,
            receiverName: isPayerFirstPerson ? secondPersonName : firstPersonName,
            payerExpenses: isPayerFirstPerson ? firstTotalExpenses : secondTotalExpenses,
            receiverExpenses: isPayerFirstPerson ? secondTotalExpenses : firstTotalExpenses,
            sharedFromPayer: isPayerFirstPerson ? sharedExpensesFromFirst.toNumber() : sharedExpensesFromSecond.toNumber(),
            sharedFromReceiver: isPayerFirstPerson ? sharedExpensesFromSecond.toNumber() : sharedExpensesFromFirst.toNumber(),
            payerItemsFromPayer: isPayerFirstPerson ? firstExpensesFromFirst : secondExpensesFromSecond,
            receiverItemsFromReceiver: isPayerFirstPerson ? secondExpensesFromSecond : firstExpensesFromFirst,
            receiverItemsFromPayer: isPayerFirstPerson ? secondExpensesFromFirst : firstExpensesFromSecond,
            payerItemsFromReceiver: isPayerFirstPerson ? firstExpensesFromSecond : secondExpensesFromFirst,
            result: result
        };

        DownloadHandler.downloadEXCEL('Expenses_' + moment().format('DD_MM_YYYY'), firstPersonName, secondPersonName, firstReceipts.slice(0), secondReceipts.slice(0), resultData);
    }

    async function uploadFile(files: FileList | null, isFirst: boolean): Promise<void> {
        if (files === null || files === undefined) { return; }

        for (let i = 0; i < files.length; i++) {
            if (files[i].name.endsWith('csv')) {
                const receipts = getReceipts(isFirst).concat(await UploadHandler.parseCSVToReceipts(files[i], isFirst ? firstPersonName : secondPersonName));
                setReceipts(receipts, isFirst);
            } else if (files[i].name.endsWith('xlsx')) {
                const excelImportData: IExcelImportData = await UploadHandler.parseXLSXToReceipts(files[i]);

                completeMissingCategories(excelImportData.firstReceipts);
                completeMissingCategories(excelImportData.secondReceipts);

                if (firstPersonName === excelImportData.firstName) {
                    setReceipts(excelImportData.firstReceipts, true);
                    setReceipts(excelImportData.secondReceipts, false);
                } else if (secondPersonName === excelImportData.firstName) {
                    setReceipts(excelImportData.firstReceipts, false);
                    setReceipts(excelImportData.secondReceipts, true);
                }
            }
        }
    }

    function getReceiptsTable(isInEditMode: boolean, myName: string, otherName: string, isFirst: boolean, myReceipts: IReceipt[], otherReceipts: IReceipt[]): JSX.Element {
        return isInEditMode
            ? <EditReceiptsTable
                myName={myName}
                isFirst={isFirst}
                myReceipts={myReceipts}
                setReceipts={setReceipts}
                isInEditMode={isInEditMode}
                setIsInEditMode={setIsInEditMode}
                uploadFile={uploadFile}
                switchToNextTable={() => {
                    setShowFirstTable(!isFirst);
                }}
                switchToDone={() => {
                    setIsDone(true);
                }}
                setPersonName={(name: string, isFirst: boolean) => {
                    if (isFirst) {
                        saveFirstPersonName(name);
                    } else {
                        saveSecondPersonName(name);
                    }
                }}
                otherReceipts={otherReceipts} />
            : <ReceiptsTable
                myName={myName}
                categories={categories}
                otherName={otherName}
                isFirst={isFirst}
                myReceipts={myReceipts}
                setReceipts={setReceipts}
                isInEditMode={isInEditMode}
                setIsInEditMode={setIsInEditMode}
                uploadFile={uploadFile}
                switchToDone={() => {
                    setIsDone(true);
                }}
                switchToNextTable={() => {
                    setShowFirstTable(!isFirst);
                }}
                setPersonName={(name: string, isFirst: boolean) => {
                    if (isFirst) {
                        saveFirstPersonName(name)
                    } else {
                        saveSecondPersonName(name)
                    }
                }}
            />
            ;
    }

    return (
        <>
            {isLocalDataLoaded
                ? <div className={[styles.receiptManager, isDone ? styles.isDone : ''].join(' ')}>
                    {!isDone && showFirstTable &&
                        getReceiptsTable(isFristInEditMode, firstPersonName, secondPersonName, true, firstReceipts, secondReceipts)
                    }
                    {!isDone && !showFirstTable &&
                        getReceiptsTable(isSecondInEditMode, secondPersonName, firstPersonName, false, secondReceipts, firstReceipts)
                    }
                    {isDone &&
                        <div className={[styles.split].join(' ')}>
                            <PersonCard
                                myName={firstPersonName}
                                myReceipts={firstReceipts}
                                otherReceipts={secondReceipts}
                            />
                            <PersonCard
                                myName={secondPersonName}
                                myReceipts={secondReceipts}
                                otherReceipts={firstReceipts}
                            />
                        </div>
                    }
                    {isDone &&
                        <div className={[styles.split].join(' ')}>
                            <button
                                className={[styles.fancyButton, styles.backButton].join(' ')}
                                onClick={() => {
                                    setIsDone(false);
                                }}
                            >
                                <ArrowLeft width={20} />Back
                            </button>
                            <button
                                disabled={
                                    firstReceipts.length === 0 &&
                                    secondReceipts.length === 0
                                }
                                className={[styles.fancyButton, styles.backButton].join(' ')}
                                onClick={handleDownLoad}
                            >
                                <Download width={20} /> Export
                            </button>
                        </div>}
                </div>
                : <div style={{ backgroundColor: 'var(--bg-color-00)' }}></div>
            }
        </>
    );
}
