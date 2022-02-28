import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { captureAWSClient } from 'aws-xray-sdk-core';

export const ddb = new DocumentClient();
captureAWSClient((ddb as any).service);
