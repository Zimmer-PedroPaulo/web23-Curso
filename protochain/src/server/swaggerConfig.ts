// Configuração simplificada do Swagger
export const swaggerPaths = {
  '/status': {
    get: {
      summary: 'The blockchain status',
      description: 'Returns information about the blockchain',
      tags: ['Blockchain'],
      responses: {
        200: {
          description: 'Successful response with blockchain status',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  numberOfBlocks: { type: 'number' },
                  isValid: { type: 'object' },
                  mempool: { type: 'object' },
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
      summary: 'Get a block by index or hash',
      description: 'Get a block by index or hash',
      tags: ['Blockchain'],
      parameters: [{
        in: 'path',
        name: 'indexOrHash',
        required: true,
        schema: { type: 'string' },
        description: 'The block index (as a string of digits) or the block hash'
      }],
      responses: {
        200: {
          description: 'Block found successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  block: { 
                    type: 'object',
                    description: 'The block data',
                    example: {
                      index: 0,
                      previousHash: '00000...',
                      timestamp: 1696753200000,
                      hash: '0000abc123...',
                      nonce: 123456,
                      transactions: [/* Array of transactions */]
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
  '/blocks/next': {
    get: {
      summary: 'Get the protoBlock containing the transactions to mine the next block',
      description: 'Get the protoBlock + informations to mine it',
      tags: ['Blockchain'],
      responses: {
        200: {
          description: 'Next block information returned successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  index: {
                    type: 'number',
                    description: 'Index of the next block to be mined',
                    example: 1
                  },
                  previousHash: {
                    type: 'string',
                    description: 'Hash of the previous block',
                    example: '00002d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d'
                  },
                  difficulty: {
                    type: 'number',
                    description: 'Current difficulty of the blockchain',
                    example: 2
                  },
                  maxDifficulty: {
                    type: 'number',
                    description: 'Maximum configured difficulty of the blockchain',
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
      summary: 'Add a mined block to the blockchain',
      description: 'Add a mined block to the blockchain',
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
                  description: 'Nonce found during mining',
                  example: 123456
                },
                miner: {
                  type: 'string',
                  description: 'Address of the miner',
                  example: '1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Block added successfully'
        },
        400: {
          description: 'Required parameters are missing',
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
          description: 'Invalid block validation',
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
  '/blocks/mine': {
    post: {
      summary: 'Mine a block',
      description: 'Mine the current protoBlock on the blockchain',
      tags: ['Blockchain'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['minerAddress'],
              properties: {
                minerAddress: {
                  type: 'string',
                  description: 'Address of the miner',
                  example: '1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Block mined successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nonce: {
                    type: 'number',
                    description: 'Nonce found during mining',
                    example: 123456
                  },
                  miner: {
                    type: 'string',
                    description: 'Address of the miner',
                    example: '1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Miner address is required',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Miner address is required'
                  }
                }
              }
            }
          }
        },
        422: {
          description: 'There is no protoBlock to mine on the blockchain',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'There is no protoBlock to mine on the blockchain'
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
      summary: 'Cresteate a new transaction',
      description: 'Add a new transaction to the mempool',
      tags: ['Transactions'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'Transaction data',
              properties: {
                type: {
                  type: 'number',
                  description: 'TransactionType.REGULAR = 1, TransactionType.FEE = 2',
                  example: 1
                },
                txInputs: {
                  type: 'object',
                  properties: {
                    fromAddress: {
                      type: 'string',
                      description: 'sender address',
                      example: '03ab48e01eda74405c5a1ea4d51ebf98f8f470a86e9d5e8bc38ff5ecd76fde3348'
                    },
                    amount: {
                      type: 'number',
                      description: 'Value for this transaction input',
                      example: 1
                    },
                    signature: {
                      type: 'string',
                      description: 'TransactionInput signature',
                      example: ''
                    }
                  }
                },
                txOutputs: {
                  type: 'object',
                  properties: {
                    toAddress: {
                      type: 'string',
                      description: 'recipient address',
                      example: '02bc56e01eda74405c5a1ea4d51ebf98f8f470a86e9d5e8bc38ff5ecd76fde3348'
                    },
                    amount: { 
                      type: 'number',
                      description: 'Value for this transaction output',
                      example: 1
                    }
                  }
                },
                timestamp: {
                  type: 'number',
                  description: 'Transaction timestamp',
                  example: 1696753200000
                },
                hash: {
                  type: 'string',
                  description: 'Transaction hash (optional)',
                  example: 'abc123def456'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Transaction created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    description: 'Confirmation message',
                    example: 'Transaction added successfully'
                  },
                  transaction: {
                    type: 'object',
                    description: 'Created transaction data',
                    properties: {
                      type: {
                        type: 'number',
                        description: 'TransactionType.REGULAR = 1, TransactionType.FEE = 2',
                        example: 1
                      },  
                      txInputs: {
                        type: 'object',
                        description: 'Transaction inputs',
                        properties: {
                          fromAddress: {
                            type: 'string',
                            description: 'sender address',
                            example: '03ab48e01eda74405c5a1ea4d51ebf98f8f470a86e9d5e8bc38ff5ecd76fde3348'
                          },
                          amount: {
                            type: 'number',
                            description: 'Value for this transaction input',
                            example: 1
                          },
                          signature: {
                            type: 'string',
                            description: 'TransactionInput signature',
                            example: ''
                          }
                        }
                      },
                      txOutputs: {
                        type: 'object',
                        description: 'Transaction outputs',
                        properties: {
                          toAddress: {
                            type: 'string',
                            description: 'recipient address',
                            example: '02bc56e01eda74405c5a1ea4d51ebf98f8f470a86e9d5e8bc38ff5ecd76fde3348'
                          },
                          amount: {
                            type: 'number',
                            description: 'Value for this transaction output',
                            example: 1
                          }
                        }
                      },
                      timestamp: {
                        type: 'number',
                        description: 'Transaction timestamp',
                        example: 1696753200000
                      },
                      hash: {
                        type: 'string',
                        description: 'Transaction hash',
                        example: 'tx_abc123def456'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Missing transaction data',
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
          description: 'Invalid transaction data',
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
      summary: 'List all transactions in the mempool',
      description: 'Returns all pending transactions in the mempool',
      tags: ['Transactions'],
      responses: {
        200: {
          description: 'List of transactions in the mempool',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                description: 'List of pending transactions in the mempool',
                items: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'number',
                      description: 'TransactionType.REGULAR = 1, TransactionType.FEE = 2',
                      example: 1
                    },
                    txIntputs: {
                      type: 'object',
                      description: 'Transaction inputs',
                      properties: {
                        fromAddress: {
                          type: 'string',
                          description: 'sender address',
                          example: '5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a'
                        },
                        amount: {
                          type: 'number',
                          description: 'Amount from the sender',
                          example: 5
                        },
                        signature: {
                          type: 'string',
                          description: 'Signature of the transaction input',
                          example: '8e8e8e8e8e8e8e88e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8'
                        }
                      }
                    },
                    txOutputs: {
                      type: 'object',
                      description: 'Transaction outputs',
                      properties: {
                        toAddress: {
                          type: 'string',
                          description: 'Receiver address',
                          example: '7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b'
                        },
                        amount: {
                          type: 'number',
                          description: 'Transaction amount',
                          example: 10
                        }
                      }
                    },
                    timestamp: {
                      type: 'number',
                      description: 'Transaction timestamp',
                      example: 1696753200000
                    },
                    hash: {
                      type: 'string',
                      description: 'Transaction hash',
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
      summary: 'Find a transaction by hash',
      description: 'Find a specific transaction by its hash',
      tags: ['Transactions'],
      parameters: [
        {
          name: 'hash',
          in: 'path',
          required: true,
          description: 'Transaction hash to search for',
          schema: {
            type: 'string',
            example: '3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c'
          }
        }
      ],
      responses: {
        200: {
          description: 'Transaction found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  mempoolIndex: {
                    type: 'number',
                    description: 'Index in the mempool (-1 if not in the mempool)',
                    example: -1
                  },
                  blockIndex: {
                    type: 'number',
                    description: 'Index of the block where the transaction is included (-1 if not included in any block)',
                    example: 5
                  },
                  transaction: {
                    type: 'object',
                    properties: {
                      type: {
                        type: 'number',
                        description: 'TransactionType.REGULAR = 1, TransactionType.FEE = 2',
                        example: 1
                      },
                      txInputs: {
                        type: 'object',
                        description: 'Transaction inputs',
                        properties: {
                          fromAddress: {
                            type: 'string',
                            description: 'sender address',
                            example: '1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a'
                          },
                          amount: {
                            type: 'number',
                            description: 'Value for this transaction input',
                            example: 10
                          },
                          signature: {
                            type: 'string',
                            description: 'TransactionInput signature',
                            example: '8e8e8e8e8e8e8e88e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8'
                          }
                        }
                      },
                      tsOutputs: {
                        type: 'object',
                        description: 'Transaction outputs',
                        properties: {
                          toAddress: {
                            type: 'string',
                            description: 'recipient address',
                            example: '2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f'
                          },
                          amount: {
                            type: 'number',
                            description: 'Value for this transaction output',
                            example: 10
                          },
                          tx: {
                            type: 'string',
                            description: 'Transaction hash this output belongs to',
                            example: '9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d'
                          }
                        }
                      },
                      timestamp: {
                        type: 'number',
                        description: 'Transaction timestamp',
                        example: 1696753200000
                      },
                      hash: {
                        type: 'string',
                        description: 'Transaction hash',
                        example: '9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d9d'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Hash is required',
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
          description: 'Transaction not found',
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
      summary: 'Sign a TransactionInput',
      description: 'Sign a TransactionInput',
      tags: ['Transactions'],
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
          description: 'TransactionInput successfully signed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { 
                    type: 'string',
                    description: 'Confirmation message',
                    example: 'TransactionInput signed successfully: '
                  },
                  transactionInput: {
                    type: 'object',
                    properties: {
                      fromAddress: { 
                        type: 'string',
                        description: 'sender address',
                        example: '1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d'
                      },
                      amount: { 
                        type: 'number',
                        description: 'amount to send',
                        example: 1
                      },
                      signature: { 
                        type: 'string',
                        description: 'digital signature',
                        example: '8e8e8e8e8e8e8e88e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Missing required data',
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
          description: 'TransactionInput validation error',
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
  },
  '/wallets/{address}': {
    get: {
      summary: 'Get wallet balance and UTXO',
      description: 'Retrieve the balance and unspent transaction outputs (UTXO) for a specific wallet address',
      tags: ['Wallets'],
      parameters: [
        {
          name: 'address',
          in: 'path',
          required: true,
          description: 'Wallet address to retrieve information for',
          schema: {
            type: 'string',
            example: '03ab48e01eda74405c5a1ea4d51ebf98f8f470a86e9d5e8bc38ff5ecd76fde3348'
          }
        }
      ],
      responses: {
        200: {
          description: 'Wallet balance and UTXO retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  balance: {
                    type: 'number',
                    description: 'Current balance of the wallet',
                    example: 100
                  },
                  feePerTX: {
                    type: 'number',
                    description: 'Transaction fee per transaction',
                    example: 1
                  },
                  utxo: {
                    type: 'array',
                    description: 'List of unspent transaction outputs',
                    items: {
                      type: 'object',
                      properties: {
                        toAddress: { type: 'string' },
                        amount: { type: 'number' },
                        tx: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid wallet address',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Invalid wallet address'
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
        description: 'Success',
        content: {
          'application/json': {
            schema: { type: 'object' }
          }
        }
      }
    }
  }
});