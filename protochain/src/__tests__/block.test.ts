import Block from "../lib/block";

describe("Testes para Block", () => {

    let genesis: Block;
    const testsDificulty = 0;

    beforeAll(() => {
        genesis = new Block({previousHash: "", data: "Genesis Block"});
    });

    test("Should be valid", () => {
        const block = new Block({previousHash: genesis.getHash(), data: "block 2", miner: "Zimmer"});
        block.mine(0, "abc")
        const validation = block.isValid(testsDificulty);
        expect(validation.success).toBeTruthy();
    });

    test("Should NOT be valid (invalid hash)", () => {
        const block = new Block({
            previousHash: "",
            data: "block 2",
            nonce: testsDificulty,
            miner: "Zimmer"
        });
        block.mine(testsDificulty, "Zimmer");
        const validation = block.isValid(testsDificulty + 1);
        expect(validation.success).toBeFalsy();
    });

    test("Should NOT be valid (invalid miner)", () => {
        const block = new Block({previousHash: genesis.getHash(), data: "block 2", nonce: testsDificulty, miner: ""});
        const validation = block.isValid(testsDificulty);
        expect(validation.success).toBeFalsy();
    });

    test("Should NOT be valid (invalid data)", () => {
        const block = new Block({previousHash: genesis.getHash(), data: ""});
        const validation = block.isValid(testsDificulty);
        expect(validation.success).toBeFalsy();
    });

    test("Should get previous hash", () => {
        const block = new Block({previousHash: genesis.getHash(), data: "block 2"});
        expect(block.getPreviousHash()).toBe(genesis.getHash());
    });
});