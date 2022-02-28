import { CfnOutput, Duration, aws_apigateway, aws_lambda, aws_cloudwatch } from 'aws-cdk-lib';
import { type Construct } from 'constructs';

type ApiGatewayProps = {
  apiStageName: string;
};

type AddLambdaIntegrationOptions = aws_apigateway.MethodOptions & {
  path: string;
  method: string;
  schema?: any;
};

export class ApiGateway extends aws_apigateway.RestApi {
  readonly requestValidator: aws_apigateway.RequestValidator;
  readonly defaultUsagePlan: aws_apigateway.UsagePlan;

  constructor(scope: Construct, id: string, props: ApiGatewayProps) {
    super(scope, id, {
      deployOptions: {
        stageName: props.apiStageName,
        metricsEnabled: true,
        tracingEnabled: true
      },
      // All methods will require api key authentication
      defaultMethodOptions: {
        apiKeyRequired: true
      }
    });

    // Add a request validator
    this.requestValidator = this.addRequestValidator('RequestValidator', {
      validateRequestBody: true,
      validateRequestParameters: true
    });

    // Add default usage plan for all clients
    this.defaultUsagePlan = new aws_apigateway.UsagePlan(this, 'DefaultUsagePlan', {
      name: 'Default',
      throttle: {
        rateLimit: 10,
        burstLimit: 2
      },
      quota: {
        limit: 1_000,
        period: aws_apigateway.Period.DAY
      }
    });

    this.defaultUsagePlan.addApiStage({
      stage: this.deploymentStage
    });
  }

  apiKeyForClient = (clientName: string) => {
    const apiKey = this.addApiKey(`${clientName}ApiKey`);
    this.defaultUsagePlan.addApiKey(apiKey);
    new CfnOutput(this, `${clientName}ApiKeyId`, { value: apiKey.keyId });
  };

  addLambdaIntegration = (
    lambda: aws_lambda.Function,
    { path, method, schema, ...methodOptions }: AddLambdaIntegrationOptions
  ): aws_apigateway.Method => {
    // Create the Lambda <> API GW integration
    const lambdaIntegration = new aws_apigateway.LambdaIntegration(lambda);

    // Configure default options
    const defaultMethodOptions: aws_apigateway.MethodOptions = {
      requestValidator: this.requestValidator
    };

    // Add request model configuration to method options if schema is provided
    if (schema) {
      const model = new aws_apigateway.Model(this, 'RequestModel' + lambda.node.id, {
        restApi: this,
        contentType: 'application/json',
        schema
      });

      Object.assign(defaultMethodOptions, {
        requestModels: {
          'application/json': model
        }
      });
    }

    // Get or create the resource up to the path
    const resource = this.root.resourceForPath(path);

    // Link the method with the lambda integration and the merged method options
    return resource.addMethod(method, lambdaIntegration, {
      ...defaultMethodOptions,
      ...methodOptions
    });
  };

  monitor = (): Array<aws_cloudwatch.Alarm> => {
    const alarms: Array<aws_cloudwatch.Alarm> = [];

    alarms.push(
      this.metricClientError()
        .with({
          period: Duration.minutes(1)
        })
        .createAlarm(this, 'ClientErrorAlarm', {
          evaluationPeriods: 3,
          threshold: 3,
          alarmDescription: 'Over 3 client errors per 1 minute (3 consecutive periods)'
        })
    );

    alarms.push(
      this.metricCount()
        .with({
          period: Duration.minutes(1)
        })
        .createAlarm(this, 'CountAlarm', {
          evaluationPeriods: 3,
          threshold: 100,
          alarmDescription: 'Over 100 requests per 1 minute'
        })
    );

    return alarms;
  };
}
