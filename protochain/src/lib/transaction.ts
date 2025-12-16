import TransactionType from './transactionType';
import sha256 from 'crypto-js/sha256';
import Validation from './validation';
import TransactionInput from './transactionInput';
// import { TransactionData } from './transactionData';

/**
 * Transaction-related utilities and types.
 */
export default class Transaction {
    private type: TransactionType;
    private timestamp: number;
    private to: string;
    private txInput: TransactionInput | undefined;
    private hash: string;

    /**
     * Create a new Transaction.
     * @param tx - Optional structure containing transaction data.
     */
    constructor(tx?: {
        type?: TransactionType;
        timestamp?: number;
        to?: string;
        txInput?: {
            fromAddress?: string;
            amount?: number;
            signature?: string;
        };
        hash?: string;
    }) {
// console.log("Transaction constructor: receiving:", tx);
        this.type = tx?.type || TransactionType.REGULAR;
        this.timestamp = tx?.timestamp || Date.now();
        this.to = tx?.to || '';
        this.txInput = tx?.txInput ? new TransactionInput(tx.txInput) : undefined;
        this.hash = tx?.hash || this.generateHash();
// console.log("Transaction constructor: created:", this);
    }


    /**
     * Validate the transaction.
     * @returns Return a Validation object indicating if the transaction is valid.
     */
    isValid(): Validation {
        if (this.hash !== this.generateHash()) {
            return new Validation(false, 'Invalid transaction hash');
        }
        if(!this.to){
            return new Validation(false, 'Transaction .to address is required');
        }

        if (this.txInput) {
            const inputValidation = this.txInput.isValid();
            if (!inputValidation.success) {
                return new Validation(false, `Invalid txInput: ${inputValidation.message}`);
            }
        }
        return new Validation(true);
    }


    /**
     * Generates a unique hash for the transaction.
     * @returns The SHA-256 hash of the transaction details.
     */
    private generateHash(): string {
        if (!this.txInput) 
            return sha256(this.type + this.timestamp + this.to).toString();

        return sha256(this.type + this.timestamp + this.txInput.getHash() + this.to).toString();
    }


    /**
     * Get the hash of the transaction.
     * @returns The .hash property of the transaction.
     */
    getHash(): string {
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