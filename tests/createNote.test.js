/**
 * T1-T4: CreateNote Lambda handler validation + success path
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
});

describe("CreateNote Lambda", () => {
  // T1
  test("rejects request with missing userId", async () => {
    const event = { body: JSON.stringify({ title: "t", content: "c" }) };
    const res = await handler(event);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toMatch(/Missing required fields/);
  });

  // T2
  test("rejects request with missing title", async () => {
    const event = { body: JSON.stringify({ userId: "u1", content: "c" }) };
    const res = await handler(event);
    expect(res.statusCode).toBe(400);
  });

  // T3
  test("rejects request with missing content", async () => {
    const event = { body: JSON.stringify({ userId: "u1", title: "t" }) };
    const res = await handler(event);
    expect(res.statusCode).toBe(400);
  });

  // T4
  test("returns 201 with note ID on valid input", async () => {
    mockSend.mockResolvedValue({});
    const event = {
      body: JSON.stringify({ userId: "u1", title: "My Note", content: "Hello" }),
    };
    const res = await handler(event);
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.message).toBe("Note created");
    expect(body.note.noteId).toMatch(/^note-\d+$/);
    expect(body.note.title).toBe("My Note");
  });
});
