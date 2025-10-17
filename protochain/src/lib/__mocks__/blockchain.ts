import Block from './block';
import Validation from '../validation';
import BlockInfo from '../blockInfo';

/**
 * Mocked Blockchain.
 */
export default class Blockchain {
    private blocks: Block[];
    static readonly DIFICULTY_FACTOR = 5;
    static readonly MAX_DIFICULTY = 62;

    /**
     * Create a new mocked Blockchain.
     */
    constructor() {
        this.blocks = [new Block({miner: "system", data: "Genesis Block"})];
    }


    /**
     * Validate the blockchain
     * @returns Return a Validation object indicating if the blockchain is valid.
     */
    isValid(): Validation {
        return new Validation(true);
    }
    

    /**
     * Add a new block to blockchain.
     * @param block - a Block object to add to.
     * @returns Return a Validation object indicating if the block is successfuly added.
     */
    addBlock(block: Block): Validation {
        if(block.data === "Invalid block") return new Validation(false, "Invalid mock block");

        this.blocks.push(block);
        return new Validation(true);
    }


    /**
     * Get a block from blockchain.
     * @param indexOrHash - The index (as string) or the hash of the block you want.
     * @returns a Block object if found, 'undefined' otherwise.
     */
    getBlock(indexOrHash: string): Block{
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
        return this.blocks[this.blocks.length - 1];
    }


    getNextBlock(): BlockInfo{
        return{
            data: new Date().toString(),
            dificulty: 0,
            previousHash: this.getLastBlock().getHash(),
            index: 1,
            feePerTX: 1,
            maxDificulty: 62
        } as BlockInfo;
    }
    
    
    getFeePerTX(): number{
        return 1;
    }


    getDificulty(): number {
        return Math.ceil(this.blocks.length / Blockchain.DIFICULTY_FACTOR);
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