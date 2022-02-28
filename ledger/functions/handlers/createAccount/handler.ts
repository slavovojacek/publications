import { ddb } from '@lambda-libs/aws';
import { generateId } from '@lambda-libs/id';
import * as lambda from '@lambda-libs/lambda';

import { type Schema } from './schema';

const tableName = lambda.getEnv('TABLE_NAME').required().asString();

const lambdaHandler: lambda.ValidatedAPIGatewayProxyEventHandler<Schema> = async (event) => {
  const {
    body: { name, denomination }
  } = event;

  const accountId = 'acct_' + generateId();

  await ddb
    .put({
      TableName: tableName,
      Item: {
        pk: `Account#${accountId}`,
        sk: `Account#${accountId}`,
        type: 'Account',
        insertedAt: Date.now(),
        name,
        denomination
      }
    })
    .promise();

  return lambda.formatJSONResponse({ id: accountId }, 201);
};

export const handler = lambda.middify(lambdaHandler);
