import * as cdk from '@aws-cdk/core';
import * as ecr from '@aws-cdk/aws-ecr';

export class EcrRepositoryStack extends cdk.Stack {

  public ecr_repository: ecr.Repository;
  
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
      this.ecr_repository = new ecr.Repository(this, 'EcrRepository');
  }
}
