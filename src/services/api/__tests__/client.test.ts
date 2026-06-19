import { apiRequest } from "../client";

describe("apiRequest", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  it("sends bearer token and serializes a JSON body", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true }),
    });

    await expect(apiRequest("/tasks", {
      method: "POST",
      token: "secret",
      body: { title: "Prova" },
    })).resolves.toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/tasks",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "Prova" }),
        headers: expect.objectContaining({ Authorization: "Bearer secret" }),
      }),
    );
  });

  it("returns undefined for a 204 response", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204 });
    await expect(apiRequest("/auth/logout", { method: "POST" })).resolves.toBeUndefined();
  });

  it("throws an ApiError with the server detail", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ detail: "Sessão inválida." }),
    });

    await expect(apiRequest("/dashboard")).rejects.toEqual(
      expect.objectContaining({
        message: "Sessão inválida.",
        status: 401,
      }),
    );
  });

  it("normalizes network failures", async () => {
    const networkError = new Error("offline");
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
    fetchMock.mockRejectedValue(networkError);

    await expect(apiRequest("/health")).rejects.toMatchObject({ status: 0 });
    expect(consoleError).toHaveBeenCalledWith(
      "[API] GET http://localhost:8000/health failed",
      networkError,
    );

    consoleError.mockRestore();
  });
});
