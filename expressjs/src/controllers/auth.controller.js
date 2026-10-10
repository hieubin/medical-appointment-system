import {
  forgotPassword as requestPasswordReset,
  getCurrentUser,
  login as loginUser,
  register as registerUser,
  logout as logoutUser,
} from "../services/auth.service.js";
import { clearAuthCookie, setAuthCookie } from "../security/cookies.js";
import { success } from "../views/json.view.js";

function publishSession(res, result, { persistent = true, status = 200 } = {}) {
  setAuthCookie(res, result.accessToken, { persistent });
  return success(res, { user: result.user, expiresAt: result.expiresAt }, status);
}

export async function login(req, res) {
  const result = await loginUser(req.validated.body);
  return publishSession(res, result, { persistent: req.validated.body.keepSignedIn !== false });
}

export async function register(req, res) {
  const result = await registerUser(req.validated.body);
  return publishSession(res, result, { status: 201 });
}

export async function forgotPassword(_req, res) {
  return success(res, requestPasswordReset());
}

export async function logout(req, res) {
  await logoutUser(req.auth.sessionId);
  clearAuthCookie(res);
  return success(res, { message: "Đã đăng xuất." });
}

export function me(req, res) {
  return success(res, getCurrentUser(req.auth.user));
}