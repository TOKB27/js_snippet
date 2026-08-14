import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/**
 * テスト実行時用の MSW モックサーバー
 */
export const server = setupServer(...handlers);
