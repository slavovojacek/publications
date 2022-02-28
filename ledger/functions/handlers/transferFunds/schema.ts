export const schema = {
  type: 'object',
  properties: {
    debtorAccountId: { type: 'string', minLength: 8, maxLength: 128 },
    creditorAccountId: { type: 'string', minLength: 8, maxLength: 128 },
    amount: { type: 'number' },
    denomination: { type: 'string', minLength: 2, maxLength: 5 }
  },
  required: ['debtorAccountId', 'creditorAccountId', 'amount', 'denomination'],
  additionalProperties: false
};

export type Schema = {
  debtorAccountId: string;
  creditorAccountId: string;
  amount: number;
  denomination: string;
};
