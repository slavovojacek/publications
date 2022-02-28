export const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 128 },
    denomination: { type: 'string', minLength: 2, maxLength: 5 }
  },
  required: ['name', 'denomination'],
  additionalProperties: false
};

export type Schema = { name: string; denomination: string };
