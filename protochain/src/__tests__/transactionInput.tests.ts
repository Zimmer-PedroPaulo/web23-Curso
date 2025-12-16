import TransactionInput from "../lib/transactionInput";
import Wallet from "../lib/wallet";

describe('TransactionInput tests', () => {
 
    const aliceWallet: Wallet = new Wallet();
    const bobWallet: Wallet = new Wallet();

    test('should be valid', () => {
        const txInput = new TransactionInput({
            fromAddress: aliceWallet.getPublicKey(),
            amount: 100
        });
        txInput.sign(aliceWallet['privateKey']);

        expect(txInput.isValid().success).toBe(true);
    });


    test('should be invalid - invalid signature', () => {
        const txInput = new TransactionInput({
            fromAddress: aliceWallet.getPublicKey(),
            amount: 100
        });
        txInput.sign(bobWallet['privateKey']);

        expect(txInput.isValid().message).toBe("Invalid txInput signature");
    });


    test('should be invalid - no signature', () => {
        const txInput = new TransactionInput();
        expect(txInput.isValid().success).toBe(false);
        expect(txInput.isValid().message).toBe("Signature is required");
    });


    test('should be invalid - amount must be greater than zero', () => {
        const txInput = new TransactionInput({
            signature: 'test signature'
        });
        expect(txInput.isValid().success).toBe(false);
        expect(txInput.isValid().message).toBe("Amount must be greater than zero");
    });

});