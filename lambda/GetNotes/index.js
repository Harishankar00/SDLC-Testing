// Task 5.4: GetNotes Lambda Function
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "NoteStack-Notes-SDLC";

exports.handler = async (event) => {
  try {
    const userId =
      event.requestContext?.authorizer?.claims?.sub ||
      event.queryStringParameters?.userId;

    if (!userId) {
      return respond(400, { error: "Missing userId" });
    }

    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
      })
    );

    return respond(200, { count: result.Count, notes: result.Items });
  } catch (err) {
    console.error("GetNotes error:", err);
    return respond(500, { error: "Could not get notes" });
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
