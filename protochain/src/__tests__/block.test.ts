import Block from "../lib/block";
import Transaction from "../lib/transaction";
import TransactionInput from "../lib/transactionInput";
import TransactionType from "../lib/transactionType";
import Wallet from "../lib/wallet";

jest.mock('../lib/transaction');
jest.mock('../lib/transactionInput');
jest.mock('../lib/wallet');

describe("Testes para Block", () => {

    let genesis: Block;
    const testsDifficulty = 0;
    const aliceWallet = new Wallet("alice");
    const bobWallet = new Wallet("bob");

    beforeAll(() => {
        // const txInput = new TransactionInput({
        //     fromAddress: aliceWallet.getPublicKey(),
        // });
        // const tx = new Transaction({
        //     to: bobWallet.getPublicKey(),
        //     txInput: {
        //         fromAddress: aliceWallet.getPublicKey(),
        //     }
        // });
        genesis = new Block({
            transactions: [{
            to: bobWallet.getPublicKey(),
            txInput: {
                fromAddress: aliceWallet.getPublicKey(),
            }
        }]
        });
        genesis.reward("genesis", 10);
        genesis.mine(testsDifficulty);
    });

    test("Should be valid", () => {
        const block = new Block({
            previousHash: genesis.getHash(),
            transactions: [{}]
        });
        block.reward("miner1", 10);
        block.mine(testsDifficulty);
        const validation = block.isValid(testsDifficulty);
        expect(validation.success).toBeTruthy();
    });

    test("Should NOT be valid (invalid hash)", () => {
        const block = new Block({
            transactions: [{}],
            nonce: 1,
            miner: "miner1",
            hash: "Invalid hash"
        });
        const validation = block.isValid(testsDifficulty);
        expect(validation.message).toBe("Invalid hash");
    });

    test("Should NOT be valid (not mined block)", () => {
        const block = new Block({
            previousHash: genesis.getHash(), 
            transactions: [{}]
        });
        const validation = block.isValid(testsDifficulty);
        expect(validation.message).toBe("Not mined block");
    });

    test("Should NOT be valid (Invalid transaction)", () => {
        const block = new Block({
            previousHash: genesis.getHash(),
            transactions: [{
                hash: "Invalid mock transaction" // Invalid transaction (see mock transaction.ts)
            }]
        });
        const validation = block.isValid(testsDifficulty);
        expect(validation.success).toBeFalsy();
        expect(validation.message).toMatch(/Invalid transaction in block: /);
    });

    test("Should NOT be valid (too many fee transactions)", () => {
        const block = new Block({
            previousHash: genesis.getHash(), 
            transactions: [{
                type: TransactionType.FEE
            }, {
                type: TransactionType.FEE
            }]
        });
        const validation = block.isValid(testsDifficulty);
        expect(validation.message).toBe("Too many fee transactions");
    });


    test("Should NOT mine a block with no fee transaction)", () => {
        const block = new Block({
            previousHash: genesis.getHash(), 
            transactions: [{}]
        });

        block.mine(testsDifficulty);
        expect(block.getNonce()).toBe(0);
    });


    test("Should mine a block with given nonce)", () => {
        const block = new Block({
            previousHash: genesis.getHash(), 
            transactions: [{
                type: TransactionType.FEE
            }]
        });

        block.mine(testsDifficulty, 12345);
        expect(block.getNonce()).toBe(12345);
    });

    test("Should get previous hash", () => {
        const block = new Block({
            previousHash: genesis.getHash(), 
            transactions: [{}]
        });
        expect(block.getPreviousHash()).toBe(genesis.getHash());
    });


    test("Should get block transactions", () => {
        const block = new Block({
            previousHash: genesis.getHash(), 
            transactions: [{}]
        });
        expect(block.getTransactions(TransactionType.REGULAR)).toHaveLength(1);
    });


    test("Should get block miner", () => {
        expect(genesis.getMiner()).toBe("genesis");
    });


    test("Should get block nonce", () => {
        expect(genesis.getNonce()).toBe(1);
    });


    test("Should generate hash with specific nonce and miner", () => {
        const block = new Block({
            previousHash: genesis.getHash(), 
            transactions: [{}]
        });
        const hash1 = block.generateHash();
        const hash2 = block.generateHash(12345, "minerX");
        expect(hash1).not.toBe(hash2);
    });
});