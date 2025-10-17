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
  },
  '/blocks/next': {
    get: {
      summary: 'Obter próximo bloco',
      description: 'Retorna informações sobre o próximo bloco que será criado na blockchain',
      tags: ['Blockchain'],
      responses: {
        200: {
          description: 'Informações do próximo bloco retornadas com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  index: {
                    type: 'number',
                    description: 'Índice do próximo bloco',
                    example: 2
                  },
                  previousHash: {
                    type: 'string',
                    description: 'Hash que deve ser usado como hash anterior',
                    example: 'abc123def456...'
                  },
                  difficulty: {
                    type: 'number',
                    description: 'Dificuldade atual da blockchain',
                    example: 2
                  },
                  maxDifficulty: {
                    type: 'number',
                    description: 'Dificuldade máxima configurada',
                    example: 62
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/blocks': {
    post: {
      summary: 'Criar novo bloco',
      description: 'Adiciona um novo bloco à blockchain',
      tags: ['Blockchain'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['previousHash', 'data'],
              properties: {
                previousHash: {
                  type: 'string',
                  description: 'Hash do bloco anterior',
                  example: 'abc123def456...'
                },
                data: {
                  type: 'string',
                  description: 'Dados a serem armazenados no bloco',
                  example: 'Dados importantes do bloco'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Bloco criado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  index: {
                    type: 'number',
                    description: 'Índice do bloco',
                    example: 1
                  },
                  timestamp: {
                    type: 'number',
                    description: 'Timestamp de criação',
                    example: 1696753200000
                  },
                  hash: {
                    type: 'string',
                    description: 'Hash do bloco',
                    example: 'def789ghi012...'
                  },
                  previousHash: {
                    type: 'string',
                    description: 'Hash do bloco anterior',
                    example: 'abc123def456...'
                  },
                  data: {
                    type: 'string',
                    description: 'Dados armazenados',
                    example: 'Dados importantes do bloco'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Erro na validação do bloco',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Invalid block: Hash is not equal to the blockchain\'s last block'
                  }
                }
              }
            }
          }
        },
        422: {
          description: 'Dados obrigatórios ausentes',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Field \'hash\' is required.'
                  }
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