import Transaction from "../transaction";
import TransactionType from "../transactionType";
import Validation from "../validation";

/**
 * Mocked block class.
 */
export default class Block {
    private previousHash: string;
    private nonce: number;
    private miner: string;
    private transactions: Transaction[];
    private hash: string;
    private timestamp: number;

    /**
     * Create a new MOCK Block.
     * @param data - A structure containing all data for the block.
     */
    constructor(data: {
        transactions: Array<{
            type?: TransactionType;
            timestamp?: number;
            to?: string;
            txInput?: {
                fromAddress?: string;
                amount?: number;
                signature?: string;
            };
            hash?: string;
        }>;
        previousHash?: string;
        timestamp?: number;
        nonce?: number;
        miner?: string;
        hash?: string;
    }) {
        this.transactions = data.transactions.map(tx => new Transaction(tx))
        this.previousHash = data.previousHash || "";
        this.timestamp = data.timestamp || Date.now();
        this.nonce = data.nonce || 0;
        this.miner = data.miner || "";
        this.hash = data.hash || this.generateHash();
    }


    /**
     * Validate mock block.
     * @returns Return a Validation object indicating if the block is valid.
     */
    isValid(difficulty: number): Validation {
        if (this.hash === "Invalid mock block" || this.nonce === -1) 
            return new Validation(false, "Invalid mock block");
        return new Validation(true);
    }


    /**
     * Generate a new valid hash with the specified difficulty.
     * @param difficulty - The Blockchain current difficulty.
     * @param miner - The miner wallet addess.
     */
    mine(difficulty: number, nonce?: number): void {
        this.nonce = nonce !== undefined ? nonce : 0;
        this.hash = this.generateHash((nonce !== undefined ? nonce : 0));
    }


    reward(miner: string, feePerTX: number) {
        this.miner = miner;
        // this.transactions.push(new Transaction({
        //     type: TransactionType.FEE,
        //     timestamp: this.timestamp,
        //     data: `Mining reward for ${miner}: ${feePerTX * this.transactions.length} units`
        // }));
    }


    /** Get transactions of a specific type.
     * @param transactionType - The type of transactions to retrieve.
     * @returns An array of transactions of the specified type.
     */
    getTransactions(transactionType?: TransactionType): Transaction[] {
        // const txType = transactionType === undefined ? TransactionType.REGULAR : transactionType;
        return this.transactions //.filter(tx => tx.getType() === txType);
    }


    /**
     * Get Block miner
     * @returns the '.miner' property
     */
    getMiner(): string{
        return this.miner;
    }


    /**
     * Get Block nonce
     * @returns the '.nonce' property
     */
    getNonce(): number{
        return this.nonce;
    }


    /**
     * Get Mock Block hash
     * @returns the .hash property
     */
    getHash(): string{
        return this.hash;
    }


    /**
     * Get Mock Block previoushash
     * @returns the .previousHash property
     */
    getPreviousHash(): string{
        return this.previousHash;
    }


    /**
     * Generate mock block Hash
     * @returns calculated hash (not the property .hash stored in block)
     */
    generateHash(nonce?: number, miner?: string): string {
        return  "mocked block hash";
    }
}