import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import sha256 from 'crypto-js/sha256';
import Validation from './validation';
// import { TransactionInputData } from './transactionInputData';

const ECPair = ECPairFactory(ecc);

/** * A class representing a transaction input in a blockchain.
 */ 
export default class TransactionInput {
    private fromAddress: string;
    private amount: number;
    private signature: string;

    /** Create a new TransactionInput.
     * @param txInput - Optional structure containing transaction input data.
     */
    constructor(txInput?: {
        fromAddress?: string; 
        amount?: number; 
        signature?: string
    }) 
    {
// console.log("TransactionInput constructor: receiving:", txInput);
        this.fromAddress = txInput?.fromAddress || '';
        this.amount = txInput?.amount || 0;
        this.signature = txInput?.signature || '';
// console.log("TransactionInput constructor: created:", this);
    }


    isValid(): Validation {
        if (!this.signature) {
            return new Validation(false, "Signature is required");
        }

        if (this.amount < 1) {
            return new Validation(false, "Amount must be greater than zero");
        }

        const hash = Buffer.from(this.getHash(), 'hex');
        const valid = ECPair.fromPublicKey(Buffer.from(this.fromAddress, 'hex'))
            .verify(hash, Buffer.from(this.signature, 'hex'));
        
        return valid
            ? new Validation(true)
            : new Validation(false, "Invalid txInput signature");
    }


    sign(privateKey: string): void {
        this.signature = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'))
        .sign(Buffer.from(this.getHash(), 'hex')).toString('hex');
    }


    getHash(): string {
        return sha256(this.fromAddress + this.amount).toString();
    }
}