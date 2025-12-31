import dotenv from 'dotenv';
import axios from 'axios';
import Wallet from '../lib/wallet';
import readline from 'readline';
import TransactionInput from '../lib/transactionInput';
import Transaction from '../lib/transaction';
import TransactionType from '../lib/transactionType';
import { time } from 'console';
import TransactionOutput from '../lib/transactionOutput';


dotenv.config();

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let myWallet: Wallet;
myWallet = new Wallet(process.env.MINER_PRIVATE_KEY);
// privateKey 87b1899544195b78bb7988434d8291213dfe9853856e46e57d2f20ffaed61200
// publicKey 03ab48e01eda74405c5a1ea4d51ebf98f8f470a86e9d5e8bc38ff5ecd76fde3348

function menu() {
    setTimeout(() => {
        console.clear();
        if (!myWallet) {
            console.log("No wallet loaded.");
        } else {
            console.log("myWallet Address: " + myWallet.getPublicKey());
        }
        console.log("\n=== Wallet Menu ===");
        console.log("1. Create Wallet");
        console.log("2. Recover Wallet");
        console.log("3. View Balance");
        console.log("4. Send Transaction");
        console.log("5. Search Transaction");
        console.log("6. Exit");
        rl.question("Choose an option: ", function(option) {
            switch(option) {
                case "1": createWallet(); break;
                case "2": recoverWallet(); break;
                case "3": viewBalance(); break;
                case "4": sendTransaction(); break;
                case "5": searchTransaction(); break;
                case "6": rl.close(); break;
                default: console.log("Invalid option. Please try again.");  menu();
            }
        });
    }, 100);
}


function preMenu() {
    rl.question("Press Enter to return to menu...", function(option) {

        menu();
    });
}


function createWallet() {
    myWallet = new Wallet();
    console.log("New wallet created!");
    console.log("Private Key: " + myWallet["privateKey"]);
    console.log("Public Key:  " + myWallet.getPublicKey());
    preMenu();
}


function recoverWallet() {
    rl.question("Enter your WIF or private key: ", function(wifOrprivateKey) {
        try {
            myWallet = new Wallet(wifOrprivateKey);
            console.log("Wallet recovered successfully!");
            console.log("Public Key: " + myWallet.getPublicKey());
        } catch (error) {
            console.log("Error recovering wallet: ");
        }
        preMenu();
    });
}


async function viewBalance() {
    if (!myWallet.getPublicKey()) {
        console.log("No wallet loaded. Please recover your wallet first.");
        return preMenu();
    }

    console.log("Fetching balance for wallet: " + myWallet.getPublicKey());
    const walletResponse = await axios.get(`${BLOCKCHAIN_SERVER}/wallets/${myWallet.getPublicKey()}`);
    console.log("Wallet Balance: " + walletResponse.data.balance);  
    preMenu();
}


function sendTransaction() {
    if (!myWallet.getPublicKey()) {
        console.log("No wallet loaded. Please recover your wallet first.");
        return menu();
    }
    rl.question("Enter recipient address: ", function(recipient) {
        if (recipient.length < 64) {
            console.log("Invalid recipient address.");
            return preMenu();
        }
        rl.question("Enter amount to send: ", async function(amountStr) {
            const amount = parseInt(amountStr);
            if (!amount) {
                console.log("Invalid amount.");
                return preMenu();
            }

            // balance check
            const walletResponse = await axios.get(`${BLOCKCHAIN_SERVER}/wallets/${myWallet.getPublicKey()}`);
            const balance = walletResponse.data.balance as number;
            const fee = walletResponse.data.fee as number;

            if (balance < amount + fee) {
                console.log(`Insufficient balance. Available: ${balance}, Required: ${amount + fee}`);
                return preMenu();
            }

            const inputs = walletResponse.data.utxo.map((tx: any) => new TransactionInput({
                fromAddress: myWallet.getPublicKey(),
                amount: tx.amount,
                previousTx: tx.tx
            }));
            inputs.forEach((txi : TransactionInput) => txi.sign(myWallet["privateKey"]));
  
            
            const outputs = [new TransactionOutput({
                toAddress: recipient,
                amount: amount
            })];

            outputs.push(new TransactionOutput({
                toAddress: myWallet.getPublicKey(),
                amount: balance - amount - fee
            }));    

            console.log(`Sending ${amount} to ${recipient} from wallet ${myWallet.getPublicKey()}`);  
            axios.post(`${BLOCKCHAIN_SERVER}/transactions`, {
                type: TransactionType.REGULAR,
                timestamp: Date.now(),
                txInputs: inputs,
                txOutputs: outputs
            })
            .then(response => {
                console.log("Transaction sent successfully!");
                console.log(response.data.transaction);
            })
            .catch(error => {
                console.log("Error sending transaction: " + error + " -- " + error.message);
            });
            preMenu();
        });
    });
    menu();
}


function searchTransaction() {
    rl.question("Enter transaction hash to search: ", function(txHash) {
        if (txHash.length < 64) {
            console.log("Invalid transaction hash.");
            return preMenu();
        }
        console.log(`Searching for transaction: ${txHash}`);    
        
        axios.get(`${BLOCKCHAIN_SERVER}/transactions/${txHash}`)
        .then(response => {
            console.log("Transaction found:");
            console.log(response.data);
        })
        .catch(error => {
            console.log("Error searching transaction: " + error + " -- " + error.response);
        }); 
        preMenu();
    });
}


menu();