import { pingDatabase } from "../services/health.service.js";
import { fail, success } from "../views/json.view.js";

export async function health(_req, res) {
  try {
    const db = await pingDatabase();
    return success(res, { service: "expressjs", ...db });
  } catch {
    return fail(res, "Không kết nối được PostgreSQL.", 503);
  }
}
