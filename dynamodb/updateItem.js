// Task 3.6: UpdateItem
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "NoteStack-Notes-SDLC";

async function updateItem(userId, noteId, newTitle, newContent) {
  const params = {
    TableName: TABLE_NAME,
    Key: { userId, noteId },
    UpdateExpression: "SET title = :t, content = :c, updatedAt = :time",
    ExpressionAttributeValues: {
      ":t": newTitle,
      ":c": newContent,
      ":time": new Date().toISOString(),
    },
    ReturnValues: "ALL_NEW",
  };

  const result = await docClient.send(new UpdateCommand(params));
  console.log("Item updated successfully!");
  console.log(JSON.stringify(result.Attributes, null, 2));
  return result.Attributes;
}

// Run: node dynamodb/updateItem.js <userId> <noteId> <newTitle> <newContent>
const args = process.argv.slice(2);
if (args.length < 4) {
  console.log("Usage: node dynamodb/updateItem.js <userId> <noteId> <newTitle> <newContent>");
  process.exit(1);
}
updateItem(args[0], args[1], args[2], args[3]).catch(console.error);
