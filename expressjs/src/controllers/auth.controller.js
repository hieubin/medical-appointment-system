import {
  getCurrentUser,
  login as loginUser,
  logout as logoutUser,
} from "../services/auth.service.js";
import { success } from "../views/json.view.js";

export async function login(req, res) {
  return success(res, await loginUser(req.validated.body));
}

export async function logout(req, res) {
  await logoutUser(req.auth.sessionId);
  return success(res, { message: "Đã đăng xuất." });
}

export function me(req, res) {
  return success(res, getCurrentUser(req.auth.user));
}