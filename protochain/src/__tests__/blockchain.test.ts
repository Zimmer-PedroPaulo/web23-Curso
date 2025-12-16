import Block from "../lib/block";
import Blockchain from "../lib/blockchain";
import Transaction from "../lib/transaction";
import TransactionInput from "../lib/transactionInput";
import TransactionType from "../lib/transactionType";
import Wallet from "../lib/wallet";

jest.mock('../lib/block');
jest.mock('../lib/transaction');
jest.mock('../lib/transactionInput');
jest.mock('../lib/wallet');

describe("Testes para Blockchain", () => {
    const aliceWallet = new Wallet("alice");
    const bobWallet = new Wallet("bob");

    test("Should NOT hack the mempool - from .getMempool()", () => {
        const blockchain = new Blockchain();

        // First, add a transaction to the mempool
        blockchain.addTransaction(new Transaction({
            hash: "new transaction test",
            to: aliceWallet.getPublicKey(),
        }));
        
        const tx1 = blockchain.getMempool();
        tx1[0]!["to"] = "Hacked data!";

        expect(tx1[0]!["to"]).toBe("Hacked data!");
        expect(blockchain.getMempool()[0]!["to"]).not.toBe("Hacked data!");
    });


    test("Should NOT hack a transaction - from .getTransaction()", () => {
        const blockchain = new Blockchain();

        const txSearch = blockchain.getTransaction("mocked transaction hash"); // Genesis transaction hash
        txSearch.transaction["to"] = "Hacked data!";

        expect(txSearch.transaction["to"]).toBe("Hacked data!");
        expect(blockchain.getTransaction("mocked transaction hash").transaction["to"]).not.toBe("Hacked data!");
    });


    test("Should get a block by index", () => {
        const blockchain = new Blockchain();
        const block = blockchain.getBlock("0");
        expect(block!.getMiner()).toBe("genesis");
    });


    test("Should get a block by hash", () => {
        const blockchain = new Blockchain();
        const block = blockchain.getBlock(blockchain.getLastBlock().getHash());
        expect(block!.getMiner()).toBe("genesis");
    });


    test("Blockchain Should be valid (genesis)", () => {
        const blockchain = new Blockchain();
        expect(blockchain.isValid().success).toBe(true);
    });


    test("Blockchain Should be valid (two blocks)", () => {
        const blockchain = new Blockchain();
        blockchain.addTransaction(new Transaction({
            type: TransactionType.REGULAR,
            timestamp: 0,
            to: aliceWallet.getPublicKey(),
        }));

        const newBlock = blockchain.getNextBlock().protoBlock;
        newBlock.reward("miner1", 1);
        newBlock.mine(blockchain.getDifficulty());
        blockchain.addBlock(newBlock.getNonce(), "miner1", 1);

        expect(blockchain.isValid().success).toBe(true);
    });


    test("Blockchain Should NOT be valid (invalid block)", () => {
        const blockchain = new Blockchain();

        // First, add a transaction to the mempool
        blockchain.addTransaction(new Transaction({
            hash: "new transaction test",
            to: "recipient address",
        }));

        // Create and add a Block
        const newBlock = blockchain.getNextBlock().protoBlock;
        blockchain.addBlock(newBlock.getNonce(), "miner1", 1);

        // Invalidate the last block by mining it with an invalid nonce (nonce = -1, see mock block.ts)
        blockchain.getLastBlock().mine(blockchain.getDifficulty(), -1);
        expect(blockchain.isValid().message).toMatch(/Block \d+ is invalid: /);
    });


    test("Blockchain Should NOT be valid (invalid block previous hash)", () => {
        const blockchain = new Blockchain();
        blockchain.addTransaction(new Transaction({
            hash: "transaction test "
        }));

        const newBlock = blockchain.getNextBlock().protoBlock;
        newBlock.reward("miner1", 1);
        newBlock.mine(blockchain.getDifficulty());
        blockchain.addBlock(newBlock.getNonce(), "miner1", 1);

        blockchain.getLastBlock()["previousHash"] = "Invalid previous hash";
        expect(blockchain.isValid().message).toMatch(/Block \d+ previous hash is invalid/);
    });


    test("Should NOT add a block (no protoBlock to add)", () => {
        const blockchain = new Blockchain();
        const validation = blockchain.addBlock(0, "miner1", 1);
        expect(validation.message).toBe("No protoBlock to add");
    });


    test("Should get the blockchain length", () => {
        const blockchain = new Blockchain();
        expect(blockchain.getLength()).toBeGreaterThan(0);
    });


    test("Should get the blockchais's chain", () => {
        const blockchain = new Blockchain();
        expect(blockchain.getChain().length).toBeGreaterThan(0);
    })


    test("Should get nextBlock", () => {
        const blockchain = new Blockchain();
        blockchain.addTransaction(new Transaction({
            hash: "new transaction for nextBlock"
        }));
        const nextBlock = blockchain.getNextBlock();
        expect(nextBlock.index).toEqual(1);
    })


    test("Should NOT get nextBlock (no transactions in mempool)", () => {
        const blockchain = new Blockchain();
        const nextBlock = blockchain.getNextBlock();
        expect(nextBlock.index).toEqual(-1);
    })


    test("Should NOT add a transaction (invalid transaction)", () => {
        const blockchain = new Blockchain();
        const validation = blockchain.addTransaction(new Transaction({
            hash: "Invalid mock transaction", // Invalid transaction hash (see mock transaction.ts)
        }));
        expect(validation.message).toMatch(/Invalid transaction: /);
    })


    test("Should NOT add a transaction (Transaction already in blockchain)", () => {
        const blockchain = new Blockchain();

        // Try to add the genesis transaction again
        const validation = blockchain.addTransaction(new Transaction({
            hash: blockchain.getBlock("0")!.getTransactions()[0]!.getHash() // Genesis transaction hash
        }));

        expect(validation.message).toBe("Transaction already in blockchain");
    });


    test("Should NOT add a transaction (Transaction already in mempool)", () => {
        const blockchain = new Blockchain();

        // First, add the transaction to the mempool
        blockchain.addTransaction(new Transaction({
            hash: "mempool transaction test"
        }));

        // Try to add the same transaction again
        const validation = blockchain.addTransaction(new Transaction({
            hash: "mempool transaction test"
        }));

        expect(validation.message).toBe("Transaction already in mempool");
    });

    test("Should get mempool", () => {
        const blockchain = new Blockchain();

        // First, add a transaction to the mempool
        blockchain.addTransaction(new Transaction({
            hash: "mempool transaction test"
        }));

        const mempool = blockchain.getMempool();
        expect(mempool.length).toBeGreaterThan(0);
    });


    test("Should get a transaction (in mempool)", () => {
        const blockchain = new Blockchain();

        // First, add a transaction to the mempool
        const transactionValidation = blockchain.addTransaction(new Transaction({
            hash: "mempool transaction test"
        }));

        const validation = blockchain.getTransaction(transactionValidation.message);
        expect(validation.mempoolIndex).toBeGreaterThan(-1);
    });


    test("Should get a transaction (in blockchain)", () => {
        const blockchain = new Blockchain();
        const validation = blockchain.getTransaction("mocked transaction hash"); // Genesis transaction hash

        expect(validation.blockIndex).toBeGreaterThan(-1);
    });


    test("Should NOT get a transaction (not in mempool nor in blockchain)", () => {
        const blockchain = new Blockchain();
        const validation = blockchain.getTransaction("non existing transaction hash");

        expect(validation.blockIndex).toBe(-1);
        expect(validation.mempoolIndex).toBe(-1);
    });
    

    test("Should NOT add a block (invalid block)", () => {
        // First, add a transaction to the mempool
        const blockchain = new Blockchain();
        blockchain.addTransaction(new Transaction({
            hash: "mocked transaction hash2"
        }));

        // Create the protoBlock
        const newBlock = blockchain.getNextBlock().protoBlock;
        newBlock.mine(blockchain.getDifficulty(), -1); // Invalid block (nonce = -1, see mock block.ts)

        const validation = blockchain.addBlock(newBlock.getNonce(), "miner1", 1);
        expect(validation.message).toMatch(/Invalid mock block/);
    });
});