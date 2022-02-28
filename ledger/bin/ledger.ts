#!/usr/bin/env node

import 'source-map-support/register';
import { App } from 'aws-cdk-lib';

import { LedgerStack } from 'lib/ledgerStack';

const app = new App();

new LedgerStack(app, 'dev', {
  env: {
    account: '', // replace with your AWS Account ID or use process.env
    region: 'eu-west-2'
  },
  apiStageName: 'dev'
});
