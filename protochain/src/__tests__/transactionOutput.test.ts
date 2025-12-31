import TransactionOutput from "../lib/transactionOutput";
import Wallet from "../lib/wallet";

jest.mock('../lib/wallet');

describe('TransactionOutput tests', () => {
 
    const aliceWallet: Wallet = new Wallet();
    aliceWallet['privateKey'] = "3d398395345e1e43c58a2e8badb9d39aa86f0a8cb8364bf971277f3321d8b4dc";
    aliceWallet['publicKey'] = "0354fc7e9db8ca6c0322704f5c50c2c2124b15f66c2c31f37ef133d8e37c60ae66";

    const bobWallet: Wallet = new Wallet();
    bobWallet['privateKey'] = "e4b2fc34cab461638ef94855ad67514ac6cec6d700d0785139946ec2387ed23d";
    bobWallet['publicKey'] = "02f1dd24572a5ed44d970673049cd3548aa585836baf1a208205953219969a281d";


    test('should be valid', () => {
        const txOutput = new TransactionOutput({
            toAddress: aliceWallet.getPublicKey(),
            amount: 100
        });

        expect(txOutput.isValid().success).toBe(true);
    });


    test('should NOT be valid - invalid amount', () => {
        const txOutput = new TransactionOutput({
            toAddress: aliceWallet.getPublicKey(),
            amount: -1
        });

        expect(txOutput.isValid().message).toBe("TransactionOutput amount must be greater than zero");
    });


    test('should NOT be valid - using constructor fallbacks', () => {
        const txOutput = new TransactionOutput();

        expect(txOutput.isValid().message).toBe("TransactionOutput amount must be greater than zero");
    });


    test("Sould get transactionOutput hash", () => {
        const txOutput = new TransactionOutput({
            toAddress: bobWallet.getPublicKey(),
            amount: 50
        });
    
        expect(txOutput.getHash()).toHaveLength(64);
    });
});