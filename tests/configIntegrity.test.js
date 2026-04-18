/**
 * T10-T12: Config file integrity
 */
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");

describe("Config integrity", () => {
  // T10
  test("iam/notestack-lambda-basic-policy.json is valid JSON", () => {
    const file = path.join(REPO_ROOT, "iam", "notestack-lambda-basic-policy.json");
    expect(fs.existsSync(file)).toBe(true);
    const content = fs.readFileSync(file, "utf8");
    expect(() => JSON.parse(content)).not.toThrow();

    const policy = JSON.parse(content);
    expect(policy.Version).toBeDefined();
    expect(policy.Statement).toBeDefined();
    expect(Array.isArray(policy.Statement)).toBe(true);
  });

  // T11
  test("iam/trust-policy.json is valid JSON and allows lambda.amazonaws.com", () => {
    const file = path.join(REPO_ROOT, "iam", "trust-policy.json");
    expect(fs.existsSync(file)).toBe(true);
    const policy = JSON.parse(fs.readFileSync(file, "utf8"));

    expect(policy.Statement).toBeDefined();
    const services = JSON.stringify(policy);
    expect(services).toMatch(/lambda\.amazonaws\.com/);
  });

  // T12
  test("root package.json has required AWS SDK dependencies", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")
    );
    const required = [
      "@aws-sdk/client-dynamodb",
      "@aws-sdk/client-s3",
      "@aws-sdk/lib-dynamodb",
    ];
    for (const dep of required) {
      expect(pkg.dependencies).toHaveProperty(dep);
    }
  });
});
