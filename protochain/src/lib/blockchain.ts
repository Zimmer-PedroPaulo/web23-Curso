import Block from './block';
import BlockInfo from './blockInfo';
import Transaction from './transaction';
import TransactionInput from './transactionInput';
import TransactionOutput from './transactionOutput';
import TransactionSearch from './transactionSearch';
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
    static readonly MAX_DIFFICULTY = 16;
    static readonly TX_PER_BLOCK = 2;

    /**
     * Create a new Blockchain.
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
        if(transaction["txInputs"] && transaction["txInputs"].length) {
            const txFromAddress = transaction["txInputs"]?.[0]?.["fromAddress"];
            const pendingTxs = this.mempool
                .filter(tx => tx["txInputs"])
                .map(tx => tx["txInputs"])
                .flat()
                .filter(txi => txi!["fromAddress"] === txFromAddress);
            const protoBlockTxs = this.protoBlock.getTransactions()
                .filter(tx => tx["txInputs"])
                .map(tx => tx["txInputs"])
                .flat()
                .filter(txi => txi!["fromAddress"] === txFromAddress);
            pendingTxs.push(...protoBlockTxs);

            if(pendingTxs && pendingTxs.length) {
                return new Validation(false, "There is already a pending transaction from this address in the mempool");
            }

            const utxo = this.getUTXO(txFromAddress!);
            // const inputSum = transaction["txInputs"].reduce((sum, txi) => sum + txi["amount"], 0);
            for(const txi of transaction["txInputs"]) {
                if (utxo.findIndex(txo => txo!["tx"] === txi["previousTx"]) === -1) {
                    return new Validation(false, "previousTx in a transactionInput is already spent or does not exist");
                }
            }
        }

        // TODO: Further checks like balance, double spending, etc.

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
        if (!this.protoBlock.getHash() || this.protoBlock.getHash() === "-Empty ProtoBlock-") {
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
            blockchainReward: this.getReward(),
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
        const difficulty = Math.ceil(index / Blockchain.DIFFICULTY_FACTOR);

        if (difficulty > Blockchain.MAX_DIFFICULTY) {
            return Blockchain.MAX_DIFFICULTY;
        }

        return difficulty;
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
        return JSON.parse(JSON.stringify(this.blocks)) as Block[];
    }


    getMempool(): Transaction[] {
        return JSON.parse(JSON.stringify(this.mempool)) as Transaction[];
    }


    getBalance(walletAddress: string): number {
        const utxo = this.getUTXO(walletAddress);
        return utxo.reduce((sum, txo) => sum + (txo!["amount"]), 0);
    }


    getUTXO(walletAddress: string): (TransactionOutput | undefined)[] {
        const txIns = this.getTxInputs(walletAddress);
        const txOuts = this.getTxOutputs(walletAddress);

        if (!txIns || !txIns.length) {
            return txOuts;
        }

        txIns.forEach(txi => {
            const index = txOuts.findIndex(txo => 
                txo!["amount"] === txi!["amount"]
            );
            txOuts.splice(index, 1);
        });

        return txOuts;
    }


    private getTxInputs(walletAddress: string): TransactionInput[] {
        return this.blocks
        .map(block => block.getTransactions())
        .flat()
        .map(tx => tx["txInputs"] && tx["txInputs"].length ? tx["txInputs"] : [])
        .flat()
        .filter(txi => txi!["fromAddress"] === walletAddress);
    }


    private getTxOutputs(walletAddress: string): (TransactionOutput | undefined)[] {
        return this.blocks
        .map(block => block.getTransactions())
        .flat()
        .filter(tx => tx["txOutputs"] && tx["txOutputs"].length)
        .map(tx => tx["txOutputs"])
        .flat()
        .filter(txo => txo!["toAddress"] === walletAddress);
    }
}