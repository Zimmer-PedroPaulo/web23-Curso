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
                  lastBlock: { type: 'object' },
                  protoBlock: { type: 'object' }
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
      summary: 'Adicionar bloco minerado',
      description: 'Adiciona um bloco já minerado à blockchain',
      tags: ['Blockchain'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['nonce', 'miner'],
              properties: {
                nonce: {
                  type: 'number',
                  description: 'Valor do nonce encontrado na mineração',
                  example: 123456
                },
                miner: {
                  type: 'string',
                  description: 'Endereço da carteira do minerador',
                  example: 'miner_wallet_address'
                },
                feePerTX: {
                  type: 'number',
                  description: 'Taxa por transação (opcional)',
                  example: 1
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Bloco adicionado com sucesso à blockchain'
        },
        400: {
          description: 'Parâmetros obrigatórios ausentes',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'A JSON {"nonce": number}, {"miner": string} is required'
                  }
                }
              }
            }
          }
        },
        422: {
          description: 'Erro na validação do bloco',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Invalid block validation'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/mine': {
    post: {
      summary: 'Minerar bloco',
      description: 'Realiza a mineração de um bloco com as transações pendentes',
      tags: ['Mineração'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['blockInfo'],
              properties: {
                blockInfo: {
                  type: 'object',
                  description: 'Informações do bloco a ser minerado',
                  properties: {
                    protoBlock: {
                      type: 'object',
                      description: 'Bloco protótipo com transações',
                      properties: {
                        previousHash: {
                          type: 'string',
                          description: 'Hash do bloco anterior',
                          example: 'abc123def456...'
                        },
                        transactions: {
                          type: 'array',
                          description: 'Lista de transações do bloco',
                          items: {
                            type: 'object',
                            properties: {
                              from: { type: 'string', example: 'wallet_from' },
                              to: { type: 'string', example: 'wallet_to' },
                              amount: { type: 'number', example: 10.5 },
                              data: { type: 'string', example: 'Transaction data' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Bloco minerado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nonce: {
                    type: 'number',
                    description: 'Valor do nonce encontrado',
                    example: 123456
                  },
                  miner: {
                    type: 'string',
                    description: 'Endereço do minerador',
                    example: 'miner1'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Informações do bloco são obrigatórias',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Block info is required'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/transactions': {
    post: {
      summary: 'Criar nova transação',
      description: 'Adiciona uma nova transação à mempool ou processa uma transação',
      tags: ['Transações'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'Dados da transação diretamente no body',
              properties: {
                type: {
                  type: 'number',
                  description: 'TransactionType.REGULAR = 1, TransactionType.FEE = 2',
                  example: 1
                },
                to: {
                  type: 'string', 
                  description: 'Endereço do destinatário',
                  example: '03ab48e01eda74405c5a1ea4d51ebf98f8f470a86e9d5e8bc38ff5ecd76fde3348'
                },
                txInput: {
                  type: 'object',
                  properties: {
                    fromAddress: {
                      type: 'string',
                      description: 'Endereço do remetente',
                      example: '03ab48e01eda74405c5a1ea4d51ebf98f8f470a86e9d5e8bc38ff5ecd76fde3348'
                    },
                    amount: {
                      type: 'number',
                      description: 'Valor da transação',
                      example: 1
                    },
                    signature: {
                      type: 'string',
                      description: 'Assinatura digital da transação',
                      example: ''
                    }
                  }
                },
                timestamp: {
                  type: 'number',
                  description: 'Timestamp da transação',
                  example: 1696753200000
                },
                hash: {
                  type: 'string',
                  description: 'Hash da transação',
                  example: 'abc123def456'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Transação criada com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    description: 'Mensagem de confirmação',
                    example: 'Transaction added successfully'
                  },
                  transaction: {
                    type: 'object',
                    description: 'Dados da transação criada',
                    properties: {
                      id: {
                        type: 'string',
                        description: 'ID único da transação',
                        example: 'tx_123456789'
                      },
                      from: {
                        type: 'string',
                        example: 'wallet_address_sender'
                      },
                      to: {
                        type: 'string',
                        example: 'wallet_address_receiver'
                      },
                      amount: {
                        type: 'number',
                        example: 100.50
                      },
                      timestamp: {
                        type: 'number',
                        example: 1696753200000
                      },
                      status: {
                        type: 'string',
                        description: 'Status da transação',
                        example: 'pending'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Dados da transação inválidos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Transaction data is required'
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
                    example: 'Invalid transaction format'
                  }
                }
              }
            }
          }
        }
      }
    },
    get: {
      summary: 'Listar transações da mempool',
      description: 'Retorna todas as transações pendentes na mempool',
      tags: ['Transações'],
      responses: {
        200: {
          description: 'Lista de transações na mempool',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                description: 'Lista de transações pendentes na mempool',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      description: 'ID único da transação',
                      example: 'tx_123456789'
                    },
                    from: {
                      type: 'string',
                      description: 'Endereço do remetente',
                      example: 'wallet_address_sender'
                    },
                    to: {
                      type: 'string',
                      description: 'Endereço do destinatário',
                      example: 'wallet_address_receiver'
                    },
                    amount: {
                      type: 'number',
                      description: 'Valor da transação',
                      example: 100.50
                    },
                    timestamp: {
                      type: 'number',
                      description: 'Timestamp da transação',
                      example: 1696753200000
                    },
                    hash: {
                      type: 'string',
                      description: 'Hash da transação',
                      example: 'tx_abc123def456'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/transactions/{hash}': {
    get: {
      summary: 'Buscar transação por hash',
      description: 'Busca uma transação específica pelo seu hash',
      tags: ['Transações'],
      parameters: [
        {
          name: 'hash',
          in: 'path',
          required: true,
          description: 'Hash da transação',
          schema: {
            type: 'string',
            example: 'tx_abc123def456'
          }
        }
      ],
      responses: {
        200: {
          description: 'Transação encontrada',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  transaction: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        description: 'ID único da transação',
                        example: 'tx_123456789'
                      },
                      from: {
                        type: 'string',
                        description: 'Endereço do remetente',
                        example: 'wallet_address_sender'
                      },
                      to: {
                        type: 'string',
                        description: 'Endereço do destinatário',
                        example: 'wallet_address_receiver'
                      },
                      amount: {
                        type: 'number',
                        description: 'Valor da transação',
                        example: 100.50
                      },
                      timestamp: {
                        type: 'number',
                        description: 'Timestamp da transação',
                        example: 1696753200000
                      },
                      hash: {
                        type: 'string',
                        description: 'Hash da transação',
                        example: 'tx_abc123def456'
                      }
                    }
                  },
                  mempoolIndex: {
                    type: 'number',
                    description: 'Índice na mempool (-1 se não estiver na mempool)',
                    example: -1
                  },
                  blockIndex: {
                    type: 'number',
                    description: 'Índice do bloco onde a transação está',
                    example: 5
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Hash não fornecido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Hash is required'
                  }
                }
              }
            }
          }
        },
        404: {
          description: 'Transação não encontrada',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Transaction not found'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/transactions/transactionInputs/sign': {
    post: {
      summary: 'Assinar TransactionInput',
      description: 'Cria e assina um novo TransactionInput',
      tags: ['TransactionInput'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                fromAddress: { type: 'string', example: '03ab48e01eda74405c5a1ea4d51ebf98f8f470a86e9d5e8bc38ff5ecd76fde3348' },
                amount: { type: 'number', example: 1 },
                privateKey: { type: 'string', example: '87b1899544195b78bb7988434d8291213dfe9853856e46e57d2f20ffaed61200' }
              },
              required: ['fromAddress', 'amount', 'privateKey']
            }
          }
        }
      },
      responses: {
        201: {
          description: 'TransactionInput assinado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  transactionInput: {
                    type: 'object',
                    properties: {
                      fromAddress: { type: 'string' },
                      amount: { type: 'number' },
                      signature: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Dados obrigatórios ausentes',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Missing required fields'
                  }
                }
              }
            }
          }
        },
        422: {
          description: 'Erro na validação do TransactionInput',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Invalid TransactionInput'
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