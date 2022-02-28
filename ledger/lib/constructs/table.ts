import { RemovalPolicy, aws_dynamodb } from 'aws-cdk-lib';
import { type Construct } from 'constructs';

export class Table extends aws_dynamodb.Table {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      partitionKey: { name: 'pk', type: aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: aws_dynamodb.AttributeType.STRING },
      encryption: aws_dynamodb.TableEncryption.AWS_MANAGED,
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      // Only in dev
      removalPolicy: RemovalPolicy.DESTROY
    });
  }
}
