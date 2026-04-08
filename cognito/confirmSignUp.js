// Task 4.3: Verify email with confirmation code
const { CognitoIdentityProviderClient, ConfirmSignUpCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { REGION, CLIENT_ID } = require("./config");

const client = new CognitoIdentityProviderClient({ region: REGION });

async function confirmSignUp(email, code) {
  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  };

  await client.send(new ConfirmSignUpCommand(params));
  console.log("Email verified successfully!");
  console.log("  User status: CONFIRMED");
  console.log("  You can now sign in.");
}

// Run: node cognito/confirmSignUp.js <email> <6-digit-code>
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: node cognito/confirmSignUp.js <email> <6-digit-code>");
  process.exit(1);
}
confirmSignUp(args[0], args[1]).catch(console.error);
