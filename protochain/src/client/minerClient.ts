import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import BlockInfo from '../lib/blockInfo';
import Block from '../lib/block';

const BLOCKCHAIN_SERVER_URL = `${process.env.BLOCKCHAIN_SERVER}` || 'http://localhost:3000';

const minerWallet = {
    privateKey: `${process.env.MINER_PRIVATE_KEY}` || "123456",
    publicKey: `${process.env.MINER_PUBLIC_KEY}` || "Zimmer"
}

let totalMined = 0;

async function mineBlock() {
    console.log("Getting next block info...")
    const { data } = await axios.get(`${BLOCKCHAIN_SERVER_URL}/blocks/next`);
    const blockInfo = data as BlockInfo;

    const newBlock = new Block({
        previousHash: blockInfo.previousHash,
        data: blockInfo.data
    });

    // TODO: adicionar tx de recompensa

    console.log(`Start mining block #${blockInfo.index}`);
    newBlock.mine(blockInfo.dificulty, minerWallet.publicKey)

    console.log("Block mined! Sending to blockchain...");

    try{
        await axios.post(`${BLOCKCHAIN_SERVER_URL}/blocks/`, newBlock);
        console.log("Block sent and accepted!");
        totalMined++;
        console.log(`Total mined blocks: ${totalMined}`);
        console.log(newBlock);
    }
    catch(err: any){
        console.error(err.response ? err.response.data : err.message);
    }

    setTimeout(() => {mineBlock()}, 1000);
}

mineBlock();