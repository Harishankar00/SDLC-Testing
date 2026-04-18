/**
 * T5-T6: GetNotes Lambda handler
 */
const mockSend = jest.fn();

jest.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: jest.fn(() => ({})),
}));

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: { from: () => ({ send: mockSend }) },
  QueryCommand: jest.fn((args) => ({ __type: "QueryCommand", ...args })),
}));

const { handler } = require("../lambda/GetNotes/index");

beforeEach(() => {
  mockSend.mockReset();
});

describe("GetNotes Lambda", () => {
  // T5
  test("rejects request with missing userId", async () => {
    const res = await handler({});
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toMatch(/Missing userId/);
  });

  // T6
  test("returns 200 with notes list on valid input", async () => {
    mockSend.mockResolvedValue({
      Count: 2,
      Items: [
        { userId: "u1", noteId: "note-1", title: "A" },
        { userId: "u1", noteId: "note-2", title: "B" },
      ],
    });
    const event = { queryStringParameters: { userId: "u1" } };
    const res = await handler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.count).toBe(2);
    expect(body.notes).toHaveLength(2);
  });
});
