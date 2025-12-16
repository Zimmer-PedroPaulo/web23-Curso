import Block from './block';
import BlockInfo from './blockInfo';
import Transaction from './transaction';
import TransactionInput from './transactionInput';
import TransactionSearch from './transactionSearch';
import TransactionType from './transactionType';
import Validation from './validation';
import Wallet from './wallet';

/**
 * Class representing a simple Blockchain.
 */
export default class Blockchain {
    private blocks: Array<Block>;
    private mempool: Array<Transaction>;
    private protoBlock: Block;
    private genesisWallet: Wallet;

    static readonly DIFFICULTY_FACTOR = 5;
    static readonly MAX_DIFFICULTY = 62;
    static readonly TX_PER_BLOCK = 2;

    /**
     * Create a new Blockchain.
     */
    constructor() {
        this.genesisWallet = new Wallet('87b1899544195b78bb7988434d8291213dfe9853856e46e57d2f20ffaed61200');
        this.mempool = [];
        this.blocks = [new Block({
            miner: "genesis", 
            transactions: [{
                type: TransactionType.FEE,
                timestamp: 0,
                to: "03ab48e01eda74405c5a1ea4d51ebf98f8f470a86e9d5e8bc38ff5ecd76fde3348",
                txInput: {
                    fromAddress: "",
                    amount: 50,
                }
            }]
        })];
        this.blocks[0]!.getTransactions()[0]!["txInput"]!.sign(this.genesisWallet['privateKey']);
        this.protoBlock = new Block({
            transactions: [],
            hash: "-Empty ProtoBlock-"
        });
    }


    /**
     * Validate the blockchain
     * @returns Return a Validation object indicating if the blockchain is valid.
     */
    isValid(): Validation {
        for (let i = this.blocks.length - 1; i > 0; i--) {
            const currentBlock = this.getBlock(i.toString());
            const previousBlock = this.getBlock((i - 1).toString());
            
            // Validate the previousHash
            if (currentBlock!.getPreviousHash() !== previousBlock!.getHash()) {
                return new Validation(false, `Block ${i} previous hash is invalid`);
            }
            
            // Validate the block
            const validation = currentBlock!.isValid(this.getDifficulty(i));
            if (!validation.success) {
                return new Validation(false, `Block ${i} is invalid: ${validation.message}`);
            }
        }
        return new Validation(true);
    }


    /** Add a new transaction to the mempool.
     * @param transaction - a Transaction object to add.
     * @returns Return a Validation object indicating if the transaction is successfuly added.
     */ 
    addTransaction(transaction: Transaction): Validation {
        const validation = transaction.isValid();
        if (!validation.success) {
            return new Validation(false, `Invalid transaction: ${validation.message}`);
        }

        if(this.blocks.some(b => b.getTransactions(transaction.getType()).some(tx => tx.getHash() === transaction.getHash()))) {
            return new Validation(false, "Transaction already in blockchain");
        }

        if(this.mempool.some(tx => tx.getHash() === transaction.getHash())) {
            return new Validation(false, "Transaction already in mempool");
        }

        this.mempool.push(transaction);
        return new Validation(true, transaction.getHash());
    }
    

    /**
     * Add a new block to blockchain.
     * @param block - a Block object to add to.
     * @returns Return a Validation object indicating if the block is successfuly added.
     */
    addBlock(nonce: number, miner: string, feePerTX: number): Validation {
        if (!this.protoBlock.getTransactions(TransactionType.REGULAR).length){
            return new Validation(false, "No protoBlock to add");
        }

        const protoBlockData = JSON.parse(JSON.stringify(this.protoBlock));
        const newBlock = new Block({
            transactions: protoBlockData.transactions,
            previousHash: this.protoBlock.getPreviousHash(),
            timestamp: protoBlockData.timestamp
        });
        newBlock.reward(miner, feePerTX);
        newBlock.mine(this.getDifficulty(), nonce);

        // Validate the new Block itself is valid
        const validation = newBlock.isValid(this.getDifficulty())
        if (!validation.success) {
            return new Validation(false, `[Block validation fails: ${validation.message}, invalid Block: ${JSON.stringify(newBlock)}]`);
        }

        this.blocks.push(newBlock);
        this.protoBlock = new Block({
            transactions: [],
            hash: "-Empty ProtoBlock-"
        });

        return new Validation(true, "Block added successfully.");
    }


