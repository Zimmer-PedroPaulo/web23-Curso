import express from "express";
import morgan from "morgan";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import Blockchain from "../lib/blockchain";
import { swaggerPaths, createEndpoint } from "./swaggerConfig";
import Block from "../lib/block";

const app = express();
const PORT: number = 3000;

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

app.use(morgan("tiny"));
app.use(express.json());

// Middleware do Swagger
app.use('/api', swaggerUi.serve, swaggerUi.setup(specs));

const blockchain = new Blockchain();

// Endpoint: Status da blockchain
app.get("/status", (req, res) => {

  const lastBlock = blockchain.getLastBlock();
  const block = new Block(
    // blockchain.getLastBlock().index + 1,
    blockchain.getLastBlock().hash,
    "Novo bloco"
  );
  blockchain.addBlock(block);

    res.json({
        numberOfBlocks: blockchain.blocks.length,
        isValid: blockchain.isValid(),
        BlockChain: blockchain.blocks,
        block: block.isValid()
    });
});

// Endpoint: Buscar bloco por índice ou hash
app.get('/blocks/:indexOrHash', (req, res, next) =>{
    const block = blockchain.getBlock(req.params.indexOrHash);

    if (!block) return next(); // Vai para o middleware de 404
    return res.json(block);
});







app.listen(PORT, () => {
    console.log(`BlockChain server running at http://localhost:${PORT}`);
    console.log(`📚 API Documentation available at http://localhost:${PORT}/api`);
});