// Task 2.5: List files in a folder
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({ region: "ap-south-1" });

const BUCKET_NAME = "notestack-files-sdlc-2026";

async function listFiles(prefix) {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: prefix,
  };

  const result = await s3Client.send(new ListObjectsV2Command(params));

  console.log(`Files in "${prefix}":`);
  if (result.Contents && result.Contents.length > 0) {
    result.Contents.forEach((file) => {
      console.log(`  ${file.Key} (${file.Size} bytes)`);
    });
    console.log(`\nTotal: ${result.Contents.length} file(s)`);
  } else {
    console.log("  No files found.");
  }
  return result.Contents || [];
}

// Run: node s3/list.js <prefix>
const args = process.argv.slice(2);
const prefix = args[0] || "users/";
listFiles(prefix).catch(console.error);
