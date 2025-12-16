import * as ecc from 'tiny-secp256k1';
import ECPairFactory, { ECPairInterface} from 'ecpair';

const ECPair = ECPairFactory(ecc);

/**
 * A simple Wallet class representing a cryptocurrency wallet.
 */
export default class Wallet {
    private privateKey: string;
    private publicKey: string;
    
        constructor(wifOrPrivateKey?: string) {
            let keys;

            if (!wifOrPrivateKey) {
                // Generate a new random key pair
                keys = ECPair.makeRandom();
            } else if (wifOrPrivateKey?.length === 64) {
                // If a private key is provided, use it to create the key pair
                keys = ECPair.fromPrivateKey(Buffer.from(wifOrPrivateKey, 'hex'));
            } else {
                // If a WIF is provided, use it to create the key pair
                keys = ECPair.fromWIF(wifOrPrivateKey);
            }
            
            this.privateKey = keys.privateKey!.toString('hex');
            this.publicKey = keys.publicKey.toString('hex');
        }

        getPublicKey(): string {
            return this.publicKey;
        }
    }