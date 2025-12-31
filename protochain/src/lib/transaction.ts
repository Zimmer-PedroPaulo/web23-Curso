import TransactionType from './transactionType';
import sha256 from 'crypto-js/sha256';
import Validation from './validation';
import TransactionInput from './transactionInput';
import TransactionOutput from './transactionOutput';
// import { TransactionData } from './transactionData';

/**
 * Transaction-related utilities and types.
 */
export default class Transaction {
    private type: TransactionType;
    private timestamp: number;
    private txInputs: Array<TransactionInput> | undefined;
    private txOutputs: Array<TransactionOutput> | undefined;
    private hash: string;

    /**
     * Create a new Transaction.
     * @param tx - Optional structure containing transaction data.
     */
    constructor(tx?: {
        type?: TransactionType;
        timestamp?: number;
        txInputs?: Array<{
            fromAddress?: string;
            amount?: number;
            signature?: string;
            previousTx?: string;
        }>;
        txOutputs?: Array<{
            toAddress?: string;
            amount?: number;
            tx?: string;
        }>;
        hash?: string;
    }) {
// console.log("Transaction constructor: receiving:", tx);
        this.type = tx?.type || TransactionType.REGULAR;
        this.timestamp = tx?.timestamp || Date.now();
        
        this.txInputs = tx?.txInputs 
        ? tx.txInputs.map(txi => new TransactionInput(txi))
        : undefined;
        
        this.txOutputs = tx?.txOutputs 
        ? tx.txOutputs.map(txo => new TransactionOutput(txo))
        : undefined;

        this.hash = tx?.hash || this.generateHash();

        if (this.txOutputs && this.txOutputs.length) {
            this.txOutputs.forEach(txo => txo["tx"] = this.hash);
        }
// console.log("Transaction constructor: created:", this);
    }


    /**
     * Validate the transaction.
     * @returns Return a Validation object indicating if the transaction is valid.
     */
    isValid(): Validation {
        if (this.hash !== this.generateHash()) {
            return new Validation(false, 'Transaction.ts: Invalid transaction hash');
        }
        if(!this.txOutputs || !this.txOutputs.length || this.txOutputs.map(txo => txo.isValid()).some(v => !v.success)) {
            return new Validation(false, 'Transaction.ts: Invalid or missing transactionOutput');
        }

        if (this.txInputs && this.txInputs.length) {
            const inputValidations = this.txInputs.map(txi => txi.isValid()).filter(v => !v.success);
            if (inputValidations && inputValidations.length) {
                const messages = inputValidations.map(v => v.message).join("; ");
                return new Validation(false, `Transaction.ts: Invalid txInputs: ${messages}`);
            }

            const inputSum = this.txInputs.reduce((sum, txi) => sum + txi["amount"], 0)
            const outputSum = this.txOutputs.reduce((sum, txo) => sum + txo["amount"], 0)
            if (inputSum < outputSum) {
                return new Validation(false, 'Transaction.ts: Input amount is less than output amount');
            }
        }

        if (this.txOutputs.some(txo => txo["tx"] !== this.hash)) {
            return new Validation(false, 'Transaction.ts: TransactionOutput.tx does not match transaction hash');
        }

        // TODO: validate FEEs

        return new Validation(true);
    }


    getFee(): number {
        if (!this.txInputs || !this.txInputs.length) {
            return 0;
        }

        const inputSum = this.txInputs.reduce((sum, txi) => sum + txi["amount"], 0);
        const outputSum = this.txOutputs ? this.txOutputs.reduce((sum, txo) => sum + txo["amount"], 0) : 0;
        return inputSum - outputSum;
    }


    /**
     * Generates a unique hash for the transaction.
     * @returns The SHA-256 hash of the transaction details.
     */
    private generateHash(): string {
        const from = this.txInputs && this.txInputs.length
        ? this.txInputs.map(txi => txi["signature"]).join(",") 
        : "";

        const to = this.txOutputs && this.txOutputs.length
        ? this.txOutputs.map(txo => txo.getHash()).join(",") 
        : "";

        return sha256(this.type + this.timestamp + from + to).toString();
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