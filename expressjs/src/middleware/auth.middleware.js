import jwt from "jsonwebtoken";
import { prisma } from "../models/index.js";
import { AUTH_COOKIE } from "../security/cookies.js";
import { fail } from "../views/json.view.js";

function readSessionToken(req) {
  const token = req.cookies?.[AUTH_COOKIE];
  return typeof token === "string" && token ? token : null;
}

export async function authenticate(req, res, next) {
  const token = readSessionToken(req);

  if (!token) return fail(res, "Cần đăng nhập để tiếp tục.", 401);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof payload !== "object" || !payload.sessionId || !payload.sub) {
      return fail(res, "Token không hợp lệ.", 401);
    }

    const session = await prisma.authSession.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        user: { status: "ACTIVE" },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!session) return fail(res, "Phiên đăng nhập đã hết hạn hoặc bị thu hồi.", 401);

    req.auth = { sessionId: session.id, user: session.user };
    req.user = session.user;
    return next();
  } catch {
    return fail(res, "Token không hợp lệ hoặc đã hết hạn.", 401);
  }
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.user.role)) {
      return fail(res, "Bạn không có quyền thực hiện thao tác này.", 403);
    }
    return next();
  };
}

export async function optionalAuth(req, _res, next) {
  const token = readSessionToken(req);

  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof payload === "object" && payload.sessionId && payload.sub) {
      const session = await prisma.authSession.findFirst({
        where: {
          id: payload.sessionId,
          userId: payload.sub,
          revokedAt: null,
          expiresAt: { gt: new Date() },
          user: { status: "ACTIVE" },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
              role: true,
              status: true,
            },
          },
        },
      });

      if (session) {
        req.auth = { sessionId: session.id, user: session.user };
        req.user = session.user;
      }
    }
  } catch {
    // ignore optional auth errors
  }
  return next();
}

export const requireAuth = authenticate;
export const requireRole = requireRoles;