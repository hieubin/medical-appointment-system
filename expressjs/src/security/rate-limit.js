import rateLimit from "express-rate-limit";

function reject(message) {
  return (_req, res) => {
    res.status(429).json({ success: false, message });
  };
}

const shared = {
  standardHeaders: true,
  legacyHeaders: false,
};

export const apiLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  handler: reject("Quá nhiều yêu cầu. Vui lòng thử lại sau."),
});

export const loginLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  handler: reject("Đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút."),
});

export const registerLimiter = rateLimit({
  ...shared,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  handler: reject("Tạo tài khoản quá nhiều lần từ mạng này. Vui lòng thử lại sau."),
});

export const forgotLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  handler: reject("Yêu cầu đặt lại mật khẩu quá nhiều lần. Vui lòng thử lại sau."),
});

export const bookingLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  handler: reject("Đặt hoặc tra cứu lịch quá nhiều lần. Vui lòng thử lại sau."),
});
