import TransactionInput from "../lib/transactionInput";
import Wallet from "../lib/wallet";

jest.mock('../lib/wallet');

describe('TransactionInput tests', () => {
 
    const aliceWallet: Wallet = new Wallet();
    aliceWallet['privateKey'] = "3d398395345e1e43c58a2e8badb9d39aa86f0a8cb8364bf971277f3321d8b4dc";
    aliceWallet['publicKey'] = "0354fc7e9db8ca6c0322704f5c50c2c2124b15f66c2c31f37ef133d8e37c60ae66";

    const bobWallet: Wallet = new Wallet();
    bobWallet['privateKey'] = "e4b2fc34cab461638ef94855ad67514ac6cec6d700d0785139946ec2387ed23d";
    bobWallet['publicKey'] = "02f1dd24572a5ed44d970673049cd3548aa585836baf1a208205953219969a281d";

    test('should be valid', () => {
        const txInput = new TransactionInput({
            fromAddress: aliceWallet.getPublicKey(),
            amount: 100,
            previousTx: 'a'.repeat(64)
        });
        txInput.sign(aliceWallet['privateKey']);

        expect(txInput.isValid().success).toBe(true);
    });


    test('should NOT be valid - invalid signature', () => {
        const txInput = new TransactionInput({
            fromAddress: aliceWallet.getPublicKey(),
            amount: 100,
            previousTx: 'a'.repeat(64)
        });
        txInput.sign(bobWallet['privateKey']);

        expect(txInput.isValid().message).toBe("Invalid txInput signature");
    });


    test('should NOT be valid - no signature', () => {
        const txInput = new TransactionInput();
        expect(txInput.isValid().success).toBe(false);
        expect(txInput.isValid().message).toBe("Signature is required");
    });


    test('should NOT be valid - invalid previousTx', () => {
        const txInput = new TransactionInput({
            fromAddress: aliceWallet.getPublicKey()
        });
        txInput.sign(bobWallet['privateKey']);

        expect(txInput.isValid().message).toBe("Previous transaction hash is invalid");
    });


    test('should NOT be valid - invalid amount', () => {
        const txInput = new TransactionInput({
            signature: 'test signature',
            previousTx: 'a'.repeat(64)
        });
        expect(txInput.isValid().success).toBe(false);
        expect(txInput.isValid().message).toBe("Amount must be greater than zero");
    });

});