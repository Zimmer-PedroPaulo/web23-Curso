import sha256 from "crypto-js/sha256";
import Validation from "./validation";

export default class TransactionOutput {
    private toAddress: string;
    private amount: number;
    private tx: string;

    /**
     * Create a new TransactionOutput.
     * @param data - A structure containing all data for the transaction output.    
     **/
    constructor(data?: {
        toAddress?: string;
        amount?: number;
        tx?: string;
    }) {
// console.log("TransactionOutput constructor: receiving:", data);
        this.toAddress = data?.toAddress || "";
        this.amount = data?.amount || 0;
        this.tx = data?.tx || "";
// console.log("TransactionOutput constructor: created:", this);
    }


    isValid(): Validation {
        if (this.amount < 1) {
            return new Validation(false, "TransactionOutput amount must be greater than zero");
        }
        return new Validation(true);
    }

    getHash(): string {
        return sha256(this.toAddress + this.amount).toString();
    }
}