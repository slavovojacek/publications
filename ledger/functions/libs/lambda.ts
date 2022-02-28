import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import { type APIGatewayProxyEvent, type APIGatewayProxyResult, type Handler } from 'aws-lambda';

export type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & {
  rawBody: string;
  body: S;
};

export type ValidatedAPIGatewayProxyEventHandler<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;

export const middify = <S>(handler: ValidatedAPIGatewayProxyEventHandler<S>) =>
  middy(handler).use(httpHeaderNormalizer()).use(jsonBodyParser());

export const formatJSONResponse = (response: Record<string, unknown>, statusCode = 200) => {
  return {
    statusCode,
    body: JSON.stringify(response)
  };
};

export { get as getEnv } from 'env-var';
