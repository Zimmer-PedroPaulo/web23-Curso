import Block from "../lib/block";

describe("Testes para Block", () => {

    let genesis: Block;

    beforeAll(() => {
        genesis = new Block("", "Genesis Block");
    });

    test("Should be valid", () => {
        const block = new Block(genesis.hash, "block 2");
        const validation = block.isValid();
        expect(validation.success).toBeTruthy();
    });

    test("Should NOT be valid (Invalid timestamp)", () => {
        const block = new Block(genesis.hash, "block 2");
        block.timestamp = -1; 
        const validation = block.isValid();
        expect(validation.success).toBeFalsy();
    });

    test("Should NOT be valid (invalid hash)", () => {
        const block = new Block("", "block 2");
        block.hash = "";
        const validation = block.isValid();
        expect(validation.success).toBeFalsy();
    });

    test("Should NOT be valid (invalid data)", () => {
        const block = new Block(genesis.hash, "");
        const validation = block.isValid();
        expect(validation.success).toBeFalsy();
    });
});