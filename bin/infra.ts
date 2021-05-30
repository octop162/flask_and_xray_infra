#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EcsStack } from '../lib/ecs-stack';
import { EcrRepositoryStack } from '../lib/ecr-repository-stack';
import { CodeStack } from '../lib/code-stack';
import { DbStack } from '../lib/db-stack';
import { AWS_ACCOUNT_ID, AWS_DEFAULT_REGION } from '../lib/constants';

const app = new cdk.App();

const db_stack = new DbStack(app, 'DbStack', {
  env: {
    'region': AWS_DEFAULT_REGION,
    'account': AWS_ACCOUNT_ID
  }
});

const ecr_repository_stack = new EcrRepositoryStack(app, 'EcrRepositoryStack', {
  env: {
    'region': AWS_DEFAULT_REGION,
    'account': AWS_ACCOUNT_ID
  }
});

const ecs_stack = new EcsStack(app, 'EcsStack',
  ecr_repository_stack.ecr_repository,
  {
    env: {
      'region': AWS_DEFAULT_REGION,
      'account': AWS_ACCOUNT_ID
    }
  });

const code_stack = new CodeStack(app, 'CodeStack',
  ecr_repository_stack.ecr_repository,
  ecs_stack.ecsService,
  {
    env: {
      'region': AWS_DEFAULT_REGION,
      'account': AWS_ACCOUNT_ID
    }
  });