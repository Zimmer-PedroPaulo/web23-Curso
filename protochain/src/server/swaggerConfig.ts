// Configuração simplificada do Swagger
export const swaggerPaths = {
  '/status': {
    get: {
      summary: 'Status da blockchain',
      description: 'Retorna informações sobre a blockchain',
      tags: ['Blockchain'],
      responses: {
        200: {
          description: 'Sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  numberOfBlocks: { type: 'number' },
                  isValid: { type: 'object' },
                  lastBlock: { type: 'object' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/blocks/{indexOrHash}': {
    get: {
      summary: 'Buscar bloco',
      description: 'Busca um bloco por índice ou hash',
      tags: ['Blockchain'],
      parameters: [{
        in: 'path',
        name: 'indexOrHash',
        required: true,
        schema: { type: 'string' },
        description: 'Índice ou hash do bloco'
      }],
      responses: {
        200: {
          description: 'Bloco encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  index: { type: 'number' },
                  hash: { type: 'string' },
                  previousHash: { type: 'string' },
                  data: { type: 'string' },
                  timestamp: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  }
};

// Helper para adicionar novos endpoints facilmente
export const createEndpoint = (
  path: string, 
  method: 'get' | 'post' | 'put' | 'delete',
  summary: string,
  description: string = summary
) => ({
  [method]: {
    summary,
    description,
    tags: ['Blockchain'],
    responses: {
      200: {
        description: 'Sucesso',
        content: {
          'application/json': {
            schema: { type: 'object' }
          }
        }
      }
    }
  }
});