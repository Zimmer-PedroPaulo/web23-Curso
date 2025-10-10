import Block from './block';
import Validation from './validation';

/**
 * Class representing a simple Blockchain.
 */
export default class Blockchain {
    blocks: Block[];

    /**
     * Create a new Blockchain.
     */
    constructor() {
        this.blocks = [new Block("", "Genesis Block")];
    }

    /**
     * Get a block from blockchain.
     * @param indexOrHash - The index (as string) or the hash of the block you want.
     * @returns a Block object if found, 'undefined' otherwise.
     */
    getBlock(indexOrHash: string) : Block | undefined{
        if (/^[0-9]+$/.test(indexOrHash))
            return this.blocks[parseInt(indexOrHash)];
        else
            return this.blocks.find(b => b.hash === indexOrHash);
    }

    /**
     * Get the lastBlock from blockchain.
     * @returns the lastBlock of blockchain.
     */
    getLastBlock(): Block {
        const lastBlock = this.blocks[this.blocks.length - 1];
        return lastBlock;
    }
    
    /**
     * Add a new block to blockchain.
     * @param block - a Block object to add to.
     * @returns Return a Validation object indicating if the block is successfuly added.
     */
    addBlock(block: Block): Validation {
        const lastBlock = this.getLastBlock();

        // Validate if the previousHash of the new Block is valid
        if(block.previousHash !== lastBlock.hash)
            return new Validation(false, "Invalid block: Hash is not equal to the blockchain's last block");

        // Validate the new Block itself is valid
        const validation = block.isValid()
        if (!validation.success) 
            return new Validation(false, `Invalid block: ${validation.message}`);

        this.blocks.push(block);
        return new Validation(true);
    }

    /**
     * Validate the blockchain
     * @returns Return a Validation object indicating if the blockchain is valid.
     */
    isValid(): Validation {
        for (let i = this.blocks.length - 1; i > 0; i--) {
            const currentBlock = this.blocks[i];
            const previousBlock = this.blocks[i - 1];
            
            // Validate the block
            const validation = currentBlock.isValid();
            if (!validation.success) {
                return new Validation(false, `Block ${i} is invalid: ${validation.message}`);
            }
            
            // Validate the previousHash
            if (currentBlock.previousHash !== previousBlock.hash) {
                return new Validation(false, `Block ${i} previous hash is invalid`);
            }
        }
        return new Validation(true);
    }
}