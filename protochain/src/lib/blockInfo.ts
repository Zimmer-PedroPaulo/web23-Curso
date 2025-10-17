/**
 * Interface BlockInfo.
 * Informations to mining blocks.
 */
export default interface BlockInfo{
    index: number;
    previousHash: string;
    dificulty: number;
    maxDificulty: number;
    feePerTX: number;
    data: string;
}