import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import Block from "../lib/block";
import Blockchain from "../lib/blockchain";
import { swaggerPaths, createEndpoint } from "./swaggerConfig";
import Transaction from '../lib/transaction';
import TransactionInput from '../lib/transactionInput';
import TransactionOutput from '../lib/transactionOutput';

const app = express();

/* c8 ignore next */
const PORT: number = parseInt(process.env.BLOCKCHAIN_PORT || '3000', 10);

// Configuração do Swagger (Simplificada)
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ProtoChain API',
      version: '1.0.0',
      description: 'API para interagir com a blockchain ProtoChain',
    },
    servers: [{
      url: `http://localhost:${PORT}`,
      description: 'Servidor de desenvolvimento',
    }],
    paths: {
      ...swaggerPaths,
      // Adicione novos endpoints aqui facilmente:
      // '/novo-endpoint': createEndpoint('/novo-endpoint', 'get', 'Descrição breve')
    },
  },
  apis: [], // Não precisamos mais de arquivos externos
};

const specs = swaggerJsdoc(swaggerOptions);

/* c8 ignore next */
if(process.argv.includes('--run')) app.use(morgan("tiny"));
app.use(express.json());

// Middleware do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const blockchain = new Blockchain();

// Endpoint: Status da blockchain
app.get("/status", (req, res) => {
    res.json({
        numberOfBlocks: blockchain.getLength(),
        isValid: blockchain.isValid(),
        memPool: blockchain.getMempool(),
        protoBlock: blockchain['protoBlock'],
        BlockChain: blockchain.getChain(),
    });
});


// Endpoint: Obter o próximo bloco (protoBlock)
app.get("/blocks/next", (req: Request, res: Response, next: NextFunction) => {
	res.json(blockchain.getNextBlock());
});


// Endpoint: Listar todas as transações da mempool
app.get('/transactions', (req: Request, res: Response, next: NextFunction) => {
	return res.json(blockchain.getMempool());
});


// Endpoint: Buscar transação específica por hash
app.get('/transactions/:hash', (req: Request, res: Response, next: NextFunction) => {
	const transaction = blockchain.getTransaction(req.params.hash!);
	if (transaction.mempoolIndex === -1 && transaction.blockIndex === -1) {
		return res.sendStatus(404); // Not Found
	}
	
	return res.json(transaction);
});


// Endpoint: Buscar bloco por índice ou hash
app.get('/blocks/:indexOrHash', (req: Request, res: Response, next: NextFunction) => {
  /* c8 ignore next */
  if (!req.params.indexOrHash) return res.sendStatus(400); // Bad Request

  const block = blockchain.getBlock(req.params.indexOrHash);

  if (!block) {
    return res.sendStatus(404); // Vai para o middleware de 404 (not found)
  }
  return res.json(block);
});


// Endpoint: mine -- Simulate mining the protoBlock -- for manual testing purposes
// Should not be used in production
app.get('/blocks/mine/:minerAddress', (req: Request, res: Response) => {
  const minerAddress = req.params.minerAddress;

  const blockInfo = blockchain.getNextBlock();
  const controle = JSON.stringify(blockInfo.protoBlock);
  if (blockInfo.protoBlock.getHash() === "-Empty ProtoBlock-") {
    return res.status(422).json({ error: 'There is no protoBlock to mine on the blockchain' });
  }
  
  blockInfo.protoBlock.reward(minerAddress!, blockInfo.feePerTX);
  blockInfo.protoBlock.mine( blockchain.getDifficulty() );

  res.status(201).json({ nonce: blockInfo.protoBlock.getNonce(), miner: blockInfo.protoBlock.getMiner() });
});


app.get('/wallets/:walletAddress', (req: Request, res: Response, next: NextFunction) => {
  const walletAddress = req.params.walletAddress!;

  res.json({ 
    balance: blockchain.getBalance(walletAddress), 
    feePerTX: blockchain.getFeePerTX(), 
    utxo: blockchain.getUTXO(walletAddress) 
  });
});


app.post('/blocks/', (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.miner || req.body.nonce === undefined || req.body.feePerTX === undefined) 
    return res.status(400).json({ error: 'A JSON {"nonce": number}, {"miner": string}, {"feePerTX": number} is required', received: req.body }); // Bad Request

  const { nonce, miner, feePerTX } = req.body;
  const validation = blockchain.addBlock(nonce, miner, blockchain.getReward());

  if (!validation.success) {
    return res.status(422).json(validation);// Unprocessable Entity
  }

  return res.status(201).json({ message: 'Block added successfully' }); // Created
});


app.post('/transactions/', (req: Request, res: Response, next: NextFunction) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Transaction data is required' });
  }

  const transactionData = req.body;
  const transaction = new Transaction({
    ...transactionData
  });

  const validation = blockchain.addTransaction(transaction);
  if (!validation.success) {
    res.status(422).json({ "Validation error": validation.message });
  }

  res.status(201).json({ message: 'Transaction added successfully', transaction });
});


app.post('/transactions/transactionInputs/sign', (req: Request, res: Response, next: NextFunction) => {
  const {fromAddress, amount, privateKey} = req.body;
  if (!fromAddress || !amount || !privateKey) {
    return res.status(400).json({ error: 'All transactionInput data is required: {fromAddress, amount, privateKey}' });
  }

  const transactionInput = new TransactionInput({
    fromAddress: fromAddress,
    amount: amount
  });

  transactionInput.sign(privateKey);

  const validation = transactionInput.isValid();
  if (!validation.success) {
    res.status(422).json({ "Validation error": validation.message });
  }

  res.status(201).json({ message: 'TransactionInput signed successfully: ', transactionInput });
});





let server: any = null;

if(process.argv.includes('--run')) {
  server = app.listen(PORT, () => {
    console.log(`BlockChain server running at http://localhost:${PORT}`);
    console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  });
}

export { app, server }