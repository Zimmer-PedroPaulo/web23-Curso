import Validation from '../validation';

/** Mocked class representing a transaction input in a blockchain.
 */ 
export default class TransactionInput {
    private fromAddress: string;
    private amount: number;
    private signature: string;

    /** Create a new TransactionInput.
     * @param txInput - Optional structure containing transaction input data.
     */
    constructor(txInput?: {fromAddress?: string; amount?: number; signature?: string}) {
        this.fromAddress = txInput?.fromAddress || 'TransactionInput_mocked_wallet_address';
        this.amount = txInput?.amount || 10;
        this.signature = txInput?.signature || 'TransactionInput_mocked_signature';
    }

    isValid(): Validation {
        if (this.signature.includes("invalid")) {
            return new Validation(false, "Invalid mocked transactionInput");
        }
        
// console.log("Mocked TransactionInput: fromAddress", this.fromAddress, "signature:", this.signature);
        // usa os primeiros caracteres do fromAddress para validar a assinatura mockada
        if (!this.signature.startsWith(this.fromAddress.substring(0, this.fromAddress.length - 18))) {
            return new Validation(false, "Invalid mocked signature");
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