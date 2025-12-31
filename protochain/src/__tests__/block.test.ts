import Block from "../lib/block";
import TransactionType from "../lib/transactionType";
import Wallet from "../lib/wallet";

jest.mock('../lib/transaction');
jest.mock('../lib/transactionInput');
jest.mock('../lib/transactionOutput');
jest.mock('../lib/wallet');

describe("Testes para Block", () => {
    let genesis: Block;
    const testsDifficulty = 0;
    const aliceWallet = new Wallet("alice");
    const bobWallet = new Wallet("bob");

    beforeAll(() => {
        genesis = new Block({
            transactions: [{
                txInputs: [{fromAddress: "genesis",}]
            },{
                type: TransactionType.FEE,
                txOutputs: [{toAddress: "genesis", amount: 50}]
            }],
            nonce: 1,
            miner: "genesis"
        });
        genesis['hash'] = genesis.generateHash();
    });

     
    test("Should be valid", () => {
        const validation = genesis.isValid(testsDifficulty);
        expect(validation.success).toBe(true);
    });


    test("Should NOT be valid (invalid hash)", () => {
        const block = new Block({
            transactions: [{
                txInputs: [{fromAddress: bobWallet.getPublicKey(),}]
            },{
                type: TransactionType.FEE,
                txOutputs: [{toAddress: aliceWallet.getPublicKey()}]
            }],
            nonce: 1,
            miner: aliceWallet.getPublicKey(),
            hash: "Invalid hash"
        });
        
        const validation = block.isValid(testsDifficulty);
        expect(validation.message).toBe("Block.ts: Invalid hash");
    });


    test("Should NOT be valid - Fee transactionOutput '.toAddress' must be equal the miner address", () => {
        const block = new Block({
            transactions: [{
                txInputs: [{fromAddress: bobWallet.getPublicKey()}]
            },{
                type: TransactionType.FEE,
                txOutputs: [{toAddress: bobWallet.getPublicKey()}]
            }],
            nonce: 1,
            miner: aliceWallet.getPublicKey(),
        });
        
        const validation = block.isValid(testsDifficulty);
        expect(validation.message).toBe("Block.ts: Fee transaction must have an txOutput with the miner address");
    });


    test("Should NOT be valid - Block must have at least one regular transaction", () => {
        const block = new Block({
            transactions: [{
                type: TransactionType.FEE,
                txOutputs: [{ toAddress: aliceWallet.getPublicKey() }]
            }],
            nonce: 1,
            miner: aliceWallet.getPublicKey(),
        });
        
        const validation = block.isValid(testsDifficulty);
        expect(validation.message).toBe("Block.ts: Block must have at least one regular transaction");
    });


    test("Should NOT be valid - not mined block", () => {
        const block = new Block({
            previousHash: genesis.getHash()
        });
        const validation = block.isValid(testsDifficulty);
        expect(validation.message).toBe("Block.ts: Not mined block");
    });


    test("Should NOT be valid (Invalid transaction)", () => {
        const block = new Block({
            previousHash: genesis.getHash(),
            nonce: 1,
            miner: aliceWallet.getPublicKey(),
            transactions: [{
                txInputs: [{ fromAddress: bobWallet.getPublicKey() }]
            },{
                type: TransactionType.FEE,
                hash: "Invalid mock transaction" // Invalid transaction (see mock transaction.ts)
            }]
        });
        const validation = block.isValid(testsDifficulty);
        expect(validation.message).toMatch(/Block.ts: Invalid transaction in block: /);
    });


    test("Should NOT be valid (too many fee transactions)", () => {
        const block = new Block({
            previousHash: genesis.getHash(),
            nonce: 1,
            miner: aliceWallet.getPublicKey(),
            transactions: [{
                type: TransactionType.FEE
            }, {
                type: TransactionType.FEE
            }]
        });

        const validation = block.isValid(testsDifficulty);
        expect(validation.message).toBe("Block.ts: A block must have exactly one fee transaction");
    });




    test("Should mine a block with a given nonce)", () => {
        const block = new Block({
            previousHash: genesis.getHash(), 
            transactions: [{
                type: TransactionType.FEE
            }]
        });

        block.mine(testsDifficulty, 12345);
        expect(block.getNonce()).toBe(12345);
    });


    test("Should mine a block)", () => {
        const block = new Block({
            previousHash: genesis.getHash(), 
            transactions: [{
                type: TransactionType.FEE
            }]
        });

        block.mine(testsDifficulty);
        expect(block.getNonce()).toBeGreaterThan(0);
    });


    test("Should NOT mine a block with no fee transaction)", () => {
        const block = new Block({
            previousHash: genesis.getHash(), 
            transactions: [{}]
        });

        block.mine(testsDifficulty);
        expect(block.getNonce()).toBe(0);
    });





    test("Should reward a block)", () => {
        const block = new Block({
            previousHash: genesis.getHash(), 
            transactions: [{ txInputs: [{ fromAddress: aliceWallet.getPublicKey() }] }]
        });

        const validation = block.reward(aliceWallet.getPublicKey(), 50);
        expect(validation.success).toBe(true);
    });


    test("Should NOT reward a block - block already has a fee transaction", () => {
        const block = new Block({
            previousHash: genesis.getHash(), 
            transactions: [{ 
                txInputs: [{ fromAddress: aliceWallet.getPublicKey() }]
            },{
                type: TransactionType.FEE,
                txOutputs: [{ toAddress: bobWallet.getPublicKey() }]
            }]
        });

        const validation = block.reward(aliceWallet.getPublicKey(), 50);
        expect(validation.message).toBe("Block.reward: Block already has a fee transaction");
    });




    test("Should get previous hash", () => {
        const block = new Block({
            previousHash: genesis.getHash()
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


    test("Should generate hash with (and without) specific nonce and miner", () => {
        const block = new Block({
            previousHash: genesis.getHash(), 
            transactions: [{}]
        });
        const hash1 = block.generateHash();
        const hash2 = block.generateHash(12345, "minerX");
        expect(hash1).not.toBe(hash2);
    });
});