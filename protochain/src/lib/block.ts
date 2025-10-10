import sha256 from "crypto-js/sha256";
import Validation from "./validation";

/**
 * Block class represents a single block in the blockchain.
 */
export default class Block {
    // index: number;
    hash: string;
    timestamp: number;
    previousHash: string;
    data: string;

    /**
     * Create a new Block.
     * @param index - The index of the block in BlockChain.
     * @param previousHash - The hash of the previous block.
     * @param data - The data to be stored in the block.
     */
    constructor(previousHash: string, data: string) {
        // this.index = index;
        this.timestamp = Date.now();
        this.previousHash = previousHash;
        this.data = data;
        this.hash = this.generateHash();
    }

    /**
     * Generate the Hash
     * @returns calculated hash (not the property .hash stored in block)
     */
    generateHash(): string {
        return sha256(
            // this.index +
            this.data +
            this.timestamp +
            this.previousHash
        ).toString();
    }

    /**
     * Validate the block.
     * @returns Return a Validation object indicating if the block is valid.
     */
    isValid(): Validation {
        if (!this.data) return new Validation(false, "Empty data");
        if (this.timestamp < 1) return new Validation(false, "Invalid timestamp");
        if (this.hash !== this.generateHash()) return new Validation(false, "Invalid hash");
        return new Validation(true);
    }
}