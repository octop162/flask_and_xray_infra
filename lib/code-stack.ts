import * as cdk from '@aws-cdk/core';
import * as ecr from '@aws-cdk/aws-ecr';
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';
import * as ecs from '@aws-cdk/aws-ecs';

import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codecommit from '@aws-cdk/aws-codecommit';
import * as iam from '@aws-cdk/aws-iam';

import { AWS_DEFAULT_REGION, AWS_ACCOUNT_ID } from './constants';
import * as codedeploy from '@aws-cdk/aws-codedeploy';

export class CodeStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string,
    ecr_repository: ecr.Repository,
    ecs_service: ecs_patterns.ApplicationLoadBalancedFargateService, props?: cdk.StackProps) {
    super(scope, id, props);

    // Project
    const project = new codebuild.PipelineProject(this, 'CodeBuildProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        privileged: true,
      },
      environmentVariables: {
        AWS_DEFAULT_REGION: { value: AWS_DEFAULT_REGION },
        AWS_ACCOUNT_ID: { value: AWS_ACCOUNT_ID },
        IMAGE_REPO_NAME: { value: ecr_repository.repositoryName },
        IMAGE_TAG: { value: "latest" },
      },
    });

    // Output
    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    // IAM Role 
    const role = new iam.PolicyStatement({
      resources: ['*'],
      actions: [
        "ecr:BatchCheckLayerAvailability",
        "ecr:CompleteLayerUpload",
        "ecr:GetAuthorizationToken",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart"
      ]
    });
    project.addToRolePolicy(role);

    // Code Commit
    const repository = new codecommit.Repository(this, 'Repository', {
      repositoryName: 'AppRepository',
      description: 'Application Repository.'
    });

    // Source Action 
    const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: "CodeCommit",
      repository: repository,
      branch: 'develop',
      output: sourceOutput,
    })

    // Code Build Action
    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild',
      project,
      input: sourceOutput,
      outputs: [buildOutput]
    });


    // const ecsApplication = new codedeploy.EcsApplication(this, "EcsApplication", {
    //   applicationName:  ecs_service.service.serviceName
    // })
    // const deploymentGroup = codedeploy.EcsDeploymentGroup.fromEcsDeploymentGroupAttributes(this, "EcsDeploymentGroup", {
    //   application: ecsApplication,
    //   deploymentGroupName: "EcsDeploymentGroup",
    // });
    // const deployAction = new codepipeline_actions.CodeDeployEcsDeployAction({
    //   actionName: "DeployAction",
    //   deploymentGroup: deploymentGroup,
    //   appSpecTemplateInput: buildOutput,
    //   taskDefinitionTemplateInput:buildOutput,
    // })


    // Code PipeLine
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: "pipeline",
      stages: [
        {
          stageName: 'Source',
          actions: [
            sourceAction
          ],
        },
        {
          stageName: 'Build',
          actions: [
            buildAction
          ],
        },
        // {
        //   stageName: 'Deploy',
        //   actions: [
        //     deployAction
        //   ],
        // },
      ]
    })
  }
}
