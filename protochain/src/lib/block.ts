import sha256 from "crypto-js/sha256";
import Validation from "./validation";
import Transaction from "./transaction";
import TransactionType from "./transactionType";

/**
 * Block class represents a single block in the blockchain.
 */
export default class Block {
    private previousHash: string;
    private nonce: number;
    private miner: string;
    private transactions: Array<Transaction> = Array<Transaction>();
    private hash: string;
    private timestamp: number;

    /**
     * Create a new Block.
     * @param data - A structure containing all data for the block.
     */
    constructor(data: {
        transactions?: Array<{
            type?: TransactionType;
            timestamp?: number;
            txInputs?: Array<   {
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
        }>;
        previousHash?: string;
        timestamp?: number;
        nonce?: number;
        miner?: string;
        hash?: string;
    }) {
// console.log("Block constructor: receiving:", data);
        this.previousHash = data.previousHash || "";
        this.timestamp = data.timestamp || Date.now();
        this.nonce = data.nonce || 0;
        this.miner = data.miner || "";
        if (data.transactions) {
            if (data.transactions.length){
                this.transactions = data.transactions.map(tx => new Transaction(tx)) ;
            }
        }
        this.hash = data.hash || this.generateHash();
// console.log("Block constructor: created:", this);
    }


    /**
     * Validate the block.
     * @param difficulty - The Blockchain current difficulty.
     * @returns Return a Validation object indicating if the block is valid.
     */
    isValid(difficulty: number = -1): Validation {
        if (!this.nonce || !this.miner || this.nonce < 1) {
            return new Validation(false, "Block.ts: Not mined block");
        }

        const feeTxs = this.transactions.filter(tx => tx.getType() === TransactionType.FEE)
        if(feeTxs.length !== 1) {
            return new Validation(false, "Block.ts: A block must have exactly one fee transaction");
        }
        if(feeTxs.length === 1 && feeTxs[0]!["txOutputs"] && !(feeTxs[0]!["txOutputs"].some(txo => txo["toAddress"] === this.getMiner()))) {
            return new Validation(false, "Block.ts: Fee transaction must have an txOutput with the miner address");
        }

        if (this.getTransactions(TransactionType.REGULAR).length === 0) {
            return new Validation(false, "Block.ts: Block must have at least one regular transaction");
        }

        // TODO: validate transaction's FEEs

        const txValidations = this.transactions.map(tx => tx.isValid());
        const errors = txValidations.filter(v => !v.success).map(v => v.message);
        if(errors.length) {
            return new Validation(false, "Block.ts: Invalid transaction in block: " + errors.reduce((a,b) => a + "; " + b));
        }

        const prefix = new Array(difficulty + 1).join("0");
        if (!this.hash.startsWith(prefix) || this.hash !== this.generateHash()){
            return new Validation(false, "Block.ts: Invalid hash");
        }

        return new Validation(true);
    }


    /**
     * Generate the Hash
     * @returns calculated hash (not the property .hash stored in block)
     */
    generateHash(nonce?: number, miner?: string): string {
        let txs: string = "";
        if (this.transactions.length){
            const txs = this.transactions.map(tx => tx.getHash()).reduce((a, b) => a + b);
        }
        
        return sha256(
            txs +
            this.timestamp +
            this.previousHash +
            (nonce !== undefined ? nonce : this.nonce) +
            (miner !== undefined ? miner : this.miner)
        ).toString();
    }


    /**
     * Generate a new valid hash with the specified diffficulty.
     * @param difficulty - The Blockchain current difficulty.
     * @param nonce - Optional nonce to set directly (skip mining).
     */
    mine(difficulty: number, nonce?: number): void {
        if (this.getTransactions(TransactionType.FEE).length === 0) {
            return;
        }

        if (nonce !== undefined) {
            this.nonce = nonce;
            this.hash = this.generateHash();
            return;
        }
        
        const prefix = new Array(difficulty + 1).join("0");
        do {
            this.nonce++;
            this.hash = this.generateHash();
        } while (!this.hash.startsWith(prefix));
    }


    /** Add a reward transaction to the block for the miner.
     * Calculates the total as the diference between txInputs and txOutputs from each transaction in the block 
     * and adds the blockchain reward to it. 
     * @param miner - The miner's wallet address.
     * @param blockchainReward - The blockchain reward amount.
     * @returns A Validation object indicating success or failure.
     */
    reward(miner: string, blockchainReward: number): Validation {
        if (this.transactions.filter(tx => tx.getType() === TransactionType.FEE).length !== 0) {
            return new Validation(false, "Block.reward: Block already has a fee transaction");
        }

        this.miner = miner;
        this.transactions.push(new Transaction({
            type: TransactionType.FEE,
            txOutputs: [{ 
                toAddress: miner, 
                amount: this.transactions.reduce((sum, tx) => sum + tx.getFee(), 0) + blockchainReward,
            }]
        }));
        return new Validation(true);
    }


    /** Get transactions of a specific type.
     * @param transactionType - The type of transactions to retrieve.
     * @returns An array of block's transactions of the specified type.
     */
    getTransactions(transactionType?: TransactionType): Transaction[] {
        let transactions = new Array<Transaction>();

        this.transactions.forEach(tx => {
            if (transactionType === undefined || tx.getType() === transactionType) {
                transactions.push(tx);
            }
        }); 
        return transactions;
    }


    /**
     * Get Block nonce
     * @returns the '.nonce' property
     */
    getNonce(): number{
        return this.nonce;
    }


    /**
     * Get Block miner
     * @returns the '.miner' property
     */
    getMiner(): string{
        return this.miner;
    }


    /**
     * Get Block hash
     * @returns the .hash property
     */
    getHash(): string{
        return this.hash;
    }


    /**
     * Get Block previoushash
     * @returns the .previousHash property
     */
    getPreviousHash(): string{
        return this.previousHash;
    }
}