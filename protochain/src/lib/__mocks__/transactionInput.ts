import Validation from '../validation';

/** Mocked class representing a transaction input in a blockchain.
 */ 
export default class TransactionInput {
    private fromAddress: string;
    private amount: number;
    private signature: string;
    private previousTx: string;

    /** Create a new TransactionInput.
     * @param txInput - Optional structure containing transaction input data.
     */
    constructor(txInput?: {
            fromAddress?: string; 
            amount?: number; 
            signature?: string; 
            previousTx?: string;
        })
        {
        this.fromAddress = txInput?.fromAddress || 'TransactionInput_mocked_wallet_address';
        this.amount = txInput?.amount || 10;
        this.signature = txInput?.signature || 'TransactionInput_mocked_signature';
        this.previousTx = txInput?.previousTx || 'TransactionInput_mocked_previousTx';
    }

    isValid(): Validation {
        if (this.signature.includes("invalid")) {
            return new Validation(false, "Invalid mocked transactionInput");
        }

        return new Validation(true);
    }

    sign(privateKey: string): void {
        this.signature = privateKey + "TransactionInput_mocked_Signature";
    }

    getHash(): string {
        return "TransactionInput_mocked_Hash";
    }
}