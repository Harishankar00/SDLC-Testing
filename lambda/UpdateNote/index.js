// Task 5.5: UpdateNote Lambda Function
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "NoteStack-Notes-SDLC";

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userId = event.requestContext?.authorizer?.claims?.sub || body.userId;
    const { noteId, title, content } = body;

    if (!userId || !noteId || !title || !content) {
      return respond(400, { error: "Missing required fields: userId, noteId, title, content" });
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { userId, noteId },
        UpdateExpression: "SET title = :t, content = :c, updatedAt = :time",
        ExpressionAttributeValues: {
          ":t": title,
          ":c": content,
          ":time": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      })
    );

    return respond(200, { message: "Note updated", note: result.Attributes });
  } catch (err) {
    console.error("UpdateNote error:", err);
    return respond(500, { error: "Could not update note" });
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
