// Task 4.6: Reset Password (2-step process)
const {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
const { REGION, CLIENT_ID } = require("./config");

const client = new CognitoIdentityProviderClient({ region: REGION });

// Step 1: Request password reset code
async function forgotPassword(email) {
  const params = { ClientId: CLIENT_ID, Username: email };
  await client.send(new ForgotPasswordCommand(params));
  console.log("Password reset code sent to:", email);
  console.log("Check your email for the 6-digit code.");
}

// Step 2: Confirm new password with code
async function confirmResetPassword(email, code, newPassword) {
  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    Password: newPassword,
  };
  await client.send(new ConfirmForgotPasswordCommand(params));
  console.log("Password reset successful!");
  console.log("You can now sign in with the new password.");
}

// Run:
//   Step 1: node cognito/resetPassword.js forgot <email>
//   Step 2: node cognito/resetPassword.js confirm <email> <code> <new-password>
const args = process.argv.slice(2);
if (args[0] === "forgot" && args[1]) {
  forgotPassword(args[1]).catch(console.error);
} else if (args[0] === "confirm" && args.length >= 4) {
  confirmResetPassword(args[1], args[2], args[3]).catch(console.error);
} else {
  console.log("Usage:");
  console.log("  Step 1: node cognito/resetPassword.js forgot <email>");
  console.log("  Step 2: node cognito/resetPassword.js confirm <email> <code> <new-password>");
}
