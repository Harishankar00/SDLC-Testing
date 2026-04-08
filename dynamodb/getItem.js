// Task 3.4: GetItem (Read one note)
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "NoteStack-Notes-SDLC";

async function getItem(userId, noteId) {
  const params = {
    TableName: TABLE_NAME,
    Key: { userId, noteId },
  };

  const result = await docClient.send(new GetCommand(params));

  if (result.Item) {
    console.log("Item found:");
    console.log(JSON.stringify(result.Item, null, 2));
  } else {
    console.log("Item not found.");
  }
  return result.Item;
}

// Run: node dynamodb/getItem.js <userId> <noteId>
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: node dynamodb/getItem.js <userId> <noteId>");
  process.exit(1);
}
getItem(args[0], args[1]).catch(console.error);
