/**
 * T13-T15: Deploy script and project structure sanity
 */
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");

describe("Deploy script and project structure", () => {
  // T13
  test("deploy-lambdas.sh exists and targets AWS account 896823725438", () => {
    const file = path.join(REPO_ROOT, "lambda", "deploy-lambdas.sh");
    expect(fs.existsSync(file)).toBe(true);
    const content = fs.readFileSync(file, "utf8");
    expect(content).toMatch(/896823725438/);
    expect(content).toMatch(/ap-south-1/);
    expect(content).toMatch(/aws lambda/);
  });

  // T14
  test("all 5 Lambda folders have index.js and package.json", () => {
    const funcs = ["CreateNote", "GetNotes", "UpdateNote", "DeleteNote", "GenerateUploadUrl"];
    for (const fn of funcs) {
      const dir = path.join(REPO_ROOT, "lambda", fn);
      expect(fs.existsSync(path.join(dir, "index.js"))).toBe(true);
      expect(fs.existsSync(path.join(dir, "package.json"))).toBe(true);
    }
  });

  // T15
  test("README.md exists and documents the project", () => {
    const file = path.join(REPO_ROOT, "README.md");
    expect(fs.existsSync(file)).toBe(true);
    const content = fs.readFileSync(file, "utf8");
    expect(content.length).toBeGreaterThan(100);
    expect(content.toLowerCase()).toMatch(/notestack/);
  });
});
