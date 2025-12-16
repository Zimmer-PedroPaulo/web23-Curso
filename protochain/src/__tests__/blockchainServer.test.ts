import request from 'supertest';
import {describe, test, jest, beforeAll, afterAll} from '@jest/globals';
// import {app} from '../server/blockchainServer';
import Block from '../lib/block'
import Transaction from '../lib/transaction';
import Wallet from '../lib/wallet';

jest.mock('../lib/block');
jest.mock('../lib/blockchain');
jest.mock('../lib/transaction');
jest.mock('../lib/transactionInput');
jest.mock('../lib/wallet');

describe("Blockchain Server Tests", () => {
    let app: any;
    let server: any;

    const aliceWallet = new Wallet('alice');
    const bobWallet = new Wallet('bob');
    
    beforeAll(() => {
        // Importar app sem --run primeiro
        const appModule = require('../server/blockchainServer');
        app = appModule.app;
    });

    afterAll(() => {
    // Close server after all tests
    if (server) {
        server.close();
    }
    });

    test("GET /transactions/:hash - Should NOT return a transaction (not found)", async () => {
        // try getting a transaction when there is none
        // Mocked blockchain takes only mempool transactions for getTransaction
        const response = await request(app)
            .get('/transactions/transaction hash');

        expect(response.status).toEqual(404); // Not Found  
    });

    test("GET /transactions/:hash - Should return a transaction from blockchain", async () => {
        // First add a transaction to the mempool
        // Mocked blockchain takes only mempool transactions for getTransaction
        await request(app)
            .post('/transactions/')
            .send({ hash: "transaction hash", data: "transaction data" });

        // then test getting that transaction
        const response = await request(app)
            .get('/transactions/transaction hash');

        expect(response.status).toEqual(200); // OK
        expect(response.body.transaction.hash).toEqual("transaction hash");   
    });

    test("GET /transactions - Should return mempool transactions", async () => {
        // First add a transaction to the mempool
        await request(app)
            .post('/transactions/')
            .send({ hash: "transaction hash", data: "transaction data" });

        // Test getting all transactions from mempool
        const response = await request(app)
            .get('/transactions');

        expect(response.status).toEqual(200); // OK
        expect(response.body[0].hash).toBe("transaction hash");
    });

    test("GET /blocks/:indexOrHash - Should return the Genesis block", async () => {
        const response = await request(app)
        .get('/blocks/0'); //Tanto faz testar por hash ou index, a tratativa não está em blockchainServer.ts

        expect(response.status).toEqual(200); // OK
        expect(response.body.miner).toEqual("genesis");
    });

    test("GET /blocks/:indexOrHash - Should NOT return a block (Invalid index/hash)", async () => {
        const response = await request(app)
        .get('/blocks/abcb'); //Tanto faz testar por hash ou index, a tratativa não está em blockchainServer.ts

        expect(response.status).toEqual(404); // Not found
    });

    test("GET /blocks/next - Should return the next block info", async () => {
        const transactionResponse = await request(app)
        .post('/transactions/')
        .send({ data: "transaction data" });
        
        const blockInfoResponse = await request(app)
        .get('/blocks/next');

        expect(blockInfoResponse.status).toEqual(200); // OK
        expect(blockInfoResponse.body.index).toEqual(1);
    });
    

    test("POST /blocks - Should add a new block", async () => {
        // First, add a transaction to the mempool
        const transactionResponse = await request(app)
        .post('/transactions/')
        .send({ data: "transaction data" });

        // Then, get the protoBlock info
        const blockInfoResponse = await request(app)
        .get('/blocks/next');

        // Mine the protoBlock
        const mineResponse = await request(app)
        .post('/mine/')
        .send(blockInfoResponse.body);

        // Finally, send a request to add the mined block
        const addBlockResponse = await request(app)
        .post('/blocks/')
        .send({
            nonce: mineResponse.body.nonce,
            miner: mineResponse.body.miner,
            feePerTX: 1
        });

        expect(addBlockResponse.status).toEqual(201); // Created
        expect(addBlockResponse.body.message).toEqual("Block added successfully");
    });


    test("POST /blocks - Should NOT add a new block (No transactions in mempool)", async () => {

        // Send a request to add a block without adding any transaction first
        const addBlockResponse = await request(app)
        .post('/blocks/')
        .send({
            nonce: 0,
            miner: "miner1",
            feePerTX: 1
        });

        expect(addBlockResponse.status).toEqual(422); // Unprocessable Entity
        expect(addBlockResponse.body.message).toEqual("No protoBlock to add");
    });


    test("POST /blocks - Should NOT add a new block (No data in request)", async () => {
        // Send a request to add a block without adding any transaction first
        const addBlockResponse = await request(app)
        .post('/blocks/')
        .send({});

        expect(addBlockResponse.status).toEqual(400); // Bad Request
    });







    test("POST /transactions/transactionInputs/sign - Should sign a transactionInput", async () => {
        const response = await request(app)
        .post('/transactions/transactionInputs/sign')
        .send({
            fromAddress: aliceWallet.getPublicKey(),
            amount: 1,
            privateKey: aliceWallet["privateKey"]
        });

        expect(response.status).toEqual(201); // Created
    });


    test("POST /transactions/transactionInputs/sign - Should NOT sign a transactionInput - invalid signature", async () => {
        const response = await request(app)
        .post('/transactions/transactionInputs/sign')
        .send({
            fromAddress: aliceWallet.getPublicKey(),
            amount: 1,
            privateKey: "invalid_privateKey" // This will trigger the mock to return invalid
        });

        expect(response.status).toEqual(422); // Unprocessable Entity
    });


    test("POST /transactions/transactionInputs/sign - Should NOT sign a transactionInput - missing data", async () => {
        const response = await request(app)
        .post('/transactions/transactionInputs/sign')
        .send({
            fromAddress: aliceWallet.getPublicKey(),
            privateKey: aliceWallet["privateKey"]
        });

        expect(response.status).toEqual(400); // Bad Request
    });
    

    test("POST /transactions/transactionInputs/sign - Should NOT sign a transactionInput - invalid signature", async () => {
        const response = await request(app)
        .post('/transactions/transactionInputs/sign')
        .send({
            fromAddress: aliceWallet.getPublicKey(),
            amount: 1,
            privateKey: bobWallet["privateKey"]
        });

        expect(response.status).toEqual(422); // Unprocessable Entity
        expect(response.body["Validation error"]).toEqual("Invalid mocked signature");
    });


    test("POST /transactions - Should add a new transaction", async () => {
        const response = await request(app)
        .post('/transactions/')
        .send({ data: "transaction data" });

        expect(response.status).toEqual(201); // Created
    });


    test("POST /transactions - Should NOT add a new transaction (empty request)", async () => {
        const response = await request(app)
        .post('/transactions/')
        .send();

        expect(response.status).toEqual(400); // Bad Request
    });


    test("POST /transactions - Should NOT add a new transaction (invalid data)", async () => {
        const response = await request(app)
        .post('/transactions/')
        .send({ data: "transaction data", hash: "Invalid mock transaction" }); // See mock transaction.ts for invalid transaction
        
        expect(response.status).toEqual(422); // Unprocessable Entity
        expect(response.body["Validation error"]).not.toBe(undefined);
    });
    

    test("POST /mine - Should mine the protoBlock", async () => {
        // First, add a transaction to the mempool
        const transactionResponse = await request(app)
        .post('/transaction/')
        .send({ data: "transaction data" });

        // Then, get the protoBlock info
        const blockInfoResponse = await request(app)
        .get('/blocks/next');
        const blockInfo = blockInfoResponse.body;

        // Finally, try to mine the protoBlock
        const mineResponse = await request(app)
        .post('/mine/')
        .send(blockInfo);

        expect(mineResponse.status).toEqual(201); // Created
        expect(mineResponse.body.nonce).toBeGreaterThanOrEqual(0);
    });
    

    test("POST /mine - Should NOT mine the protoBlock (No blockinfo in request)", async () => {
        const mineResponse = await request(app)
        .post('/mine/')
        .send();

        expect(mineResponse.status).toEqual(400); // Bad Request
        expect(mineResponse.body.error).toBe("Block info is required");
    });


    test("GET /status - Should return the blockchain status", async () => {
        // Mockar process.argv antes de re-importar
        process.argv.push('--run');

        // Limpar cache do módulo
        jest.resetModules();
        delete require.cache[require.resolve('../server/blockchainServer')];

        // Re-importar com --run ativo
        const { app: runApp, server: runServer } = require('../server/blockchainServer');

        // Capturar referência do servidor para fechar depois
        server = runServer;

        // Aguardar um pouco para o servidor inicializar
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Rodar o teste com o --run ativo
        const response = await request(runApp).get('/status/');

        expect(response.status).toEqual(200); // OK
        expect(response.body.isValid.success).toEqual(true);
    });
})