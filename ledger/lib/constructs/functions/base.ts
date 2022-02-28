import { Duration, aws_lambda, type aws_lambda_nodejs, aws_logs } from 'aws-cdk-lib';
import { get } from 'env-var';
import { join } from 'path';

const nodePath = get('NODE_PATH').required().asString();

export const nodejsFunctionProps: aws_lambda_nodejs.NodejsFunctionProps = {
  // See https://docs.aws.amazon.com/lambda/latest/dg/foundation-arch.html#foundation-arch-adv
  architecture: aws_lambda.Architecture.ARM_64,
  memorySize: 1024,
  // Enable active tracing with X-Ray
  tracing: aws_lambda.Tracing.ACTIVE,
  timeout: Duration.seconds(5),
  // Hard limit for scaling in case of traffic spikes (demonstration only)
  reservedConcurrentExecutions: 2,
  logRetention: aws_logs.RetentionDays.ONE_WEEK,
  insightsVersion: aws_lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
  depsLockFilePath: join(nodePath, 'functions/package-lock.json'),
  bundling: {
    externalModules: [
      'aws-sdk' // Use the 'aws-sdk' available in the Lambda runtime
    ]
  }
};
