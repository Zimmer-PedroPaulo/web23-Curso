import Block from './block';
import Validation from '../validation';
import BlockInfo from '../blockInfo';
import Transaction from '../transaction';
import TransactionType from '../transactionType';
import TransactionSearch from '../transactionSearch';
import TransactionInput from '../transactionInput';

/**
 * Mocked Blockchain.
 */
export default class Blockchain {
    private blocks: Block[];
    private mempool: Transaction[];
    private protoBlock: Block;

    static readonly DIFFICULTY_FACTOR = 5;
    static readonly MAX_DIFFICULTY = 62;
    static readonly TX_PER_BLOCK = 2;

    /**
     * Create a new mocked Blockchain.
     */
    constructor() {
        this.mempool = [];
        this.blocks = [new Block({
            miner: "genesis", 
            transactions: [new Transaction({
                type: TransactionType.FEE,
                timestamp: 999999999,
                to: "87b1899544195b78bb7988434d8291213dfe9853856e46e57d2f20ffaed61200",
                txInput: new TransactionInput({
                    fromAddress: "03ab48e01eda74405c5a1ea4d51ebf98f8f470a86e9d5e8bc38ff5ecd76fde3348",
                    amount: 50,
                    signature: "genesis-signature"
                }) as TransactionInput
            }) as Transaction]
        })];
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
        return new Validation(true);
    }
    
    
    /** Add a new transaction to the mempool.
     * @param transaction - a Transaction object to add.
     * @returns Return a Validation object indicating if the transaction is successfuly added.
     */ 
    addTransaction(transaction: Transaction): Validation {
        const validation = transaction.isValid();
        if(!validation.success){
            return new Validation(false, validation.message);
        }
        this.mempool.push(transaction);
        return new Validation(true);
    }
    

    getMempool(): Transaction[] {
        return JSON.parse(JSON.stringify(this.mempool)) as Transaction[];
        }


    getTransaction(hash: string): TransactionSearch {
        const mempoolIndex = this.mempool.findIndex(tx => tx.getHash() === hash);
        // if (mempoolIndex !== -1) {
            return {
                transaction: this.mempool[mempoolIndex],
                mempoolIndex,
                blockIndex: -1
            } as TransactionSearch;
        // }

        // const blockIndex = this.blocks.findIndex(block => 
        //     block.getTransactions().some(tx => tx.getHash() === hash)
        // );
        // if (blockIndex !== -1) {
        //         const transaction = this.blocks[blockIndex].getTransactions().find(tx => tx.getHash() === hash);
        //             return {
        //                 transaction,
        //                 mempoolIndex: -1,
        //                 blockIndex
        //             } as TransactionSearch;
        // }

        // return {blockIndex: -1, mempoolIndex: -1} as TransactionSearch;
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
        this.protoBlock.reward(miner, feePerTX);
        this.protoBlock.mine(this.getDifficulty());

        this.blocks.push(this.protoBlock);
        this.protoBlock = new Block({
            transactions: [],
            hash: "-Empty ProtoBlock-"
        });

        return new Validation(true, "Mock blockchain added a block successfully.");
    }


    /**
     * Get a block from blockchain.
     * @param indexOrHash - The index (as string) or the hash of the block you want.
     * @returns a Block object if found, 'undefined' otherwise.
     */
    getBlock(indexOrHash: string): Block | undefined {
        if (/^[0-9]+$/.test(indexOrHash))
            return this.blocks[parseInt(indexOrHash)];
        else
            return this.blocks.find(b => b.getHash() === indexOrHash);
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
            return {index: -1, difficulty: 0, feePerTX: 0, protoBlock: this.protoBlock} as unknown as BlockInfo;
        }

        // Create the protoBlock if not exists
        if(this.protoBlock.getHash() === "-Empty ProtoBlock-"){            
            this.protoBlock = new Block({
                transactions: this.mempool,
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
        } as unknown as BlockInfo;
    }


    getDifficulty(): number {
        return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR);
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
        return this.blocks;
    }
}