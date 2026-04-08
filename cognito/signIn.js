// Task 4.4: Sign In and get tokens
const { CognitoIdentityProviderClient, InitiateAuthCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { REGION, CLIENT_ID } = require("./config");

const client = new CognitoIdentityProviderClient({ region: REGION });

async function signIn(email, password) {
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  const result = await client.send(new InitiateAuthCommand(params));
  const tokens = result.AuthenticationResult;

  console.log("Sign in successful!");
  console.log("");
  console.log("ID Token (first 50 chars):", tokens.IdToken.substring(0, 50) + "...");
  console.log("Access Token (first 50 chars):", tokens.AccessToken.substring(0, 50) + "...");
  console.log("Refresh Token (first 50 chars):", tokens.RefreshToken.substring(0, 50) + "...");
  console.log("Expires in:", tokens.ExpiresIn, "seconds");

  // Save full ID token for use in API Gateway testing
  console.log("");
  console.log("=== FULL ID TOKEN (use this for API Gateway) ===");
  console.log(tokens.IdToken);

  return tokens;
}

// Run: node cognito/signIn.js <email> <password>
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: node cognito/signIn.js <email> <password>");
  process.exit(1);
}
signIn(args[0], args[1]).catch(console.error);
