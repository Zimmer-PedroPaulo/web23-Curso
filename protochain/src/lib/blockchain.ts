import Block from './block';
import Validation from './validation';
import BlockInfo from './blockInfo';

/**
 * Class representing a simple Blockchain.
 */
export default class Blockchain {
    private blocks: Block[];
    static readonly DIFICULTY_FACTOR = 15;
    static readonly MAX_DIFICULTY = 62;

    /**
     * Create a new Blockchain.
     */
    constructor() {
        this.blocks = [new Block({miner: "system", data: "Genesis Block"})];
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
            if (currentBlock.getPreviousHash() !== previousBlock.generateHash()) {
                return new Validation(false, `Block ${i} previous hash is invalid`);
            }
            
            // Validate the block
            const validation = currentBlock.isValid(this.getDificulty());
            if (!validation.success) {
                return new Validation(false, `Block ${i} is invalid: ${validation.message}`);
            }
        }
        return new Validation(true);
    }


    getDificulty(): number {
        return Math.ceil(this.blocks.length / Blockchain.DIFICULTY_FACTOR);
    }
    

    /**
     * Add a new block to blockchain.
     * @param block - a Block object to add to.
     * @returns Return a Validation object indicating if the block is successfuly added.
     */
    addBlock(block: Block): Validation {
        const lastBlock = this.getLastBlock();

        // Validate if the previousHash of the new Block is valid
        if(block.getPreviousHash() !== lastBlock.getHash()){
            return new Validation(false, "Invalid block: Hash is not equal to the blockchain's last block");
        }

        // Validate the new Block itself is valid
        const validation = block.isValid(this.getDificulty())
        if (!validation.success) {
            return new Validation(false, `Invalid block: ${validation.message}`);
        }

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
            return this.blocks.find(block => block.getHash() === indexOrHash);
    }

    
    /**
     * Get the lastBlock from blockchain.
     * @returns the lastBlock of blockchain.
     */
    getLastBlock(): Block {
        return this.blocks[this.blocks.length - 1];
    }


    getFeePerTX(): number{
        return 1;
    }


    getNextBlock(): BlockInfo{
        const data = new Date().toString();
        const dificulty = this.getDificulty();
        const previousHash = this.getLastBlock().getHash();
        const index = this.blocks.length;
        const feePerTX = this.getFeePerTX();
        const maxDificulty = Blockchain.MAX_DIFICULTY;
        return{
            index,
            previousHash,
            dificulty,
            maxDificulty,
            feePerTX,
            data
        } as BlockInfo;
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