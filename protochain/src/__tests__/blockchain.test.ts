import Block from "../lib/block";
import Blockchain from "../lib/blockchain";

describe("Testes para Blockchain", () => {

    test("Should be valid (genesis)", () => {
        const blockchain = new Blockchain();
        expect(blockchain.isValid().success).toBeTruthy();
    });

    test("Should be valid (two blocks)", () => {
        const blockchain = new Blockchain();
        blockchain.addBlock(new Block(blockchain.getLastBlock().hash, "block 2"));
        const validation = blockchain.isValid();
        // console.log(validation.success + validation.message);
        expect(validation.success).toBeTruthy();
    });

    test("Should NOT be valid", () => {
        const blockchain = new Blockchain();
        blockchain.addBlock(new Block(blockchain.getLastBlock().hash, "block 2"));
        blockchain.getLastBlock().data = "a transfere 2 para b";
        expect(blockchain.isValid().success).toBeFalsy();
    });

    test("Should get a block by index", () => {
        const blockchain = new Blockchain();
        const block = blockchain.getBlock("0");
        expect(block).toBeTruthy();
    });

    test("Should get a block by hash", () => {
        const blockchain = new Blockchain();
        const block = blockchain.getBlock(blockchain.getLastBlock().hash);
        expect(block).toBeTruthy();
    });

    test("Should add a block", () => {
        const blockchain = new Blockchain();
        const result = blockchain.addBlock(new Block(blockchain.getLastBlock().hash, "block 2"));
        expect(result).toBeTruthy();
    });

    test("Should NOT add a block (invalid previous hash)", () => {
        const blockchain = new Blockchain();
        const block = new Block("invalid_hash", "block 2");
        const result = blockchain.addBlock(block);
        expect(result.success).toBeFalsy();
    });

    test("Should NOT add a block (invalid block (no data))", () => {
        const blockchain = new Blockchain();
        const block = new Block(blockchain.getLastBlock().hash, "");
        const result = blockchain.addBlock(block);
        expect(result.success).toBeFalsy();
    });

    test("Should NOT have a Previoushash Invalid block", () => {
        const blockchain = new Blockchain();
        blockchain.addBlock(new Block(blockchain.getLastBlock().hash, "block 2"));
        const block = blockchain.getLastBlock();
        block.previousHash = "invalid_hash";
        block.hash = block.generateHash();
        const result = blockchain.isValid();
        expect(result.success).toBeFalsy();
    });

});