import TransactionInput from '../__mocks__/transactionInput';
import TransactionOutput from '../__mocks__/transactionOutput';
import TransactionType from '../transactionType';
import Validation from '../validation';

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
     * Create a MOCKED Transaction.
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
    }


    /**
     * Mock validation for the transaction.
     * @returns Return a Validation object indicating if the transaction is valid.
     */
    isValid(): Validation {
        if(this.hash === "Invalid mock transaction") {
            return new Validation(false, 'Invalid mock transaction');
        }
        return new Validation(true);
    }


    /**     * Get the fee of the transaction.
     * @returns The fee amount of the transaction.
     */
    getFee(): number {
        if (!this.txInputs || !this.txInputs.length) {
            return 0;
        }

        // const inputSum = this.txInputs.reduce((sum, txi) => sum + txi["amount"], 0);
        // const outputSum = this.txOutputs ? this.txOutputs.reduce((sum, txo) => sum + txo["amount"], 0) : 0;
        return 1 //inputSum - outputSum;
    }


    /**
     * Generates a mocked hash for the transaction.
     * @returns The mocked hash of the transaction details.
     */
    private generateHash(): string {
        // wait a moment...
        // (blockchain is generating 2 mocked transactions with same timestamp....)
        const start = Date.now();
        while (Date.now() - start < 100) {
            // Simulate delay
        }
        return "mocked transaction hash-" + this.timestamp;
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