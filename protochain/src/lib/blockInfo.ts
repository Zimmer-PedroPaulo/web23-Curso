import Block from "./block";

/**
 * Interface BlockInfo.
 * Informations to mining blocks.
 */
export default interface BlockInfo{
    index: number;
    difficulty: number;
    feePerTX: number;
    protoBlock: Block;
}