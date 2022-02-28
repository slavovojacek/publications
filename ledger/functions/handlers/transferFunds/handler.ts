import { ddb } from '@lambda-libs/aws';
import { generateId } from '@lambda-libs/id';
import * as lambda from '@lambda-libs/lambda';

import { type DocumentClient } from 'aws-sdk/clients/dynamodb';

import { type Schema } from './schema';

const tableName = lambda.getEnv('TABLE_NAME').required().asString();

export const handler: lambda.ValidatedAPIGatewayProxyEventHandler<Schema> = lambda.middify(
  async (event) => {
    const {
      body: { debtorAccountId, creditorAccountId, amount, denomination }
    } = event;

    // Create two transactions so that individual account holders can view the full history of credits and debits
    const debitTransaction = transactionPut(debtorAccountId, amount, denomination);
    const creditTransaction = transactionPut(creditorAccountId, amount, denomination, true);

    const debtorAccountUpdate: DocumentClient.Update = {
      TableName: tableName,
      Key: {
        pk: `Account#${debtorAccountId}`,
        sk: `Account#${debtorAccountId}`
      },
      // Perform balance update in form of deduction
      UpdateExpression: 'SET #balance = #balance - :amount',
      // Perform balance check and denomination equality check
      ConditionExpression: '#balance > :amount AND #denomination = :denomination',
      ExpressionAttributeNames: {
        '#balance': 'balance',
        '#denomination': 'denomination'
      },
      ExpressionAttributeValues: {
        ':amount': amount,
        ':denomination': denomination
      }
    };

    const creditorAccountUpdate: DocumentClient.Update = {
      TableName: tableName,
      Key: {
        pk: `Account#${creditorAccountId}`,
        sk: `Account#${creditorAccountId}`
      },
      // Perform balance update in form of credit
      UpdateExpression: 'SET #balance = #balance + :amount',
      // Perform denomination equality check
      ConditionExpression: '#denomination = :denomination',
      // These properties are the same as those used in debtor account update
      ExpressionAttributeNames: debtorAccountUpdate.ExpressionAttributeNames,
      ExpressionAttributeValues: debtorAccountUpdate.ExpressionAttributeValues
    };

    await ddb
      // DynamoDB will fail the entire transaction if one of these items fails
      .transactWrite({
        TransactItems: [
          { Put: debitTransaction.input },
          { Update: debtorAccountUpdate },
          { Put: creditTransaction.input },
          { Update: creditorAccountUpdate }
        ]
      })
      .promise();

    return lambda.formatJSONResponse(
      {
        transactions: [
          { id: debitTransaction.id, credit: false },
          { id: creditTransaction.id, credit: true }
        ]
      },
      201
    );
  }
);

const transactionPut = (
  accountId: string,
  amount: number,
  denomination: string,
  credit = false
) => {
  const id = 'tx_' + generateId();

  const input: DocumentClient.PutItemInput = {
    TableName: tableName,
    Item: {
      pk: `Account#${accountId}`,
      sk: `Transaction#${id}`,
      type: 'Transaction',
      insertedAt: Date.now(),
      amount,
      denomination,
      credit
    }
  };

  return { id, input };
};
