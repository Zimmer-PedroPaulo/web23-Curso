import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import Blockchain from "../lib/blockchain";
import { swaggerPaths, createEndpoint } from "./swaggerConfig";
import Block from "../lib/block";

const app = express();
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
    }
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
        BlockChain: blockchain.getChain(),
    });
});


app.get("/blocks/next", (req: Request, res: Response, next: NextFunction) => {
    res.json(blockchain.getNextBlock());
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


app.post('/blocks/', (req: Request, res: Response, next: NextFunction) => {
  const block = new Block(req.body);
  const validation = blockchain.addBlock(block);
  if (!validation.success) {
    return res.status(422).json({ error: validation.message });
  }
  
  return res.status(201).json(block); // Created
});





let server: any = null;

if(process.argv.includes('--run')) {
  server = app.listen(PORT, () => {
    console.log(`BlockChain server running at http://localhost:${PORT}`);
    console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  });
}

export { app, server }