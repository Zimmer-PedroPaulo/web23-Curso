import Wallet from "../lib/wallet";


describe('Wallet tests', () => {

    let aliceWallet: Wallet;
    const exempleWIF = '5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ';

    beforeAll(() => {
        aliceWallet = new Wallet();
    });
    
    test('should create a new wallet with random keys', () => {
        const wallet = new Wallet();
        expect(wallet.getPublicKey()).toHaveLength(66); // Compressed public key length in hex
    });


    test('should create a wallet from a given private key', () => {
        const testWallet = new Wallet(aliceWallet['privateKey']);
        expect(testWallet.getPublicKey()).toBe(aliceWallet.getPublicKey());
    });


    test('should create a wallet from a given WIF', () => {
        const testWallet = new Wallet(exempleWIF);
        expect(testWallet.getPublicKey()).toBeTruthy();
    });


    test('should get the public key', () => {
        const publicKey = aliceWallet.getPublicKey();
        expect(publicKey).toHaveLength(66); // Compressed public key length in hex
    });
}); 