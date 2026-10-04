import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../models/index.js";

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
  };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = user && await bcrypt.compare(password, user.passwordHash);

  if (!user || !passwordMatches || user.status !== "ACTIVE") {
    throw Object.assign(new Error("Email hoặc mật khẩu không chính xác."), { status: 401 });
  }

  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await prisma.authSession.create({
    data: { userId: user.id, expiresAt },
  });
  const accessToken = jwt.sign(
    { sessionId: session.id },
    process.env.JWT_SECRET,
    { subject: user.id, expiresIn: "8h" },
  );

  return {
    accessToken,
    tokenType: "Bearer",
    expiresAt,
    user: publicUser(user),
  };
}

export async function register({ email, password, firstName, lastName, clinicName, phone }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw Object.assign(new Error("Email này đã được sử dụng. Vui lòng đăng nhập hoặc chọn email khác."), { status: 409 });
  }

  const fullName = [firstName, lastName].filter(Boolean).join(" ") || clinicName || email.split("@")[0];
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      phone: phone || null,
      role: clinicName ? "STAFF" : "PATIENT",
      status: "ACTIVE",
    },
  });

  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await prisma.authSession.create({
    data: { userId: user.id, expiresAt },
  });
  const accessToken = jwt.sign(
    { sessionId: session.id },
    process.env.JWT_SECRET,
    { subject: user.id, expiresIn: "8h" },
  );

  return {
    accessToken,
    tokenType: "Bearer",
    expiresAt,
    user: publicUser(user),
  };
}

export async function logout(sessionId) {
  await prisma.authSession.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export function getCurrentUser(user) {
  return publicUser(user);
}