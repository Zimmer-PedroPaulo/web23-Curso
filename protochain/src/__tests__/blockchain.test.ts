import Block from "../lib/block";
import Blockchain from "../lib/blockchain";

jest.mock('../lib/block');

describe("Testes para Blockchain", () => {

    test("Should be valid (genesis)", () => {
        const blockchain = new Blockchain();
        expect(blockchain.isValid().success).toBeTruthy();
    });

    test("Should be valid (two blocks)", () => {
        const blockchain = new Blockchain();
        blockchain.addBlock(new Block({previousHash: blockchain.getLastBlock().getHash(), data: "block 2"}));
        expect(blockchain.isValid().success).toBeTruthy();
    });

    test("Should NOT be valid (invalid block)", () => {
        const blockchain = new Blockchain();
        blockchain.addBlock(new Block({previousHash: blockchain.getLastBlock().getHash(), data: "block 2"}));
        blockchain.getLastBlock().data = "Invalid block";
        expect(blockchain.isValid().success).toBeFalsy();
    });

    test("Should NOT be valid (invalid block previous hash)", () => {
        const blockchain = new Blockchain();
        const block = new Block({previousHash: blockchain.getLastBlock().getHash(), data: "block 2"});
        blockchain.addBlock(block);
        block.previousHash = "";
        expect(blockchain.isValid().success).toBeFalsy();
    });

    test("Should get a block by index", () => {
        const blockchain = new Blockchain();
        const block = blockchain.getBlock("0");
        expect(block).toBeTruthy();
    });

    test("Should get a block by hash", () => {
        const blockchain = new Blockchain();
        const block = blockchain.getBlock(blockchain.getLastBlock().getHash());
        expect(block).toBeTruthy();
    });

    test("Should add a block", () => {
        const blockchain = new Blockchain();
        const result = blockchain.addBlock(new Block({previousHash: blockchain.getLastBlock().getHash(), data: "block 2"}));
        expect(result).toBeTruthy();
    });

    test("Should NOT add a block (invalid previous hash)", () => {
        const blockchain = new Blockchain();
        const block = new Block({previousHash: "invalid_hash", data: "block 2"});
        const result = blockchain.addBlock(block);
        expect(result.success).toBeFalsy();
    });

    test("Should NOT add a block (invalid block (no data))", () => {
        const blockchain = new Blockchain();
        const block = new Block({previousHash: blockchain.getLastBlock().getHash(), data: "Invalid block"});
        const result = blockchain.addBlock(block);
        expect(result.success).toBeFalsy();
    });

    test("Should get the blockchain length", () => {
        const blockchain = new Blockchain();
        expect(blockchain.getLength()).toBeGreaterThan(0)
    });

    test("Should get the blockchais's chain", () => {
        const blockchain = new Blockchain();
        expect(blockchain.getChain().length).toBeGreaterThan(0);
    })

    test("Should get nextBlockInfo", () => {
        const blockchain = new Blockchain();
        const info = blockchain.getNextBlock();
        expect(info.index).toEqual(1);
    })
});