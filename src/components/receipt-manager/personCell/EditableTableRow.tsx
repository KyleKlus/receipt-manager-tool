/** @format */
import styles from '@/styles/components/receipt-manager/personCell/ReceiptsTable.module.css'
import { IReceipt } from '@/interfaces/IReceipt';
import { IReceiptItem } from '@/interfaces/IReceiptItem';
import { Category, DEFAULT_CATEGORY } from "@/enums/Category";
import { Plus } from 'lucide-react';
import { useState } from 'react';
import BigNumber from 'bignumber.js';

export default function EditableTableRow(props: {
    isFirst: boolean,
    myReceipts: IReceipt[],
    receiptNum: number,
    setReceipts: (receipts: IReceipt[], isFirst: boolean) => void,
}) {
    const {
        isFirst,
        myReceipts,
        receiptNum,
        setReceipts,
    } = props;

    const [newItemName, setNewItemName] = useState<string>('');
    const [newItemPrice, setNewItemPrice] = useState<number>(0);
    const [newItemAmount, setNewItemAmount] = useState<number>(1);

    function handleAddItem() {
        if (newItemName === '' || newItemPrice === 0 || newItemAmount < 0.01 || !Number.isInteger(newItemAmount)) { return }
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

        tmpReceipts[receiptNum].totalPrice = new BigNumber(tmpReceipts[receiptNum].totalPrice).plus(newItem.price).toNumber();
        tmpReceipts[receiptNum].categoryForAllItems = Category.None;
        tmpReceipts[receiptNum].items.push(newItem);
        tmpReceipts[receiptNum].isAllMine = false;
        tmpReceipts[receiptNum].isAllShared = false;
        tmpReceipts[receiptNum].isAllRejected = false;

        setReceipts([...tmpReceipts], isFirst)
        setNewItemName('');
        setNewItemPrice(0);
        setNewItemAmount(1);
    }

    return (
        <tr >
            <td className={[].join(' ')}>
                <input className={[styles.textInput].join(' ')} type={'text'} value={newItemName} placeholder={'Item name'}
                    onChange={(e) => {
                        setNewItemName(e.currentTarget.value);
                    }}
                />
            </td>
            <td className={[].join(' ')}>
                <input className={[styles.textInput].join(' ')} type={'number'} value={newItemPrice} placeholder={'Item price'}
                    onChange={(e) => {
                        setNewItemPrice(e.currentTarget.valueAsNumber);
                    }}
                />
            </td>
            <td className={[].join(' ')}>
                <input className={[styles.textInput].join(' ')} type={'number'} value={newItemAmount} placeholder={'Item amount'}
                    onChange={(e) => {
                        setNewItemAmount(e.currentTarget.valueAsNumber);
                    }}
                />
            </td>
            <td className={[].join(' ')}>
                <button className={styles.fancyButton} onClick={() => {
                    handleAddItem();
                }}><Plus /> Add</button>
            </td>
        </tr>
    );
}
