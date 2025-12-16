import TransactionInput from '../transactionInput';
import TransactionType from '../transactionType';
import Validation from '../validation';

/**
 * Transaction-related utilities and types.
 */
export default class Transaction {
    private type: TransactionType;
    private timestamp: number;
    private hash: string;
    private txInput: TransactionInput;
    private to: string;


    /**
     * Create a MOCKED Transaction.
     * @param tx - Optional structure containing transaction data.
     */
    constructor(tx?: Transaction | {
        type?: TransactionType;
        timestamp?: number;
        to?: string;
        txInput?: TransactionInput;
        hash?: string;
    }) {
        this.type = tx instanceof Transaction ? tx.type : tx?.type || TransactionType.REGULAR;
        this.timestamp = tx instanceof Transaction ? tx.timestamp : tx?.timestamp || Date.now();
        this.to = tx instanceof Transaction ? tx.to : tx?.to || '';
        this.txInput = tx instanceof Transaction ? new TransactionInput(tx.txInput) : tx?.txInput ? new TransactionInput(tx.txInput) : new TransactionInput();
        this.hash = tx instanceof Transaction ? tx.hash : tx?.hash || this.generateHash();
    }


    /**
     * Mock validation for the transaction.
     * @returns Return a Validation object indicating if the transaction is valid.
     */
    isValid(): Validation {
        if(this.hash === "Invalid mock transaction") {
            return new Validation(false, 'Invalid mock transaction');
        }

        if(!this.txInput.isValid().success) {
            return new Validation(false, 'Invalid mock transactionInput');
        }
        return new Validation(true);
    }


    /**
     * Generates a mocked hash for the transaction.
     * @returns The mocked hash of the transaction details.
     */
    private generateHash(): string {
        return "mocked transaction hash";
    }


    /**
     * Get the hash of the transaction.
     * @returns The .hash property of the transaction.
     */
    private getHash(): string {
        return this.hash;
    }


    /**
     * Get the type of the transaction.
     * @returns The .type property of the transaction.
     */
    getType(): TransactionType {
        return this.type;
    }
}