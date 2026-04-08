// Task 8.6: Publish a custom metric to CloudWatch
const { CloudWatchClient, PutMetricDataCommand } = require("@aws-sdk/client-cloudwatch");

const client = new CloudWatchClient({ region: "ap-south-1" });

async function publishMetric(metricName, value) {
  const params = {
    Namespace: "NoteStack-SDLC",
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: "Count",
        Timestamp: new Date(),
      },
    ],
  };

  await client.send(new PutMetricDataCommand(params));
  console.log("Custom metric published!");
  console.log(`  Namespace: NoteStack-SDLC`);
  console.log(`  Metric: ${metricName}`);
  console.log(`  Value: ${value}`);
}

// Run: node cloudwatch/customMetric.js <metric-name> <value>
// Example: node cloudwatch/customMetric.js NotesCreated 1
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: node cloudwatch/customMetric.js <metric-name> <value>");
  console.log("Example: node cloudwatch/customMetric.js NotesCreated 1");
  process.exit(1);
}
publishMetric(args[0], parseFloat(args[1])).catch(console.error);
