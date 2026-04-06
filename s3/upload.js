// Task 2.3: Upload a file to S3
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const s3Client = new S3Client({ region: "ap-south-1" });

const BUCKET_NAME = "notestack-files-sdlc-2026";

async function uploadFile(filePath, s3Key) {
  const fileContent = fs.readFileSync(filePath);
  const contentType =
    path.extname(filePath) === ".pdf" ? "application/pdf" :
    path.extname(filePath) === ".png" ? "image/png" :
    path.extname(filePath) === ".jpg" ? "image/jpeg" :
    "application/octet-stream";

  const params = {
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: fileContent,
    ContentType: contentType,
  };

  const result = await s3Client.send(new PutObjectCommand(params));
  console.log("File uploaded successfully!");
  console.log("  Bucket:", BUCKET_NAME);
  console.log("  Key:", s3Key);
  console.log("  ETag:", result.ETag);
  return result;
}

// Run: node s3/upload.js <local-file-path> <s3-key>
// Example: node s3/upload.js ./test.txt users/test-user/notes/test.txt
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: node s3/upload.js <local-file-path> <s3-key>");
  console.log("Example: node s3/upload.js ./test.txt users/test-user/notes/test.txt");
  process.exit(1);
}
uploadFile(args[0], args[1]).catch(console.error);
