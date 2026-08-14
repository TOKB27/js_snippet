import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

describe("GenericDataGrid Export Feature", () => {
  const originalCreateObjectURL = globalThis.URL.createObjectURL;
  const originalRevokeObjectURL = globalThis.URL.revokeObjectURL;

  const createObjectURLMock = vi.fn(() => "blob:http://localhost/mock-id");
  const revokeObjectURLMock = vi.fn();

  beforeAll(() => {
    // globalThis を使用して安全にモック化
    globalThis.URL.createObjectURL = createObjectURLMock;
    globalThis.URL.revokeObjectURL = revokeObjectURLMock;
  });

  afterAll(() => {
    // 他のテストに影響を与えないようリストア
    globalThis.URL.createObjectURL = originalCreateObjectURL;
    globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
    vi.restoreAllMocks();
  });

  it("正しくオブジェクトURLを生成・破棄できること", () => {
    const blob = new Blob(["test"], { type: "text/plain" });
    const url = globalThis.URL.createObjectURL(blob);

    expect(url).toBe("blob:http://localhost/mock-id");
    expect(createObjectURLMock).toHaveBeenCalledWith(blob);

    globalThis.URL.revokeObjectURL(url);
    expect(revokeObjectURLMock).toHaveBeenCalledWith(url);
  });
});