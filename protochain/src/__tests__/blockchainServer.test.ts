import request from 'supertest';
import {describe, test, jest, beforeAll, afterAll} from '@jest/globals';
// import {app} from '../server/blockchainServer';
import Block from '../lib/block'

jest.mock('../lib/block');
jest.mock('../lib/blockchain');

describe("Blockchain Server Tests", () => {
    let app: any;
    let server: any;
    
    beforeAll(() => {
        // Importar app sem --run primeiro
        const appModule = require('../server/blockchainServer');
        app = appModule.app;
    });

    afterAll(() => {
    // Limpar qualquer servidor que possa estar rodando
    if (server) {
        server.close();
    }
    });

    test("GET /blocks/:indexOrHash - Should return the Genesis block", async () => {
        const response = await request(app)
        .get('/blocks/abc'); //Tanto faz testar por hash ou index, a tratativa não está em blockchainServer.ts

        expect(response.status).toEqual(200); // OK
        expect(response.body.data).toEqual("Genesis Block");
    })

    test("GET /blocks/:indexOrHash - Should NOT return a block (Invalid index/hash)", async () => {
        const response = await request(app)
        .get('/blocks/abcb'); //Tanto faz testar por hash ou index, a tratativa não está em blockchainServer.ts

        expect(response.status).toEqual(404); // Not found
    })

    test("GET /blocks/next - Should return the next block info", async () => {
        const response = await request(app)
        .get('/blocks/next');

        expect(response.status).toEqual(200); // OK
        expect(response.body.index).toEqual(1);
    })

    test("POST /blocks - Should add a new block", async () => {
        const block = new Block({previousHash: "abc", data: "new block"});
        const response = await request(app)
        .post('/blocks/')
        .send(block);

        expect(response.status).toEqual(201); // Created
        expect(response.body.hash).toEqual("abc");
    })

    test("POST /blocks - Should NOT add a new block (Invalid block)", async () => {
        const block = new Block({previousHash: "abc", data: "Invalid block"});
        const response = await request(app)
        .post('/blocks/')
        .send(block);

        expect(response.status).toEqual(422); // Unprocessable Entity
    })

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
        await new Promise(resolve => setTimeout(resolve, 100));

        // Rodar o teste com o --run ativo
        const response = await request(runApp).get('/status/');

        expect(response.status).toEqual(200); // OK
        expect(response.body.isValid.success).toEqual(true);
    })

})