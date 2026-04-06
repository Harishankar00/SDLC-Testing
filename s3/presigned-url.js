// Task 2.6: Generate a pre-signed URL
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({ region: "ap-south-1" });

const BUCKET_NAME = "notestack-files-sdlc-2026";

async function generatePresignedUrl(s3Key, expiresInSeconds = 900) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: s3Key,
  };

  const url = await getSignedUrl(s3Client, new GetObjectCommand(params), {
    expiresIn: expiresInSeconds,
  });

  console.log("Pre-signed URL generated!");
  console.log("  Key:", s3Key);
  console.log("  Expires in:", expiresInSeconds, "seconds");
  console.log("  URL:", url);
  return url;
}

// Run: node s3/presigned-url.js <s3-key> [expires-in-seconds]
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log("Usage: node s3/presigned-url.js <s3-key> [expires-in-seconds]");
  process.exit(1);
}
generatePresignedUrl(args[0], parseInt(args[1]) || 900).catch(console.error);
