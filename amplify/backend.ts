import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { AwsCustomResource, PhysicalResourceId } from "aws-cdk-lib/custom-resources";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

const backend = defineBackend({
  auth,
  data,
});

// Disable self-registration — users are created manually in Cognito Console
const { cfnUserPool } = backend.auth.resources.cfnResources;
cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};

// Override: use username-based sign-in instead of email
// (Amplify sets UsernameAttributes: ['email'] by default — remove it)
cfnUserPool.addPropertyDeletionOverride("UsernameAttributes");

// Sandbox-only: relaxed password policy and seed user
const isSandbox = !process.env.AWS_BRANCH;

if (isSandbox) {
  cfnUserPool.policies = {
    passwordPolicy: {
      minimumLength: 6,
      requireLowercase: false,
      requireUppercase: false,
      requireNumbers: false,
      requireSymbols: false,
    },
  };

  const userPool = backend.auth.resources.userPool;
  const authStack = userPool.stack;

  const seedUser = new AwsCustomResource(authStack, "SeedUser", {
    onCreate: {
      service: "CognitoIdentityServiceProvider",
      action: "adminCreateUser",
      parameters: {
        UserPoolId: userPool.userPoolId,
        Username: "zoli",
        TemporaryPassword: "test11",
        MessageAction: "SUPPRESS",
        UserAttributes: [
          { Name: "email", Value: "zoli@example.com" },
          { Name: "email_verified", Value: "true" },
        ],
      },
      physicalResourceId: PhysicalResourceId.of("seed-user-zoli"),
    },
    onDelete: {
      service: "CognitoIdentityServiceProvider",
      action: "adminDeleteUser",
      parameters: {
        UserPoolId: userPool.userPoolId,
        Username: "zoli",
      },
    },
    policy: {
      statements: [
        new PolicyStatement({
          actions: ["cognito-idp:AdminCreateUser", "cognito-idp:AdminDeleteUser", "cognito-idp:AdminSetUserPassword"],
          resources: [userPool.userPoolArn],
        }),
      ],
    },
  });

  // Set the permanent password (so user doesn't need to change it on first login)
  new AwsCustomResource(authStack, "SeedUserPassword", {
    onCreate: {
      service: "CognitoIdentityServiceProvider",
      action: "adminSetUserPassword",
      parameters: {
        UserPoolId: userPool.userPoolId,
        Username: "zoli",
        Password: "test11",
        Permanent: true,
      },
      physicalResourceId: PhysicalResourceId.of("seed-user-zoli-password"),
    },
    policy: {
      statements: [
        new PolicyStatement({
          actions: ["cognito-idp:AdminSetUserPassword"],
          resources: [userPool.userPoolArn],
        }),
      ],
    },
  }).node.addDependency(seedUser);
}
