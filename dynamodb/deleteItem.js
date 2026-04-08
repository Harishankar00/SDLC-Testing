// Task 3.7: DeleteItem
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "NoteStack-Notes-SDLC";

async function deleteItem(userId, noteId) {
  const params = {
    TableName: TABLE_NAME,
    Key: { userId, noteId },
    ReturnValues: "ALL_OLD",
  };

  const result = await docClient.send(new DeleteCommand(params));

  if (result.Attributes) {
    console.log("Item deleted successfully!");
    console.log("Deleted item:", JSON.stringify(result.Attributes, null, 2));
  } else {
    console.log("Item did not exist (no error — DynamoDB delete is idempotent).");
  }
  return result.Attributes;
}

// Run: node dynamodb/deleteItem.js <userId> <noteId>
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: node dynamodb/deleteItem.js <userId> <noteId>");
  process.exit(1);
}
deleteItem(args[0], args[1]).catch(console.error);
