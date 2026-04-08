// Task 5.6: DeleteNote Lambda Function
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "NoteStack-Notes-SDLC";

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userId = event.requestContext?.authorizer?.claims?.sub || body.userId;
    const { noteId } = body;

    if (!userId || !noteId) {
      return respond(400, { error: "Missing required fields: userId, noteId" });
    }

    const result = await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { userId, noteId },
        ReturnValues: "ALL_OLD",
      })
    );

    if (!result.Attributes) {
      return respond(404, { error: "Note not found" });
    }

    return respond(200, { message: "Note deleted", note: result.Attributes });
  } catch (err) {
    console.error("DeleteNote error:", err);
    return respond(500, { error: "Could not delete note" });
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
