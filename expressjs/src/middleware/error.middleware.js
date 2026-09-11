import { ZodError } from "zod";

export function notFound(_req, res) {
  res.status(404).json({ success: false, message: "Không tìm thấy tài nguyên." });
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ.",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi máy chủ.",
  });
}
