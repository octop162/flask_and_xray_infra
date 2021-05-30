import * as cdk from '@aws-cdk/core';
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecr from '@aws-cdk/aws-ecr';
import * as iam from '@aws-cdk/aws-iam';
import * as logs from '@aws-cdk/aws-logs';

export class EcsStack extends cdk.Stack {

  public ecsService : ecs_patterns.ApplicationLoadBalancedFargateService;
  
  constructor(scope: cdk.Construct, id: string, repository: ecr.Repository ,props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an VPC
    const vpc = new ec2.Vpc(this, 'VPC', {
      cidr: "10.0.0.0/16",
    })

    // Create an ECS cluster
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
    });

    // Task
    const logGroup = new logs.LogGroup(this, 'ServiceLogGroup');
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
    });
    // App
    const defaultContainer = taskDefinition.addContainer('DefaultContainer', {
      containerName: "default",
      image: ecs.ContainerImage.fromEcrRepository(repository),
      memoryLimitMiB: 256,
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: 'DefaultContainer',
        logGroup,
      }),
    })
    defaultContainer.addPortMappings({
      containerPort: 5000,
      hostPort: 5000,
      protocol: ecs.Protocol.TCP,
    });
    // X-Ray
    const xrayContainer = taskDefinition.addContainer('X-RayContainer', {
      containerName: "xray",
      image: ecs.ContainerImage.fromRegistry('amazon/aws-xray-daemon'),
      memoryLimitMiB: 256,
    })
    xrayContainer.addPortMappings({
      containerPort: 2000,
      hostPort: 2000,
      protocol: ecs.Protocol.UDP,
    })
    xrayContainer.addPortMappings({
      containerPort: 2000,
      hostPort: 2000,
      protocol: ecs.Protocol.TCP,
    })

    // IAM Role 
    const taskRole = new iam.PolicyStatement({
      resources: ['*'],
      actions: [
        "dynamodb:BatchGet*",
        "dynamodb:DescribeStream",
        "dynamodb:DescribeTable",
        "dynamodb:Get*",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchWrite*",
        "dynamodb:CreateTable",
        "dynamodb:Delete*",
        "dynamodb:Update*",
        "dynamodb:PutItem",
        "xray:*",
      ]});
    taskDefinition.addToTaskRolePolicy(taskRole);


    // Instantiate an Amazon ECS Service
    const ecsService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'FargateService', {
      cluster,
      taskDefinition,
    });
    this.ecsService = ecsService;

  }
}