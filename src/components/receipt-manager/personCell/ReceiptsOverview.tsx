/** @format */
import styles from '@/styles/components/receipt-manager/personCell/ReceiptsOverview.module.css';

export default function ReceiptsOverview(props: {
    myName: string,
    myReceiptsExpenses: number;
    myTotalExpenses: number;
    result: number,
}) {
    const {
        myName,
        myReceiptsExpenses,
        myTotalExpenses,
        result,
    } = props;

    return (
        <div className={[styles.receiptsOverview].join(' ')}>
            <hr />
            <div className={[styles.personTableSum].join(' ')}>
                <div>{myName}&#39;s total expenses: </div>
                <div>{myTotalExpenses.toFixed(2)} €</div>
            </div>
            <div className={[styles.personTableSum].join(' ')}>
                <div>{myName} paid: </div>
                <div>{myReceiptsExpenses.toFixed(2)} €</div>
            </div>
            <hr />
            <div className={[styles.personTableSum].join(' ')}>
                <div>Leftover expenses: </div>
                <div>{result.toFixed(2)} €</div>
            </div>
            <hr />
            <hr />
            <div className={[styles.personTableSum].join(' ')}>
                {result > 0
                    ? <div>{myName} has paid too much: </div>
                    : <div>{myName} needs to pay: </div>
                }
                <div>{Math.abs(result).toFixed(2)} €</div>
            </div>
        </div>
    );
}
