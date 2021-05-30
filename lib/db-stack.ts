import * as cdk from '@aws-cdk/core';

import * as dynamodb from '@aws-cdk/aws-dynamodb';

export class DbStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDb 
    const table = new dynamodb.Table(this, 'Table', {
      tableName: 'Table',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }
    });

  }
}
