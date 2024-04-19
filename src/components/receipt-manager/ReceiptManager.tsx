/** @format */
import styles from '@/styles/components/receipt-manager/ReceiptManager.module.css';
import { useEffect, useState } from 'react';
import { IReceipt } from '@/interfaces/IReceipt';
import PersonCard from '@/components/receipt-manager/personCell/PersonCard';
import ReceiptsTable from '@/components/receipt-manager/personCell/ReceiptsTable';
import { Category } from '@/handlers/DataParser';
import useStorage from '@/hooks/useStorage';
import * as DataParser from '@/handlers/DataParser';
import * as ReceiptModifier from '@/handlers/ReceiptModifier';


export default function ReceiptManager(props: {
}) {
    const {
    } = props;

    const storage = useStorage();

    const [firstPersonName, setFirstPersonName] = useState<string>('');
    const [firstReceipts, setFirstReceipts] = useState<IReceipt[]>([]);

    const [secondPersonName, setSecondPersonName] = useState<string>('');
    const [secondReceipts, setSecondReceipts] = useState<IReceipt[]>([]);
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

    function selectCategory(receiptNum: number, itemNum: number, isFirstList: boolean, selectedCategory: Category) {
        const receipts: IReceipt[] = getReceipts(isFirstList);
        setReceipts(ReceiptModifier.selectCategory(receipts, receiptNum, itemNum, selectedCategory), isFirstList);
    }

    function toggleRejectItem(receiptNum: number, itemNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = getReceipts(isFirstList);
        setReceipts(ReceiptModifier.toggleRejectItem(receipts, receiptNum, itemNum), isFirstList);
    }

    function toggleShareItem(receiptNum: number, itemNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = getReceipts(isFirstList);
        setReceipts(ReceiptModifier.toggleShareItem(receipts, receiptNum, itemNum), isFirstList);
    }

    function toggleMyItem(receiptNum: number, itemNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = getReceipts(isFirstList);
        setReceipts(ReceiptModifier.toggleMyItem(receipts, receiptNum, itemNum), isFirstList);
    }

    function deleteItem(receiptNum: number, itemNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = getReceipts(isFirstList);
        setReceipts(ReceiptModifier.deleteItem(receipts, receiptNum, itemNum), isFirstList);
    }

    function selectCategoryForAllItems(receiptNum: number, isFirstList: boolean, selectedCategory: Category) {
        const receipts: IReceipt[] = getReceipts(isFirstList);
        setReceipts(ReceiptModifier.selectCategoryForAllItems(receipts, receiptNum, selectedCategory), isFirstList);
    }

    function toggleAllRejectedItems(receiptNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = getReceipts(isFirstList);
        setReceipts(ReceiptModifier.toggleAllRejectedItems(receipts, receiptNum), isFirstList);
    }

    function toggleAllSharedItems(receiptNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = getReceipts(isFirstList);
        setReceipts(ReceiptModifier.toggleAllSharedItems(receipts, receiptNum), isFirstList);
    }

    function toggleAllMyItems(receiptNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = getReceipts(isFirstList);
        setReceipts(ReceiptModifier.toggleAllMyItems(receipts, receiptNum), isFirstList);
    }

    function deleteReceipt(receiptNum: number, isFirstList: boolean) {
        const receipts: IReceipt[] = getReceipts(isFirstList);
        setReceipts(ReceiptModifier.deleteReceipt(receipts, receiptNum), isFirstList);
    }

    async function uploadFile(files: FileList | null, isFirst: boolean): Promise<void> {
        if (files === null || files === undefined) { return; }

        let receipts: IReceipt[] = [];

        for (let i = 0; i < files.length; i++) {
            receipts = receipts.concat(await DataParser.parseFileToReceipts(files[i], isFirst ? firstPersonName : secondPersonName));
        }

        setReceipts(receipts, isFirst);
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
                    setReceipts={setReceipts}
                    uploadFile={uploadFile}
                />
                <PersonCard
                    myName={secondPersonName}
                    otherName={firstPersonName}
                    isFirst={false}
                    myReceipts={secondReceipts}
                    otherReceipts={firstReceipts}
                    setPersonName={saveSecondPersonName}
                    setReceipts={setReceipts}
                    uploadFile={uploadFile}
                />
            </div>
            {firstReceipts.length !== 0 &&
                <ReceiptsTable
                    myName={firstPersonName}
                    otherName={secondPersonName}
                    isFirst={true}
                    myReceipts={firstReceipts}
                    toggleAllMyItems={toggleAllMyItems}
                    toggleAllSharedItems={toggleAllSharedItems}
                    toggleAllRejectedItems={toggleAllRejectedItems}
                    selectCategoryForAllItems={selectCategoryForAllItems}
                    toggleMyItem={toggleMyItem}
                    toggleSharedItem={toggleShareItem}
                    toggleRejectedItem={toggleRejectItem}
                    deleteReceipt={deleteReceipt}
                    deleteItem={deleteItem}
                    selectCategory={selectCategory}
                />
            }
            {secondReceipts.length !== 0 &&
                <ReceiptsTable
                    myName={secondPersonName}
                    otherName={firstPersonName}
                    isFirst={false}
                    myReceipts={secondReceipts}
                    toggleAllMyItems={toggleAllMyItems}
                    toggleAllSharedItems={toggleAllSharedItems}
                    toggleAllRejectedItems={toggleAllRejectedItems}
                    selectCategoryForAllItems={selectCategoryForAllItems}
                    toggleMyItem={toggleMyItem}
                    toggleSharedItem={toggleShareItem}
                    toggleRejectedItem={toggleRejectItem}
                    deleteReceipt={deleteReceipt}
                    deleteItem={deleteItem}
                    selectCategory={selectCategory}
                />
            }
        </div>
    );
}
