import { join } from 'path';

import { schema } from './schema';

export default {
  entry: join(__dirname, 'handler.ts'),
  path: '/transfers',
  method: 'POST',
  schema
};
