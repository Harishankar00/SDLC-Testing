// Task 8.1 & 8.3: View Lambda logs from CloudWatch
const { exec } = require("child_process");

const REGION = "ap-south-1";

const FUNCTIONS = [
  "NoteStack-CreateNote-SDLC",
  "NoteStack-GetNotes-SDLC",
  "NoteStack-UpdateNote-SDLC",
  "NoteStack-DeleteNote-SDLC",
  "NoteStack-GenerateUploadUrl-SDLC",
];

const funcName = process.argv[2];

if (!funcName) {
  console.log("Usage: node cloudwatch/viewLogs.js <function-name>");
  console.log("\nAvailable functions:");
  FUNCTIONS.forEach((f) => console.log(`  ${f}`));
  process.exit(1);
}

const logGroup = `/aws/lambda/${funcName}`;
const cmd = `aws logs filter-log-events --log-group-name "${logGroup}" --region ${REGION} --limit 20 --query 'events[].message' --output text 2>&1`;

console.log(`Fetching last 20 log events from: ${logGroup}\n`);

exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.error("Error:", stderr || err.message);
    return;
  }
  console.log(stdout || "No logs found.");
});
