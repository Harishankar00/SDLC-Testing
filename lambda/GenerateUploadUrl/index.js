// Task 5.7: GenerateUploadUrl Lambda Function
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({ region: "ap-south-1" });
const BUCKET_NAME = "notestack-files-sdlc-2026";

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userId = event.requestContext?.authorizer?.claims?.sub || body.userId;
    const { fileName, fileType } = body;

    if (!userId || !fileName || !fileType) {
      return respond(400, { error: "Missing required fields: userId, fileName, fileType" });
    }

    const fileKey = `users/${userId}/notes/${Date.now()}-${fileName}`;

    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        ContentType: fileType,
      }),
      { expiresIn: 300 }
    );

    return respond(200, { uploadUrl, fileKey });
  } catch (err) {
    console.error("GenerateUploadUrl error:", err);
    return respond(500, { error: "Could not generate upload URL" });
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
