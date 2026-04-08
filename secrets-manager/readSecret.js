// Task 7.2: Read a secret from Secrets Manager
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({ region: "ap-south-1" });

const SECRET_NAME = "notestack/config-sdlc";

async function readSecret() {
  const result = await client.send(
    new GetSecretValueCommand({ SecretId: SECRET_NAME })
  );

  const secrets = JSON.parse(result.SecretString);

  console.log("Secret retrieved successfully!");
  console.log("  Name:", result.Name);
  console.log("  Version:", result.VersionId);
  console.log("  Values:");
  console.log("    NOTIFICATION_API_KEY:", secrets.NOTIFICATION_API_KEY);
  console.log("    APP_SECRET:", secrets.APP_SECRET);
  console.log("    ALLOWED_FILE_TYPES:", secrets.ALLOWED_FILE_TYPES);

  return secrets;
}

readSecret().catch(console.error);
