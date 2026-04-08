// Task 3.5: Query (Read all notes for a user)
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "NoteStack-Notes-SDLC";

async function queryByUser(userId) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: { ":uid": userId },
  };

  const result = await docClient.send(new QueryCommand(params));

  console.log(`Notes for user "${userId}":`);
  console.log(`Total: ${result.Count}`);
  result.Items.forEach((item) => {
    console.log(`  [${item.noteId}] ${item.title} - ${item.createdAt}`);
  });
  return result.Items;
}

// Run: node dynamodb/query.js <userId>
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log("Usage: node dynamodb/query.js <userId>");
  process.exit(1);
}
queryByUser(args[0]).catch(console.error);
