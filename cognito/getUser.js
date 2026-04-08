// Task 4.5: Get user info using Access Token
const { CognitoIdentityProviderClient, GetUserCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { REGION } = require("./config");

const client = new CognitoIdentityProviderClient({ region: REGION });

async function getUser(accessToken) {
  const params = {
    AccessToken: accessToken,
  };

  const result = await client.send(new GetUserCommand(params));

  console.log("User info:");
  console.log("  Username:", result.Username);
  result.UserAttributes.forEach((attr) => {
    console.log(`  ${attr.Name}: ${attr.Value}`);
  });
  return result;
}

// Run: node cognito/getUser.js <access-token>
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log("Usage: node cognito/getUser.js <access-token>");
  process.exit(1);
}
getUser(args[0]).catch(console.error);
