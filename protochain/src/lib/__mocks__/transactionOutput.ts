import Validation from "../validation";

export default class TransactionOutput {
    private toAddress: string;
    private amount: number;
    private tx: string;

    /**
     * Create a mocked TransactionOutput.
     * @param data - A structure containing all data for the transaction output.    
     **/
    constructor(data?: {
        toAddress?: string;
        amount?: number;
        tx?: string;
    }) {
        this.toAddress = data?.toAddress || "TransactionOutput_mocked_wallet_address";
        this.amount = data?.amount || 10;
        this.tx = data?.tx || "TransactionOutput_mocked_tx";
    }


    isValid(): Validation {
        if (this.amount < 1) {
            return new Validation(false, "Invalid TransactionOutput mock");
        }
        return new Validation(true);
    }

    getHash(): string {
        return this.toAddress + "-mocked_transactionOutput_hash";
    }
}