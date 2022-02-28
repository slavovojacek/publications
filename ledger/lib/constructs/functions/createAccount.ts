import { aws_lambda_nodejs } from 'aws-cdk-lib';
import { type Construct } from 'constructs';

import { type ApiGateway } from '@constructs/apiGateway';
import { type Table } from '@constructs/table';

import createAccount from '@lambda-handlers/createAccount';

import { nodejsFunctionProps } from './base';

type CreateAccountFunctionProps = {
  apiGateway: ApiGateway;
  table: Table;
};

export class CreateAccountFunction extends aws_lambda_nodejs.NodejsFunction {
  constructor(scope: Construct, id: string, props: CreateAccountFunctionProps) {
    const { entry, ...apiGatewayIntegrationOptions } = createAccount;

    super(scope, id, {
      ...nodejsFunctionProps,
      entry,
      environment: {
        TABLE_NAME: props.table.tableName
      }
    });

    // Grant the required DynamoDB permissions to the function
    props.table.grantWriteData(this);
    // Create the API integration for the function
    props.apiGateway.addLambdaIntegration(this, apiGatewayIntegrationOptions);
  }
}
