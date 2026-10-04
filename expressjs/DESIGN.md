# Nghiệp vụ — Phòng khám đặt lịch

Tóm tắt để review trước khi implement. Không phải spec API chi tiết.

## Vai trò

| Role | Việc được làm |
|------|----------------|
| **PATIENT** | Xem chuyên khoa, bác sĩ, bảng giá. Đặt lịch. Tra cứu / hủy bằng mã. |
| **STAFF** | Tiếp nhận lịch: xác nhận hoặc hủy. Xem thống kê ngày/tuần. |
| **ADMIN** | Toàn quyền STAFF + CRUD bác sĩ, chuyên khoa, dịch vụ, khung giờ làm việc. |

Khách chưa đăng nhập: xem chuyên khoa / bác sĩ / bảng giá, tra cứu mã lịch. **Đặt lịch bắt buộc đăng nhập PATIENT.**

## Luồng bệnh nhân

1. Chọn chuyên khoa hoặc bác sĩ → chọn ngày → hệ thống liệt kê **khung giờ còn trống**.
2. Chọn 1 slot + lý do khám (optional) → tạo lịch `PENDING`, trả **mã đặt lịch** (`LK-XXXXXX`).
3. Tra cứu bằng mã: xem trạng thái, bác sĩ, ngày giờ.
4. Hủy khi trạng thái còn `PENDING` hoặc `CONFIRMED` (chưa khám). Có mã là được hủy.

Slot trống = khung giờ trong lịch làm việc bác sĩ **trừ** các lịch `PENDING` + `CONFIRMED` cùng ngày.

## Luồng admin / staff

- CRUD chuyên khoa, bác sĩ, bảng giá dịch vụ, khung giờ (thứ trong tuần + giờ bắt đầu/kết thúc + độ dài slot, mặc định 30 phút).
- Danh sách lịch hẹn: xác nhận `PENDING → CONFIRMED`, hủy `→ CANCELLED`, đánh dấu đã khám `→ COMPLETED`.
- Thống kê số lượt khám theo **ngày** (khung 7 ngày gần nhất) và **tuần hiện tại**. Đếm theo trạng thái.

## Trạng thái lịch hẹn

```
PENDING → CONFIRMED → COMPLETED
   │           │
   └───────────┴──→ CANCELLED
```

Không đặt ngày quá khứ. Một bác sĩ không nhận 2 lịch trùng slot.

## Thực thể chính

- **User** — tài khoản (role PATIENT / STAFF / ADMIN)
- **Specialty** — chuyên khoa
- **Doctor** — bác sĩ, thuộc 1 chuyên khoa, phí khám
- **Service** — dịch vụ + giá (gắn chuyên khoa hoặc đa khoa)
- **WorkSchedule** — ca làm việc theo thứ (0=CN … 6=T7)
- **Appointment** — lịch hẹn: mã, bệnh nhân, bác sĩ, ngày, giờ, status

## Phạm vi không làm ở bản này

Thanh toán online, hồ sơ bệnh án, chat, thông báo SMS/email, phân quyền từng bác sĩ chỉ thấy lịch của mình (STAFF xem tất cả).
