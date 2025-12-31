import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import BlockInfo from '../lib/blockInfo';
import Block from '../lib/block';
import Transaction from '../lib/transaction';
import { json } from 'express';
import TransactionType from '../lib/transactionType';
import Wallet from '../lib/wallet';

const BLOCKCHAIN_SERVER_URL = `${process.env.BLOCKCHAIN_SERVER}`; // || 'http://localhost:3000';

console.log(`Connecting to Blockchain Server at ${BLOCKCHAIN_SERVER_URL}`);

const minerWallet = new Wallet("87b1899544195b78bb7988434d8291213dfe9853856e46e57d2f20ffaed61200");

let totalMined = 0;

async function mineBlock() {

    console.log("Getting next block info...")
    const data = JSON.parse(await axios.get(`${BLOCKCHAIN_SERVER_URL}/blocks/next`).then(res => JSON.stringify(res.data)));

    // Recreate transactions array
    // const transactions: Transaction[] = data.protoBlock.transactions.map((tx: any) => new Transaction({...tx}));

    // Create new block
    const newBlock = new Block({...data.protoBlock});

    console.log(`Start mining block #${data.index}`);
    newBlock.reward(minerWallet.getPublicKey(), data.blockchainReward);
    newBlock.mine(data.difficulty);
    console.log("Block mined! Sending to blockchain..." + JSON.stringify(newBlock));

    try{
        await axios.post(`${BLOCKCHAIN_SERVER_URL}/blocks/`, {
        nonce: newBlock.getNonce(),
        miner: newBlock.getMiner(),
        feePerTX: data.feePerTX,
        });
        console.log("Block sent and accepted!");
        totalMined++;
        console.log(`Total mined blocks: ${totalMined}`);
    }
    catch(err: any){
        console.error(err.response ? err.response.data : err.message);
    }

    setTimeout(() => {mineBlock()}, 1000);
}

mineBlock();