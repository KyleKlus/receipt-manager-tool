/** @format */
import styles from '@/styles/components/receipt-manager/personCell/ReceiptsTable.module.css'
import { IReceipt } from '@/interfaces/IReceipt';
import { IReceiptItem } from '@/interfaces/IReceiptItem';
import { Category } from "@/enums/Category";
import { setStoreName } from '@/handlers/ReceiptModifier';
import { Pencil } from 'lucide-react';



export default function ReceiptsTable(props: {
    myName: string,
    otherName: string,
    isFirst: boolean,
    isInEditMode: boolean,
    myReceipts: IReceipt[],
    toggleAllMyItems: (receiptNum: number, isFirst: boolean) => void;
    toggleAllSharedItems: (receiptNum: number, isFirst: boolean) => void;
    toggleAllRejectedItems: (receiptNum: number, isFirst: boolean) => void;
    deleteReceipt: (receiptNum: number, isFirst: boolean) => void;
    selectCategoryForAllItems: (receiptNum: number, isFirst: boolean, selectCategory: Category) => void;
    toggleMyItem: (receiptNum: number, itemNum: number, isFirst: boolean) => void;
    toggleSharedItem: (receiptNum: number, itemNum: number, isFirst: boolean) => void;
    toggleRejectedItem: (receiptNum: number, itemNum: number, isFirst: boolean) => void;
    deleteItem: (receiptNum: number, itemNum: number, isFirst: boolean) => void;
    selectCategory: (receiptNum: number, itemNum: number, isFirst: boolean, selectCategory: Category) => void;
    setItemAmount: (receiptNum: number, itemNum: number, isFirst: boolean, amount: number) => void;
    setItemPrice: (receiptNum: number, itemNum: number, isFirst: boolean, price: number) => void;
    setItemName: (receiptNum: number, itemNum: number, isFirst: boolean, name: string) => void;
    setStoreName: (receiptNum: number, isFirst: boolean, name: string) => void;
    setIsInEditMode: (isInEditMode: boolean) => void;
}) {
    const {
        myName,
        otherName,
        isFirst,
        myReceipts,
        isInEditMode,
        toggleAllMyItems,
        toggleAllSharedItems,
        toggleAllRejectedItems,
        deleteReceipt,
        selectCategoryForAllItems,
        toggleMyItem,
        toggleSharedItem,
        toggleRejectedItem,
        deleteItem,
        selectCategory,
        setItemAmount,
        setItemPrice,
        setItemName,
        setStoreName,
        setIsInEditMode
    } = props;

    function generateTableHeader(isFirst: boolean, myName: string, otherName: string): JSX.Element {
        return (
            <tr>
                <th>Item / Store Name</th>
                <th>Price €</th>
                <th>Amount</th>
                {!isInEditMode &&
                    <th >{isFirst ? myName : otherName}</th>
                }
                {!isInEditMode &&
                    <th>Shared</th>
                }
                {!isInEditMode &&
                    <th >{isFirst ? otherName : myName}</th>
                }
                {isInEditMode
                    ? <th >Actions</th>
                    : <th >Category</th>
                }
            </tr>
        );
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
                        {isInEditMode
                            ? <input className={[styles.bigTextInput].join(' ')} value={receipt.store} placeholder={'Store name'}
                                onChange={(e) => {
                                    setStoreName(receiptNum, isFirst, e.currentTarget.value);
                                }}
                            />
                            : <div>{receipt.store}</div>
                        }
                    </td>
                    <td className={[styles.personTableCellHeader].join(' ')}>
                        {receipt.totalPrice + ' €'}</td>
                    <td className={[styles.personTableCellHeader].join(' ')}>{''}</td>
                    {isFirst && !isInEditMode &&
                        <td className={[styles.personTableCellHeader].join(' ')}>
                            <input disabled={isInEditMode} checked={receipt.isAllMine} type='radio' onChange={() => { toggleAllMyItems(receiptNum, isFirst) }} />
                        </td>
                    }
                    {!isFirst && !isInEditMode &&
                        <td className={[styles.personTableCellHeader].join(' ')}>
                            <input disabled={isInEditMode} checked={receipt.isAllRejected} type='radio' onChange={() => { toggleAllRejectedItems(receiptNum, isFirst) }} />
                        </td>
                    }
                    {!isInEditMode &&
                        <td className={[styles.personTableCellHeader].join(' ')}>
                            <input disabled={isInEditMode} checked={receipt.isAllShared} type='radio' onChange={() => { toggleAllSharedItems(receiptNum, isFirst) }} />
                        </td>
                    }

                    {!isFirst && !isInEditMode &&
                        <td className={[styles.personTableCellHeader].join(' ')}>
                            <input disabled={isInEditMode} checked={receipt.isAllMine} type='radio' onChange={() => { toggleAllMyItems(receiptNum, isFirst) }} />
                        </td>
                    }
                    {isFirst && !isInEditMode &&
                        <td className={[styles.personTableCellHeader].join(' ')}>
                            <input disabled={isInEditMode} checked={receipt.isAllRejected} type='radio' onChange={() => { toggleAllRejectedItems(receiptNum, isFirst) }} />
                        </td>
                    }
                    {!isInEditMode
                        ? <td className={[styles.personTableCellHeader].join(' ')}>
                        </td>
                        : <td className={[styles.personTableCellHeader].join(' ')}>
                            <button onClick={() => {
                                deleteReceipt(receiptNum, isFirst);
                            }}>🗑️ Delete</button>
                        </td>
                    }
                </tr>
            );

            rows.push(...receiptItems.map((item, itemNum) => {
                key++;
                return (<tr key={keyChar + key}>
                    <td className={[].join(' ')}>
                        {isInEditMode
                            ? <input className={[styles.textInput].join(' ')} value={item.name} placeholder={'Item name'}
                                onChange={(e) => {
                                    setItemName(receiptNum, itemNum, isFirst, e.currentTarget.value);
                                }}
                            />
                            : <div>{item.name}</div>
                        }
                    </td>
                    <td className={[].join(' ')}>
                        {isInEditMode
                            ? <input className={[styles.textInput].join(' ')} value={item.price} placeholder={'Item price'}
                                onChange={(e) => {
                                    setItemPrice(receiptNum, itemNum, isFirst, parseFloat(e.currentTarget.value));
                                }}
                            />
                            : <div>{item.price + ' €'}</div>
                        }
                    </td>
                    <td className={[].join(' ')}>{isInEditMode
                        ? <input className={[styles.textInput].join(' ')} value={item.amount} placeholder={'Item amount'}
                            onChange={(e) => {
                                setItemAmount(receiptNum, itemNum, isFirst, parseFloat(e.currentTarget.value));
                            }}
                        />
                        : <div>{item.amount}</div>
                    }
                    </td>
                    {isFirst && !isInEditMode &&
                        <td className={[].join(' ')}>
                            <input disabled={isInEditMode} checked={item.isMine} type='radio' onChange={() => { toggleMyItem(receiptNum, itemNum, isFirst) }} />
                        </td>
                    }
                    {!isFirst && !isInEditMode &&
                        <td className={[].join(' ')}>
                            <input disabled={isInEditMode} checked={item.isRejected} type='radio' onChange={() => { toggleRejectedItem(receiptNum, itemNum, isFirst) }} />
                        </td>
                    }
                    {!isInEditMode &&
                        <td className={[].join(' ')}>
                            <input disabled={isInEditMode} checked={item.isShared} type='radio' onChange={() => { toggleSharedItem(receiptNum, itemNum, isFirst) }} />
                        </td>
                    }

                    {!isFirst && !isInEditMode &&
                        <td className={[].join(' ')}>
                            <input disabled={isInEditMode} checked={item.isMine} type='radio' onChange={() => { toggleMyItem(receiptNum, itemNum, isFirst) }} />
                        </td>
                    }
                    {isFirst && !isInEditMode &&
                        <td className={[].join(' ')}>
                            <input disabled={isInEditMode} checked={item.isRejected} type='radio' onChange={() => { toggleRejectedItem(receiptNum, itemNum, isFirst) }} />
                        </td>
                    }
                    {!isInEditMode
                        ? <td className={[].join(' ')}>
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
                        : <td className={[].join(' ')}>
                            <button onClick={() => {
                                deleteItem(receiptNum, itemNum, isFirst);
                            }}>🗑️ Delete</button>
                        </td>
                    }
                </tr>)
            }));
            key++;
        }
        return rows;
    }

    return (
        <div className={[styles.receiptsTable].join(' ')}>
            <div className={styles.headerSplit}>
                <h2>{myName} Receipts</h2>
                <button className={[styles.fancyButton, isInEditMode ? styles.isActive : ''].join(' ')} onClick={() => {
                    setIsInEditMode(!isInEditMode);
                }}><Pencil width={16} /> Edit</button>
            </div>
            <table className={[styles.table].join(' ')}>
                <thead>{generateTableHeader(isFirst, myName, otherName)}</thead>
                <tbody>
                    {...generateTableRows(isFirst, myReceipts)}
                </tbody>
            </table>
        </div>
    );
}
