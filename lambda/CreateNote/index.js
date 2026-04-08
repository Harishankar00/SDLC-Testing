// Task 5.2: CreateNote Lambda Function
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "NoteStack-Notes-SDLC";

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userId = event.requestContext?.authorizer?.claims?.sub || body.userId;
    const { title, content } = body;

    if (!userId || !title || !content) {
      return respond(400, { error: "Missing required fields: userId, title, content" });
    }

    const noteId = "note-" + Date.now();
    const item = {
      userId,
      noteId,
      title,
      content,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

    return respond(201, { message: "Note created", note: item });
  } catch (err) {
    console.error("CreateNote error:", err);
    return respond(500, { error: "Could not create note" });
  }
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}