    getMempool(): Transaction[] {
        return JSON.parse(JSON.stringify(this.mempool)) as Transaction[];
    }


    getTransaction(hash: string): TransactionSearch {
        const block = this.blocks.find(block => 
            block.getTransactions().some(tx => tx.getHash() === hash)
        );

        const blockIndex = block? this.blocks.indexOf(block) : -1;
        const mempoolIndex = this.mempool.findIndex(tx => tx.getHash() === hash);

        const tx = mempoolIndex !== -1 ? this.mempool[mempoolIndex] : blockIndex !== -1 ? this.blocks[blockIndex]?.getTransactions().find(tx => tx.getHash() === hash) : undefined;
        return  {
            transaction: tx? JSON.parse(JSON.stringify(tx)) : undefined,
            blockIndex: blockIndex,
            mempoolIndex: mempoolIndex
        }  as TransactionSearch;
    }


    /**
     * Retrieves a block from the blockchain by index or hash.
     * @param indexOrHash - The block index (as a string of digits) or the block hash
     * @returns The block if found, otherwise undefined
     */
    getBlock(indexOrHash: string): Block | undefined {
        if (/^[0-9]+$/.test(indexOrHash)) {
            const index = parseInt(indexOrHash);
            return this.blocks[index];
        } else {
            return this.blocks.find(block => block.getHash() === indexOrHash);
        }
    // getBlock(indexOrHash: string): Block | undefined {
    //     let block = this.blocks.find(block => block.getHash() === indexOrHash);
    //     if (!block && /^[0-9]+$/.test(indexOrHash)) {
    //         block = this.blocks[parseInt(indexOrHash)];
    //     }

    //     return block? JSON.parse(JSON.stringify(block)) as Block : undefined;
    }

    
    /**
     * Get the lastBlock from blockchain.
     * @returns the lastBlock of blockchain.
     */
    getLastBlock(): Block {
        return this.blocks[this.blocks.length - 1]!;
    }


    /**     * Get the next block to mine.
     * @returns a BlockInfo object with the next block and mining parameters.
     */
    getNextBlock(): BlockInfo{
        // Return an empty BlockInfo if no transactions in mempool
        if(!this.mempool || !this.mempool.length){
            return {index: -1, difficulty: 0, feePerTX: 0, protoBlock: this.protoBlock} as BlockInfo;
        }

        // Create the protoBlock if not exists
        if(this.protoBlock.getHash() === "-Empty ProtoBlock-"){
            const protoBlockTransactions = this.mempool.splice(0, Blockchain.TX_PER_BLOCK);
            
            this.protoBlock = new Block({
                transactions: JSON.parse(JSON.stringify(protoBlockTransactions)),
                previousHash: this.getLastBlock().getHash(),
                timestamp: Date.now(),
                hash: "not-mined-yet"
            });
        }

        return {
            index: this.blocks.length,
            difficulty: this.getDifficulty(),
            feePerTX: this.getFeePerTX(),
            protoBlock: this.protoBlock
        } as BlockInfo;
    }


    /**
     * Get the difficulty for a specific block or current difficulty of the blockchain.
     * @param blockIndex - The index of the block to get the difficulty for. 
     *                     If not provided, use the length of the blockchain for the current difficulty for mining.
     * @returns The difficulty level.
     */
    getDifficulty(blockIndex?: number): number {
        const index = blockIndex !== undefined ? blockIndex : this.blocks.length;   
        return Math.ceil(index / Blockchain.DIFFICULTY_FACTOR);
    }


    getFeePerTX(): number{
        return 1;
    }


    /**
     * Get the blockchain length.
     * @returns the blockchain blocks count.
     */
    getLength(): number{
        return this.blocks.length;
    }


    /**
     * Get the chain of blocks.
     * @returns the blocks[] array.
     */
    getChain(): Block[] {
        return JSON.parse(JSON.stringify(this.blocks)) as Block[];
    }
}