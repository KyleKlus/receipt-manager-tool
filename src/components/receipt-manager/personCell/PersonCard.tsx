/** @format */
import styles from '@/styles/components/receipt-manager/personCell/PersonCard.module.css';
import { IReceipt } from '@/interfaces/IReceipt';
import * as Calculator from '@/handlers/Calculator';
import ReceiptsOverview from './ReceiptsOverview';
import BigNumber from 'bignumber.js';

export default function PersonCard(props: {
    myName: string,
    myReceipts: IReceipt[],
    otherReceipts: IReceipt[],
}) {
    const {
        myName,
        myReceipts,
        otherReceipts,
    } = props;

    // --- shared ---
    const sharedExpensesFromMe = Calculator.calcSharedExpenses(myReceipts);
    const sharedExpensesFromOther: BigNumber = Calculator.calcSharedExpenses(otherReceipts);
    const sharedExpenses = parseFloat(sharedExpensesFromMe.plus(sharedExpensesFromOther).toFixed(2));

    // --- Me ---
    const myExpensesFromMe: number = parseFloat(Calculator.calcPersonalExpenses(myReceipts).toFixed(2));
    const myExpensesFromOther: number = parseFloat(Calculator.calcRejectedExpenses(otherReceipts).toFixed(2));

    const myTotalExpenses: number = parseFloat(BigNumber(sharedExpenses).plus(myExpensesFromMe).plus(myExpensesFromOther).multipliedBy(-1).toFixed(2));

    // --- Final Calculation ---
    const myPaidValue: number = parseFloat(Calculator.calcReceiptsExpenses(myReceipts).toFixed(2));
    const myLeftOverExpenses = parseFloat(BigNumber(myPaidValue).plus(myTotalExpenses).toFixed(2)); // minus == schulden & plus === bekomme geld

    return (
        <div className={[styles.personCard].join(' ')}>
            <h4 className={[styles.personName].join(' ')}>
                {myName !==''
                    ? myName
                    : 'Unnamed Person'
                }
            </h4>
            <ReceiptsOverview
                myName={myName}
                myReceiptsExpenses={myPaidValue}
                myTotalExpenses={myTotalExpenses}
                result={myLeftOverExpenses}
            />
        </div>
    );
}
