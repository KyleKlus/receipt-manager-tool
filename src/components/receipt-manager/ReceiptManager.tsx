/** @format */
import styles from '@/styles/components/receipt-manager/ReceiptManager.module.css';
import { useEffect, useState } from 'react';
import { IReceipt } from '@/interfaces/IReceipt';
import PersonCard from '@/components/receipt-manager/personCell/PersonCard';
import ReceiptsTable from '@/components/receipt-manager/personCell/ReceiptsTable';
import useStorage from '@/hooks/useStorage';
import * as UploadHandler from '@/handlers/UploadHandler';
import { IExcelImportData } from '@/handlers/UploadHandler';
import EditReceiptsTable from './personCell/EditReceiptsTable';

export default function ReceiptManager(props: {
}) {
    const {
    } = props;

    const storage = useStorage();
    const [showFirstTable, setShowFirstTable] = useState<boolean>(true);

    const [firstPersonName, setFirstPersonName] = useState<string>('');
    const [firstReceipts, setFirstReceipts] = useState<IReceipt[]>([]);
    const [isFristInEditMode, setIsFirstInEditMode] = useState<boolean>(false);

    const [secondPersonName, setSecondPersonName] = useState<string>('');
    const [secondReceipts, setSecondReceipts] = useState<IReceipt[]>([]);
    const [isSecondInEditMode, setIsSecondInEditMode] = useState<boolean>(false);

    const [isLocalDataLoaded, setIsLocalDataLoaded] = useState<boolean>(false);

    useEffect(() => {
        // Load saved data
        loadDataFromLocalStorage()
    });

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
            setFirstReceipts(JSON.parse(firstReceipts) as IReceipt[]);
        }

        if (storage.isItemSet('secondReceipts', 'local')) {
            const secondReceipts = storage.getItem('secondReceipts', 'local');
            setSecondReceipts(JSON.parse(secondReceipts) as IReceipt[]);
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

    async function uploadFile(files: FileList | null, isFirst: boolean): Promise<void> {
        if (files === null || files === undefined) { return; }

        for (let i = 0; i < files.length; i++) {
            if (files[i].name.endsWith('csv')) {
                const receipts = getReceipts(isFirst).concat(await UploadHandler.parseCSVToReceipts(files[i], isFirst ? firstPersonName : secondPersonName));
                setReceipts(receipts, isFirst);
            } else if (files[i].name.endsWith('xlsx')) {
                const excelImportData: IExcelImportData = await UploadHandler.parseXLSXToReceipts(files[i]);

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

    function getReceiptsTable(isInEditMode: boolean, myName: string, otherName: string, isFirst: boolean, myReceipts: IReceipt[]): JSX.Element {
        return isInEditMode
            ? <EditReceiptsTable
                myName={myName}
                isFirst={isFirst}
                myReceipts={myReceipts}
                setReceipts={setReceipts}
                isInEditMode={isInEditMode}
                setIsInEditMode={setIsInEditMode}
                switchToNextTable={() => {
                    setShowFirstTable(!isFirst);
                }}
            />
            : <ReceiptsTable
                myName={myName}
                otherName={otherName}
                isFirst={isFirst}
                myReceipts={myReceipts}
                setReceipts={setReceipts}
                isInEditMode={isInEditMode}
                setIsInEditMode={setIsInEditMode}
                switchToNextTable={() => {
                    setShowFirstTable(!isFirst);
                }}
            />
            ;
    }

    return (
        <div className={[styles.receiptManager].join(' ')}>
            <div className={[styles.split].join(' ')}>
                <PersonCard
                    myName={firstPersonName}
                    otherName={secondPersonName}
                    isFirst={true}
                    myReceipts={firstReceipts}
                    otherReceipts={secondReceipts}
                    setPersonName={saveFirstPersonName}
                    uploadFile={uploadFile}
                    setReceipts={setReceipts}
                />
                <PersonCard
                    myName={secondPersonName}
                    otherName={firstPersonName}
                    isFirst={false}
                    myReceipts={secondReceipts}
                    otherReceipts={firstReceipts}
                    setPersonName={saveSecondPersonName}
                    uploadFile={uploadFile}
                    setReceipts={setReceipts}
                />
            </div>
            {firstReceipts.length !== 0 && showFirstTable &&
                getReceiptsTable(isFristInEditMode, firstPersonName, secondPersonName, true, firstReceipts)
            }
            {secondReceipts.length !== 0 && !showFirstTable &&
                getReceiptsTable(isSecondInEditMode, secondPersonName, firstPersonName, false, secondReceipts)
            }
        </div>
    );
}
