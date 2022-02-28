import { Stack, type StackProps } from 'aws-cdk-lib';
import { type Construct } from 'constructs';

import { ApiGateway } from '@constructs/apiGateway';
import { Table } from '@constructs/table';
import { CreateAccountFunction } from '@constructs/functions/createAccount';
import { TransferFundsFunction } from '@constructs/functions/transferFunds';
import { Waf } from '@constructs/waf';

type LedgerStackProps = StackProps & {
  apiStageName: string;
};

export class LedgerStack extends Stack {
  constructor(scope: Construct, id: string, props: LedgerStackProps) {
    const { apiStageName, ...stackProps } = props;

    super(scope, id, {
      description: 'Contains all Ledger application resources',
      ...stackProps
    });

    const table = new Table(this, 'Table');
    const apiGateway = new ApiGateway(this, 'ApiGateway', { apiStageName });
    apiGateway.monitor();
    apiGateway.apiKeyForClient('TestClient');
    new CreateAccountFunction(this, 'CreateAccountFunction', { table, apiGateway });
    new TransferFundsFunction(this, 'TransferFundsFunction', { table, apiGateway });
    const waf = new Waf(this, 'Waf');
    waf.associateRestApi(apiGateway);
  }
}
