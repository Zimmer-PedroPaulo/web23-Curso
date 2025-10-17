import Validation from "../validation";

/**
 * Mocked block class.
 */
export default class Block {
    previousHash: string;
    private nonce: number;
    private miner: string;
    data: string;
    private hash: string;
    private timestamp: number;

    /**
     * Create a new MOCK Block.
     * @param data - A structure containing all data for the block.
     */
    constructor(data?: {
        previousHash?: string;
        nonce?: number;
        miner?: string;
        data?: string;
        hash?: string;
        timestamp?: number;
    }) {
        this.previousHash = data?.previousHash || "";
        this.nonce = data?.nonce || 0;
        this.miner = data?.miner || "";
        this.data = data?.data || "";
        this.hash = data?.hash || this.generateHash();
        this.timestamp = data?.timestamp || Date.now();
    }


    /**
     * Generate a new valid hash with the specified dificulty.
     * @param dificulty - The Blockchain current dificulty.
     * @param miner - The miner wallet addess.
     */
    mine(dificulty: number, miner: string){
        
        // Mock mining process
    }


    /**
     * Get Mock Block hash
     * @returns the .hash property
     */
    getHash(): string{
        return this.hash || "abc";
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
    generateHash(): string {
        return  "abc";
    }


    /**
     * Validate mock block.
     * @returns Return a Validation object indicating if the block is valid.
     */
    isValid(dificulty: number): Validation {
        if (this.data.includes("Invalid")) return new Validation(false, "Invalid mock block");
        return new Validation(true);
    }
}