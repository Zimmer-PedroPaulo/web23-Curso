import Transaction from "../lib/transaction";
import TransactionType from "../lib/transactionType";
import Wallet from "../lib/wallet";

jest.mock('../lib/transactionInput');
jest.mock('../lib/transactionOutput');
jest.mock('../lib/wallet');

describe("Testes para Transaction", () => {
    const aliceWallet = new Wallet("alice");
    const bobWallet = new Wallet("bob");

    test("Should be valid", () => {
        const tx = new Transaction({
            txInputs: [{fromAddress: aliceWallet.getPublicKey()}],
            txOutputs: [{toAddress: bobWallet.getPublicKey()}]
        });
        const validation = tx.isValid();
        expect(validation.success).toBe(true);
    });


    test("Should NOT be valid - invalid hash", () => {
        const tx = new Transaction({
                hash: "Invalid hash"
            });
        const validation = tx.isValid();
        expect(validation.message).toBe("Transaction.ts: Invalid transaction hash");
    });


    test("Should NOT be valid - invalid transactionInput", () => {
        const tx = new Transaction({
                txInputs: [{
                    signature: "invalid_signature", // This will trigger the mock to return invalid
                }],
                txOutputs: [{}]
            });
        const validation = tx.isValid();
        expect(validation.message).toMatch("Transaction.ts: Invalid txInputs");
    });


    test("Should NOT be valid - missing transactionOutput", () => {
        const tx = new Transaction({
                txInputs: [{
                    signature: "invalid_signature", // This will trigger the mock to return invalid
                }]
            });
        const validation = tx.isValid();
        expect(validation.message).toMatch("Transaction.ts: Invalid or missing transactionOutput");
    });


    test("Should NOT be valid - amounts for transactionInput and transactionOutput do not match", () => {
        const tx = new Transaction({
                txInputs: [{
                    amount: 1
                }],
                txOutputs: [{}]
            });
        const validation = tx.isValid();
        expect(validation.message).toMatch("Transaction.ts: Input amount is less than output amount");
    });


    test("Sould NOT be valid - transaction outputs '.tx' must match transaction hash", () => {
        const tx = new Transaction({
            txInputs: [{}],
            txOutputs: [{}]
        });

        tx["txOutputs"]![0]!["tx"] = "mismatched hash";
        const validation = tx.isValid();
        expect(validation.message).toMatch("Transaction.ts: TransactionOutput.tx does not match transaction hash");
    });


    test("Should get transaction hash", () => {
        const tx = new Transaction();
        expect(tx.getHash()).toHaveLength(64);
    });


    test("Should get transaction type", () => {
        const tx = new Transaction();
        expect(tx.getType()).toBe(TransactionType.REGULAR);
    });


    test("Should get transaction fee", () => {
        const tx = new Transaction({
            txInputs: [{amount: 100}],
            txOutputs: [{amount: 90}]
        });

        expect(tx.getFee()).toBeGreaterThan(0);
    });


    test("Should get transaction fee - no transaction inputs", () => {
        const tx = new Transaction({
            txOutputs: [{amount: 90}]
        });

        expect(tx.getFee()).toBe(0);
    });


    test("Should get transaction fee - no transaction outputs", () => {
        const tx = new Transaction({
            txInputs: [{amount: 100}]
        });

        expect(tx.getFee()).toBe(100);
    });

});