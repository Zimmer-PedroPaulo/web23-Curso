/**
 * Moked Wallet class representing a cryptocurrency wallet.
 */
export default class Wallet {
    private privateKey: string;
    private publicKey: string;
    
        constructor(wifOrPrivateKey?: string) {
            this.privateKey = wifOrPrivateKey || "mocked_private_key";
            this.publicKey = wifOrPrivateKey || "mocked_public_key";
        }

        getPublicKey(): string {
            return this.publicKey;
        }
    }