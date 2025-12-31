import Block from "../lib/block";
import Blockchain from "../lib/blockchain";
import Transaction from "../lib/transaction";
import TransactionType from "../lib/transactionType";
import Wallet from "../lib/wallet";

jest.mock('../lib/block');
jest.mock('../lib/transaction');
jest.mock('../lib/transactionInput');
jest.mock('../lib/transactionOutput');
jest.mock('../lib/wallet');

describe("Testes para Blockchain", () => {
    const aliceWallet = new Wallet("alice");
    const bobWallet = new Wallet("bob");


    test("Should NOT hack the mempool - from .getMempool()", () => {
        const blockchain = new Blockchain();
        const genesisTx = blockchain.getBlock("0")?.getTransactions()[0]!;

        // First, add a transaction to the mempool
        const tx = new Transaction({
            txInputs: [{ 
                fromAddress: genesisTx["txOutputs"]![0]!["toAddress"],
                amount: 10,
                previousTx: genesisTx.getHash()
            }],
            txOutputs: [{ toAddress: aliceWallet.getPublicKey() }],
        });
        const validation = blockchain.addTransaction(tx);
        
        const tx1 = blockchain.getMempool();
        tx1[0]!["hash"] = "Hacked data!";

        expect(tx1[0]!["hash"]).toBe("Hacked data!");
        expect(blockchain.getMempool()[0]!["hash"]).not.toBe("Hacked data!");
    });


    test("Should NOT hack a transaction - from .getTransaction()", () => {
        const blockchain = new Blockchain();

        const genesisTx = blockchain.getBlock("0")!.getTransactions()[0]!;
        const txSearch = blockchain.getTransaction("mocked transaction hash-" + genesisTx["timestamp"]); // Genesis transaction hash
        txSearch.transaction!["hash"] = "Hacked data!";

        expect(txSearch.transaction!["hash"]).toBe("Hacked data!");
        expect(blockchain.getTransaction("mocked transaction hash-" + genesisTx["timestamp"]).transaction!["hash"]).not.toBe("Hacked data!");
    });


    test("Should get a block by index", () => {
        const blockchain = new Blockchain();
        const block = blockchain.getBlock("0"); // Genesis block
        expect(block!.getPreviousHash()).toBe("0000000000000000000000000000000000000000000000000000000000000000");
    });


    test("Should get a block by hash", () => {
        const blockchain = new Blockchain();
        const block = blockchain.getBlock(blockchain.getLastBlock().getHash()); // Genesis block
        expect(block!.getPreviousHash()).toBe("0000000000000000000000000000000000000000000000000000000000000000");
    });


    test("Blockchain Should be valid (genesis)", () => {
        const blockchain = new Blockchain();
        expect(blockchain.isValid().success).toBe(true);
    });


    test("Blockchain Should be valid (two blocks)", () => {
        const blockchain = new Blockchain();

        // create a minimum valid block and add it to the blockchain
        const newBlock = new Block({
            transactions: [{
                type: TransactionType.REGULAR,
                timestamp: 0,
                txInputs: [{ fromAddress: aliceWallet.getPublicKey() }],
                txOutputs: [{ toAddress: bobWallet.getPublicKey() }]
            }],
            previousHash: blockchain.getLastBlock().getHash(),
            nonce: 0,
            miner: "miner1",
        });
        blockchain["blocks"].push(newBlock); // Force add block to blockchain

        expect(blockchain.isValid().success).toBe(true);
    });


    test("Blockchain Should NOT be valid (invalid block)", () => {
        const blockchain = new Blockchain();

        // create an invalid block and add it to the blockchain
        const newBlock = new Block({
            transactions: [{
                type: TransactionType.REGULAR,
                timestamp: 0,
                txInputs: [{ fromAddress: aliceWallet.getPublicKey() }],
                txOutputs: [{ toAddress: bobWallet.getPublicKey() }]
            }],
            previousHash: blockchain.getLastBlock().getHash(),
            nonce: -1,                       // Invalid nonce (see mock block.ts)
            miner: "miner1",
        });
        blockchain["blocks"].push(newBlock); // Force add block to blockchain

        expect(blockchain.isValid().message).toMatch(/Block \d+ is invalid: /);
    });


    test("Blockchain Should NOT be valid (invalid block previous hash)", () => {
        const blockchain = new Blockchain();

        // create an invalid block and add it to the blockchain
        const newBlock = new Block({
            transactions: [{
                type: TransactionType.REGULAR,
                timestamp: 0,
                txInputs: [{ fromAddress: aliceWallet.getPublicKey() }],
                txOutputs: [{ toAddress: bobWallet.getPublicKey() }]
            }],
            previousHash: "Invalid previous hash", // Invalid previous hash
            nonce: 0,
            miner: "miner1",
        });
        blockchain["blocks"].push(newBlock); // Force add block to blockchain
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











    test("Should NOT add a transaction (has a tx with same transactionInput.fromAddress pending in mempool)", () => {
        const blockchain = new Blockchain();
        const genesisTx = blockchain.getBlock("0")?.getTransactions()[0]!;

        // First, add a transaction to the mempool
        const tx = new Transaction({
            txInputs: [{ 
                fromAddress: genesisTx["txOutputs"]![0]!["toAddress"],
                amount: 10,
                previousTx: genesisTx.getHash()
            }],
            txOutputs: [{ toAddress: aliceWallet.getPublicKey() }],
        });
        blockchain.addTransaction(tx);

        // Try to add the same transaction again
        const validation = blockchain.addTransaction(new Transaction({
            txInputs: [{ fromAddress: genesisTx["txOutputs"]![0]!["toAddress"] }],
            txOutputs: [{ toAddress: bobWallet.getPublicKey() }]
        }));

        expect(validation.message).toBe("There is already a pending transaction from this address in the mempool");
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
        const genesisTx = blockchain.getBlock("0")!.getTransactions()[0]!;
        const validation = blockchain.getTransaction(genesisTx.getHash()); // Genesis transaction hash

        expect(validation.blockIndex).toBeGreaterThan(-1);
    });


    test("Should NOT get a transaction (not in mempool nor in blockchain)", () => {
        const blockchain = new Blockchain();
        const validation = blockchain.getTransaction("non existing transaction hash");

        expect(validation.blockIndex).toBe(-1);
        expect(validation.mempoolIndex).toBe(-1);
    });
    

    test("Should add a block", () => {
        const blockchain = new Blockchain();

        // First, add a transaction to the mempool
        blockchain.addTransaction(new Transaction({
            txInputs: [{ fromAddress: aliceWallet.getPublicKey() }],
            txOutputs: [{ toAddress: bobWallet.getPublicKey() }]
        }));

        // Get the protoBlock from the blockchain and mine it
        const newBlock = blockchain.getNextBlock().protoBlock;
        newBlock.reward(aliceWallet.getPublicKey(), 1);
        newBlock.mine(blockchain.getDifficulty(), 1);

        const validation = blockchain.addBlock(newBlock.getNonce(), aliceWallet.getPublicKey(), 1);
        expect(validation.message).toBe("Block added successfully.");
    });
    




    test("Souldo getDificulty - not greater than MAX_DIFFICULTY", () => {
        const blockchain = new Blockchain();
        expect(blockchain.getDifficulty(1000)).toBe(16);
    });


    test("Should NOT add a block - block validation fails", () => {
        const blockchain = new Blockchain();
        const genesisTx = blockchain.getBlock("0")?.getTransactions()[0]!;

        // First, add a transaction to the mempool
        const tx = new Transaction({
            txInputs: [{ 
                fromAddress: genesisTx["txOutputs"]![0]!["toAddress"],
                amount: 10,
                previousTx: genesisTx.getHash()
            }],
            txOutputs: [{ toAddress: aliceWallet.getPublicKey() }],
        });
        blockchain.addTransaction(tx);

        // Get the protoBlock from the blockchain, but do not mine it
        const newBlock = blockchain.getNextBlock().protoBlock;

        const validation = blockchain.addBlock(-1, aliceWallet.getPublicKey(), 1); // (-1) Invalid nonce to force invalid block
        expect(validation.message).toMatch(/Block validation fails: /);
    });


    test("Should get balance for genesis", () => {
        const blockchain = new Blockchain();
        const genesisTx = blockchain.getBlock("0")?.getTransactions()[0]!;

        expect(blockchain.getBalance(genesisTx["txOutputs"]![0]!["toAddress"])).toBeGreaterThan(0);
    });


    test("Sould get UTXOs - when exists txInputs", () => {
        const blockchain = new Blockchain();
        const genesisTx = blockchain.getBlock("0")?.getTransactions()[0]!;
        
        const newBlock = new Block({
            transactions: [{
                txInputs: [{ 
                    fromAddress: genesisTx["txOutputs"]![0]!["toAddress"], 
                    amount: genesisTx["txOutputs"]![0]!["amount"],
                    previousTx: genesisTx.getHash() 
                }],
                txOutputs: [{ 
                    toAddress: genesisTx["txOutputs"]![0]!["toAddress"],
                    amount: 5
                }]
            }],
            previousHash: blockchain.getLastBlock().getHash(),
            nonce: 0,
            miner: aliceWallet.getPublicKey()
        });
        blockchain["blocks"].push(newBlock); // Force add block to blockchain

        const txInputs = blockchain.getUTXO(genesisTx["txOutputs"]![0]!["toAddress"]);

        expect(txInputs[0]!["amount"]).toBeGreaterThan(0);
    });
});