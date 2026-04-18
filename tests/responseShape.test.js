/**
 * T7-T9: Response shape + CORS + noteId pattern
 */
const mockSend = jest.fn();

jest.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: jest.fn(() => ({})),
}));

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: { from: () => ({ send: mockSend }) },
  PutCommand: jest.fn((args) => ({ __type: "PutCommand", ...args })),
}));

const { handler } = require("../lambda/CreateNote/index");

beforeEach(() => {
  mockSend.mockReset();
  mockSend.mockResolvedValue({});
});

describe("Lambda response shape", () => {
  // T7
  test("response includes CORS Access-Control-Allow-Origin header", async () => {
    const event = {
      body: JSON.stringify({ userId: "u1", title: "t", content: "c" }),
    };
    const res = await handler(event);
    expect(res.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(res.headers["Content-Type"]).toBe("application/json");
  });

  // T8
  test("response body is always valid JSON string", async () => {
    const event = {
      body: JSON.stringify({ userId: "u1", title: "t", content: "c" }),
    };
    const res = await handler(event);
    expect(typeof res.body).toBe("string");
    expect(() => JSON.parse(res.body)).not.toThrow();
  });

  // T9
  test("noteId follows note-<timestamp> pattern", async () => {
    const event = {
      body: JSON.stringify({ userId: "u1", title: "t", content: "c" }),
    };
    const before = Date.now();
    const res = await handler(event);
    const after = Date.now();

    const noteId = JSON.parse(res.body).note.noteId;
    expect(noteId).toMatch(/^note-\d+$/);

    const ts = parseInt(noteId.replace("note-", ""), 10);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});
