/** @format */
import { unrecognizedItemName } from '@/handlers/UploadHandler';
import { IReceipt } from '@/interfaces/IReceipt';
import { IReceiptItem } from '@/interfaces/IReceiptItem';
import rowStyles from '@/styles/components/receipt-manager/personCell/TableRow.module.css'
import tableStyles from '@/styles/components/receipt-manager/personCell/TableRow.module.css'
import { Handshake, Plus, Sailboat, Save, Star, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import CreatableSelect from 'react-select/creatable';

export interface IEditableData {
    name: string,
    price: number,
    amount: number,
}

/**
 * TableRow component
 *
 * This component is responsible for rendering a single data row in the receipt table.
 *
 * @param editableData - The editable data for the row.
 * @param category - The category of the row.
 * @param rowType - The type of the row.
 * @param shareState - The share state of the row.
 * @param isNewRow - Whether the row is a new data row, which can add new data.
 * @param isEditable - Whether the row is editable (Also applies to new data row).
 * @param categories - The categories of the row.
 * @param updateData - A function to update the editable data of the row.
 * @param setShareState - A function to set the share state of the row.
 * @param setCategory - A function to set the category of the row.
 * @param updateCategories - A function to update the categories which are available for selection.
 * @returns JSX.Element
 */
export default function TableRow(props: {

    editableData?: IEditableData;
    category?: string,
    rowType: 'Receipt' | 'Item',
    shareState?: 'Left' | 'Shared' | 'Right' | undefined,
    isNewRow: boolean,
    isEditable: boolean,
    categories?: string[],
    updateData: (newData: IEditableData) => void,
    setShareState?: (shareState: 'Left' | 'Shared' | 'Right') => void,
    setCategory?: (category: string) => void,
    updateCategories?: (categories: string[]) => void
}) {
    const prevName = useRef(props.isNewRow ? '' : (props.editableData?.name ?? ''));
    const prevPrice = useRef(props.isNewRow ? '' : (props.editableData?.price ?? ''));
    const prevAmount = useRef(props.isNewRow ? '' : (props.editableData?.amount ?? ''));

    const [newItemName, setNewItemName] = useState<string>(props.isNewRow ? '' : (props.editableData?.name ?? ''));
    const [newItemPrice, setNewItemPrice] = useState<number>(props.isNewRow ? 0 : (props.editableData?.price ?? 0));
    const [newItemAmount, setNewItemAmount] = useState<number>(props.isNewRow ? 0 : (props.editableData?.amount ?? 0));

    const hasDataChanged = (props.rowType === 'Item' && (prevName.current !== newItemName || prevPrice.current !== newItemPrice || prevAmount.current !== newItemAmount)) || (props.rowType === 'Receipt' && prevName.current !== newItemName);

    const categoryOptions: {
        value: string;
        label: string;
    }[] | undefined = !props.categories ? [] : props.categories.map((key) => ({ value: key, label: key }));

    const handleCreate = (inputValue: string) => {
        if (!props.updateCategories || !props.setCategory || !props.categories) { return }
        props.updateCategories([...props.categories, inputValue]);
        props.setCategory(inputValue);
    };

    function resetInputs() {
        setNewItemName('');
        setNewItemPrice(0);
        setNewItemAmount(0);
    }

    return (
        <tr className={[rowStyles.tableRow, props.isNewRow ? rowStyles.isNewRow : '', props.isEditable ? rowStyles.isEditable : ''].join(' ')}>
            <td className={[props.rowType === 'Receipt' && rowStyles.receiptRowCell].join(' ')}>
                {/* --- ViewMode UI --- */}
                {!(props.isNewRow || props.isEditable) && props.editableData &&
                    props.editableData.name
                }
                {/* --- EditMode UI --- */}
                {(props.isNewRow || props.isEditable) &&
                    <input className={[rowStyles.textInput].join(' ')} type={'text'} value={newItemName} placeholder={props.rowType === 'Receipt' ? 'New store name' : 'New item name'}
                        onChange={(e) => {
                            setNewItemName(e.currentTarget.value);
                        }}
                    />
                }
            </td>
            <td className={[props.rowType === 'Receipt' && rowStyles.receiptRowCell].join(' ')}>
                {/* --- ViewMode UI --- */}
                {!((props.isNewRow && props.rowType === 'Item') || props.isEditable && !props.isNewRow) && props.editableData &&
                    props.editableData.price.toFixed(2) + ' €'
                }
                {/* --- EditMode UI --- */}
                {(props.isEditable || props.isNewRow) && props.rowType !== 'Receipt' &&
                    <input className={[rowStyles.textInput].join(' ')} type={'number'} value={newItemPrice} placeholder={'New item price'}
                        onChange={(e) => {
                            setNewItemPrice(e.currentTarget.valueAsNumber);
                        }}
                    />
                }
            </td>
            <td className={[props.rowType === 'Receipt' && rowStyles.receiptRowCell].join(' ')}>
                {/* --- ViewMode UI --- */}
                {!((props.isNewRow && props.rowType === 'Item') || props.isEditable && !props.isNewRow) && props.editableData &&
                    props.editableData.amount
                }
                {/* --- EditMode UI --- */}
                {(props.isEditable || props.isNewRow) && props.rowType !== 'Receipt' &&
                    <input className={[rowStyles.textInput].join(' ')} type={'number'} value={newItemAmount} placeholder={'New item amount'}
                        onChange={(e) => {
                            setNewItemAmount(e.currentTarget.valueAsNumber);
                        }}
                    />
                }
            </td>
            <td className={[props.rowType === 'Receipt' && rowStyles.receiptRowCell].join(' ')}>
                {/* --- ViewMode UI --- */}
                {!props.isEditable && !props.isNewRow && props.setShareState &&
                    <button
                        className={[
                            rowStyles.toggleButton,
                            props.shareState === 'Left' ? rowStyles.isSelected : ''
                        ].join(' ')}
                        onClick={() => {
                            if (!props.setShareState) { return }
                            props.setShareState(props.shareState === 'Left' ? 'Shared' : 'Left');
                        }}>
                        <Sailboat size={16} />
                    </button>
                }
                {/* --- EditMode UI --- */}
                {props.isEditable &&
                    <div className={[rowStyles.editModeActions].join(' ')}>
                        <button disabled={hasDataChanged ? false : true} className={tableStyles.fancyButton} onClick={() => {
                            // Check if all fields are filled
                            if (
                                (
                                    props.rowType === 'Receipt' &&
                                    newItemName === ''
                                ) ||
                                (props.rowType === 'Item' &&
                                    (
                                        newItemName === '' ||
                                        newItemPrice === 0 ||
                                        newItemAmount < 1
                                    )
                                )
                            ) { return }

                            props.updateData({
                                name: newItemName,
                                price: newItemPrice,
                                amount: newItemAmount
                            });

                            props.isNewRow && resetInputs();
                        }}>
                            {props.isNewRow ? <Plus /> : <Save />}
                            {props.isNewRow ? ' Add' : ' Save'}
                        </button>
                        {!props.isNewRow &&
                            <button className={tableStyles.fancyButton} onClick={() => {
                                // Deletes item when data is empty
                                props.updateData({
                                    name: '',
                                    price: 0,
                                    amount: 0
                                });
                                resetInputs();
                            }}><X /> Delete</button>
                        }
                    </div>
                }
            </td>
            <td className={[props.rowType === 'Receipt' && rowStyles.receiptRowCell].join(' ')}>
                {/* --- ViewMode UI --- */}
                {!props.isEditable && !props.isNewRow && props.setShareState &&
                    <button
                        className={[
                            rowStyles.toggleButton,
                            props.shareState === 'Shared' ? rowStyles.isSelected : ''
                        ].join(' ')}
                        onClick={() => {
                            if (!props.setShareState) { return }
                            props.setShareState('Shared');
                        }}>
                        <Handshake size={16} />
                    </button>
                }
            </td>
            <td className={[props.rowType === 'Receipt' && rowStyles.receiptRowCell].join(' ')}>
                {/* --- ViewMode UI --- */}
                {!props.isEditable && !props.isNewRow && props.setShareState &&
                    <button
                        className={[
                            rowStyles.toggleButton,
                            props.shareState === 'Right' ? rowStyles.isSelected : ''
                        ].join(' ')}
                        onClick={() => {
                            if (!props.setShareState) { return }

                            props.setShareState(props.shareState === 'Right' ? 'Shared' : 'Right');
                        }}>
                        <Star size={16} />
                    </button>
                }
            </td>
            <td className={[props.rowType === 'Receipt' && rowStyles.receiptRowCell].join(' ')}>
                {/* --- ViewMode UI --- */}
                {!props.isEditable && !props.isNewRow && props.rowType !== 'Receipt' && categoryOptions && props.editableData && props.setCategory &&
                    <CreatableSelect
                        styles={{
                            control: (base) => ({ ...base, height: '32px', minHeight: '32px' }),
                            dropdownIndicator: (base) => ({ ...base, padding: '4px' }),
                        }}
                        isDisabled={props.editableData.name === unrecognizedItemName}
                        onChange={(newValue) => {
                            if (newValue === null) { return; }
                            if (!props.setCategory) { return }

                            props.setCategory(newValue.value)
                        }}
                        onCreateOption={(inputValue: string) => {
                            handleCreate(inputValue)
                        }}
                        hideSelectedOptions={true}
                        name="category"
                        getOptionLabel={(option) => {
                            return option.label
                        }}
                        getOptionValue={(option) => option.value}
                        options={categoryOptions}
                        value={categoryOptions.filter((option) => option.value === props.category)[0]}
                    />
                }
                {/* --- EditMode UI --- */}
                {props.isNewRow &&
                    <button disabled={hasDataChanged ? false : true} className={tableStyles.fancyButton} onClick={() => {
                        // Check if all fields are filled
                        if (
                            (
                                props.rowType === 'Receipt' &&
                                newItemName === ''
                            ) ||
                            (props.rowType === 'Item' &&
                                (
                                    newItemName === '' ||
                                    newItemPrice === 0 ||
                                    newItemAmount < 1
                                )
                            )
                        ) { return }

                        props.updateData({
                            name: newItemName,
                            price: newItemPrice,
                            amount: newItemAmount
                        });
                        resetInputs();
                    }}>
                        <Plus /> Add
                    </button>
                }
            </td>
        </tr>
    );
}
