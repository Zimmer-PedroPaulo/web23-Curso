import Transaction from "../lib/transaction";
// import TransactionInput from "../lib/transactionInput";
import TransactionType from "../lib/transactionType";
import Wallet from "../lib/wallet";

jest.mock('../lib/transactionInput');
jest.mock('../lib/wallet');

describe("Testes para Transaction", () => {
    const testsDifficulty = 0;
    const aliceWallet = new Wallet("alice");
    const bobWallet = new Wallet("bob");

    test("Should be valid", () => {
        const tx = new Transaction({
                to: aliceWallet.getPublicKey(),
            });
        const validation = tx.isValid();
        expect(validation.success).toBe(true);
    });


    test("Should NOT be valid - invalid hash", () => {
        const tx = new Transaction({
                hash: "Invalid hash"
            });
        const validation = tx.isValid();
        expect(validation.message).toBe("Invalid transaction hash");
    });


    test("Should NOT be valid - empty .to address", () => {
        const tx = new Transaction();
        expect(tx.isValid().message).toBe("Transaction .to address is required");
    });


    test("Should NOT be valid - invalid transactionInput", () => {
        const tx = new Transaction({
                txInput: {
                    signature: "invalid_signature", // This will trigger the mock to return invalid
                },
                to: aliceWallet.getPublicKey(),
            });
        const validation = tx.isValid();
        expect(validation.message).toMatch("Invalid mocked transactionInput");
    });


    test("Should get transaction hash", () => {
        const tx = new Transaction();
        expect(tx.getHash()).toHaveLength(64);
    });


    test("Should get transaction type", () => {
        const tx = new Transaction();
        expect(tx.getType()).toBe(TransactionType.REGULAR);
    });
});