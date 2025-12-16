import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import BlockInfo from '../lib/blockInfo';
import Block from '../lib/block';
import Transaction from '../lib/transaction';
import { json } from 'express';
import TransactionType from '../lib/transactionType';

const BLOCKCHAIN_SERVER_URL = `${process.env.BLOCKCHAIN_SERVER}`; // || 'http://localhost:3000';

console.log(`Connecting to Blockchain Server at ${BLOCKCHAIN_SERVER_URL}`);

const minerWallet = {
    privateKey: `${process.env.MINER_PRIVATE_KEY}` || "123456",
    publicKey: `${process.env.MINER_PUBLIC_KEY}` || "Zimmer"
}

let totalMined = 0;

async function mineBlock() {
    // create a transaction first
    await axios.post(`${BLOCKCHAIN_SERVER_URL}/transactions/`, {
        data: `Transaction from miner ${minerWallet.publicKey} at ${new Date().toISOString()}`
    });

    console.log("Getting next block info...")
    const data = JSON.parse(await axios.get(`${BLOCKCHAIN_SERVER_URL}/blocks/next`).then(res => JSON.stringify(res.data)));

    // Recreate transactions array
    const transactions: Transaction[] = data.protoBlock.transactions.map((tx: any) => new Transaction({
    type: tx.type,
    timestamp: tx.timestamp,
    hash: tx.hash,
    data: tx.data
    }));

    // Create new block
    const newBlock = new Block({
    transactions: transactions,
    previousHash: data.protoBlock.previousHash,
    timestamp: data.protoBlock.timestamp,
    });

    console.log(`Start mining block #${data.index}`);
    newBlock.reward(minerWallet.publicKey, data.feePerTX);
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