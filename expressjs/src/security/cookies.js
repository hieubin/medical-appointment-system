export const AUTH_COOKIE = "hh_session";

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

function baseOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

export function setAuthCookie(res, token, { persistent = true } = {}) {
  const options = baseOptions();
  if (persistent) options.maxAge = EIGHT_HOURS_MS;
  res.cookie(AUTH_COOKIE, token, options);
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, baseOptions());
}
