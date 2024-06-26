import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';

export class XmlWriterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const xmlFunction = new NodejsFunction(this, 'function', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      memorySize: 2024,
      timeout: cdk.Duration.minutes(2),
      bundling: {
        nodeModules: ['xml-js', 'aws-sdk']
      },
      environment: {
        TARGET_BUCKET_NAME: 'TARGET_BUCKET_NAME',
        TARGET_PREFIX: 'xml/'
      }
    });

    // Add AWS managed policy to xmlFunction
    xmlFunction.role?.addManagedPolicy(
      cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonS3FullAccess'
      ))
  }
}
