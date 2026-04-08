// Task 3.3: PutItem (Create a note)
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "NoteStack-Notes-SDLC";

async function putItem(userId, noteId, title, content) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      userId,
      noteId,
      title,
      content,
      createdAt: new Date().toISOString(),
    },
  };

  await docClient.send(new PutCommand(params));
  console.log("Item created successfully!");
  console.log("  userId:", userId);
  console.log("  noteId:", noteId);
  console.log("  title:", title);
}

// Run: node dynamodb/putItem.js <userId> <noteId> <title> <content>
const args = process.argv.slice(2);
if (args.length < 4) {
  console.log("Usage: node dynamodb/putItem.js <userId> <noteId> <title> <content>");
  console.log('Example: node dynamodb/putItem.js user-123 note-001 "Lecture Notes" "Today we learned..."');
  process.exit(1);
}
putItem(args[0], args[1], args[2], args[3]).catch(console.error);
