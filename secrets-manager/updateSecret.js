// Task 7.5: Update a secret value
// IMPORTANT: Include ALL key-value pairs, not just the changed one
const { SecretsManagerClient, GetSecretValueCommand, UpdateSecretCommand } = require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({ region: "ap-south-1" });

const SECRET_NAME = "notestack/config-sdlc";

async function updateSecret(key, newValue) {
  // First read all existing values
  const result = await client.send(
    new GetSecretValueCommand({ SecretId: SECRET_NAME })
  );
  const secrets = JSON.parse(result.SecretString);

  // Update the specific key
  const oldValue = secrets[key];
  secrets[key] = newValue;

  // Write back ALL values
  await client.send(
    new UpdateSecretCommand({
      SecretId: SECRET_NAME,
      SecretString: JSON.stringify(secrets),
    })
  );

  console.log("Secret updated successfully!");
  console.log(`  ${key}: "${oldValue}" -> "${newValue}"`);
}

// Run: node secrets-manager/updateSecret.js <key> <new-value>
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: node secrets-manager/updateSecret.js <key> <new-value>");
  console.log("Example: node secrets-manager/updateSecret.js ALLOWED_FILE_TYPES pdf,jpg,png,docx,txt");
  process.exit(1);
}
updateSecret(args[0], args[1]).catch(console.error);
