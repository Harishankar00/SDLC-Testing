// Task 4.2: Sign Up a new user
const { CognitoIdentityProviderClient, SignUpCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { REGION, CLIENT_ID } = require("./config");

const client = new CognitoIdentityProviderClient({ region: REGION });

async function signUp(email, password, name) {
  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name", Value: name },
    ],
  };

  const result = await client.send(new SignUpCommand(params));
  console.log("Sign up successful!");
  console.log("  User confirmed:", result.UserConfirmed);
  console.log("  User sub:", result.UserSub);
  console.log("  Check your email for the verification code.");
  return result;
}

// Run: node cognito/signUp.js <email> <password> <name>
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log("Usage: node cognito/signUp.js <email> <password> <name>");
  console.log('Example: node cognito/signUp.js test@example.com "MyPass@123" "John Doe"');
  process.exit(1);
}
signUp(args[0], args[1], args[2]).catch(console.error);
