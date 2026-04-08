// Task 4.7: Decode a JWT token (ID Token)
// JWT has 3 parts separated by dots: header.payload.signature
// The payload (middle part) contains user info

function decodeToken(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    console.log("Invalid JWT token — expected 3 parts separated by dots.");
    process.exit(1);
  }

  const payload = JSON.parse(
    Buffer.from(parts[1], "base64").toString("utf-8")
  );

  console.log("Decoded JWT Payload:");
  console.log(JSON.stringify(payload, null, 2));
  console.log("");
  console.log("Key fields:");
  console.log("  sub (userId for DynamoDB):", payload.sub);
  console.log("  email:", payload.email);
  console.log("  name:", payload.name);
  console.log("  token_use:", payload.token_use);
  console.log("  issued at:", new Date(payload.iat * 1000).toISOString());
  console.log("  expires at:", new Date(payload.exp * 1000).toISOString());

  return payload;
}

// Run: node cognito/decodeToken.js <jwt-token>
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log("Usage: node cognito/decodeToken.js <jwt-token>");
  process.exit(1);
}
decodeToken(args[0]);
