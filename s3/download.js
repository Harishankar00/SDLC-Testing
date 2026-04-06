// Task 2.4: Download a file from S3
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({ region: "ap-south-1" });

const BUCKET_NAME = "notestack-files-sdlc-2026";

async function downloadFile(s3Key) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: s3Key,
  };

  const result = await s3Client.send(new GetObjectCommand(params));
  const content = await result.Body.transformToString();

  console.log("File downloaded successfully!");
  console.log("  Key:", s3Key);
  console.log("  Content-Type:", result.ContentType);
  console.log("  Content:");
  console.log(content);
  return content;
}

// Run: node s3/download.js <s3-key>
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log("Usage: node s3/download.js <s3-key>");
  process.exit(1);
}
downloadFile(args[0]).catch(console.error);
