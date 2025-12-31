import Block from './block';
import Validation from '../validation';
import BlockInfo from '../blockInfo';
import Transaction from '../transaction';
import TransactionSearch from '../transactionSearch';
import Wallet from '../wallet';
import TransactionOutput from '../transactionOutput';
import TransactionInput from '../transactionInput';

/**
 * Mocked Blockchain.
 */
export default class Blockchain {
    private blocks: Block[];
    private mempool: Transaction[];
    private protoBlock: Block;
    private genesisWallet: Wallet;

    static readonly DIFFICULTY_FACTOR = 5;
    static readonly MAX_DIFFICULTY = 16;
    static readonly TX_PER_BLOCK = 2;

    /**
     * Create a new mocked Blockchain.
     */
    constructor() {
        this.genesisWallet = new Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY);
        this.mempool = [];
                this.blocks = new Array<Block>();
        
                const genesisBlock = new Block({
                    previousHash: "0".repeat(64),
                    transactions: [],
                });
                genesisBlock.reward(this.genesisWallet.getPublicKey(), this.getReward());
                genesisBlock.mine(this.getDifficulty());
        
                this.blocks.push(genesisBlock);

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
    

    /**
     * Add a new block to blockchain.
     * @param block - a Block object to add to.
     * @returns Return a Validation object indicating if the block is successfuly added.
     */
    addBlock(nonce: number, miner: string, feePerTX: number): Validation {
        if (!this.protoBlock.getHash() || this.protoBlock.getHash() === "-Empty ProtoBlock-") {
            return new Validation(false, "No protoBlock to add");
        }
        this.protoBlock.reward(miner, feePerTX);
        this.protoBlock.mine(this.getDifficulty());

        this.blocks.push(this.protoBlock);
        this.protoBlock = new Block({
            hash: "-Empty ProtoBlock-"
        });

        return new Validation(true, "Mock blockchain added a block successfully.");
    }
    



    


    getTransaction(hash: string): TransactionSearch {
        const mempoolIndex = this.mempool.findIndex(tx => tx.getHash() === hash);
        return {
            transaction: this.mempool[mempoolIndex],
            mempoolIndex,
            blockIndex: -1
        } as TransactionSearch;
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
        } as unknown as BlockInfo;
    }


    getDifficulty(): number {
        return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR);
    }
    
    
    getFeePerTX(): number{
        return 1;
    }


    getReward(): number{
        return 16 - this.getDifficulty();
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


    getMempool(): Transaction[] {
        return JSON.parse(JSON.stringify(this.mempool)) as Transaction[];
    }


    getBalance(walletAddress: string): number {
        return 10;
    }


    getUTXO(walletAddress: string): (TransactionOutput | undefined)[] {
        return this.getTxOutputs(walletAddress);
    }


    private getTxInputs(walletAddress: string): (TransactionInput | undefined)[] {
        return [ new TransactionInput({
            fromAddress: walletAddress,
            amount: 10,
            previousTx: "sample_tx_hash_0000000000000000000000000000000000000000000000000000000000",
            signature: "sample_signature_0000000000000000000000000000000000000000000000000000000000"
        }) ];
    }


    private getTxOutputs(walletAddress: string): (TransactionOutput | undefined)[] {
        return [ new TransactionOutput({
            toAddress: walletAddress,
            amount: 10,
            tx: "sample_tx_hash_0000000000000000000000000000000000000000000000000000000000"
        }) ];
    }
}