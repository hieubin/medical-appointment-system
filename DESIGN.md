# Thiết kế hệ thống đặt lịch khám bệnh

## 1. Mục tiêu và phạm vi

Hệ thống hỗ trợ bệnh nhân tra cứu chuyên khoa, bác sĩ, dịch vụ và đặt lịch khám trực tuyến. Phòng khám có thể quản lý dữ liệu chuyên môn, khung giờ làm việc và danh sách lịch hẹn.

### Phạm vi phiên bản đầu

- Bệnh nhân tra cứu chuyên khoa, bác sĩ, dịch vụ và giá.
- Bệnh nhân chọn bác sĩ hoặc chuyên khoa, ngày và khung giờ còn trống để đặt lịch.
- Hệ thống sinh mã đặt lịch duy nhất.
- Bệnh nhân tra cứu và hủy lịch bằng mã đặt lịch cùng số điện thoại/email.
- Admin/Staff CRUD chuyên khoa, bác sĩ, dịch vụ và lịch làm việc.
- Admin/Staff tiếp nhận, xác nhận, hủy và cập nhật trạng thái lịch hẹn.
- Thống kê số lượt khám theo ngày và tuần.

### Ngoài phạm vi phiên bản đầu

- Thanh toán trực tuyến.
- Hồ sơ bệnh án điện tử chi tiết.
- Kê đơn thuốc.
- Video call.
- Tích hợp SMS/email thật. Có thể chuẩn bị notification event để mở rộng sau.

## 2. Vai trò và quyền hạn

| Vai trò | Quyền chính |
|---|---|
| Guest/Patient | Xem dữ liệu công khai, đặt lịch, tra cứu và hủy lịch của chính mình |
| Staff | Xem và xử lý lịch hẹn, xem thống kê; không quản lý tài khoản quản trị |
| Admin | Toàn quyền CRUD chuyên khoa, bác sĩ, dịch vụ, lịch làm việc và lịch hẹn; quản lý Staff |

Giai đoạn đầu có thể cho Patient đặt lịch không cần tài khoản. Dữ liệu riêng tư phải được bảo vệ bằng mã đặt lịch kết hợp thông tin xác minh, không chỉ bằng mã đơn độc.

## 3. Luồng nghiệp vụ chính

### 3.1. Tra cứu và đặt lịch

1. Bệnh nhân mở trang đặt lịch.
2. Chọn chuyên khoa hoặc bác sĩ.
3. Hệ thống lọc danh sách bác sĩ phù hợp.
4. Bệnh nhân xem hồ sơ bác sĩ, dịch vụ và bảng giá.
5. Bệnh nhân chọn ngày khám.
6. Backend tính các khung giờ còn trống từ lịch làm việc và các lịch hẹn đã tồn tại.
7. Bệnh nhân chọn một khung giờ.
8. Nhập họ tên, số điện thoại, email tùy chọn, dịch vụ và ghi chú.
9. Backend kiểm tra lại slot trong transaction.
10. Nếu còn trống, tạo lịch hẹn ở trạng thái `PENDING` và sinh mã đặt lịch.
11. Hiển thị mã đặt lịch và thông tin lịch hẹn.

### 3.2. Tra cứu lịch hẹn

1. Bệnh nhân nhập mã đặt lịch và số điện thoại.
2. Backend trả thông tin lịch hẹn tối thiểu cần thiết.
3. Có thể hủy nếu lịch còn cho phép hủy.

### 3.3. Xử lý tại phòng khám

1. Staff/Admin mở danh sách lịch hẹn theo ngày, trạng thái hoặc bác sĩ.
2. Kiểm tra thông tin bệnh nhân và nội dung đặt lịch.
3. Xác nhận lịch: `PENDING -> CONFIRMED`.
4. Khi bệnh nhân đến khám: `CONFIRMED -> COMPLETED`.
5. Nếu phòng khám hoặc bệnh nhân hủy: chuyển `CANCELLED` và lưu lý do.
6. Nếu bệnh nhân không đến: chuyển `CONFIRMED -> NO_SHOW`.

### 3.4. Cấu hình lịch làm việc

1. Admin/Staff chọn bác sĩ.
2. Tạo lịch theo thứ trong tuần, giờ bắt đầu, giờ kết thúc và thời lượng mỗi slot.
3. Có thể thêm ngày nghỉ hoặc lịch ngoại lệ.
4. Hệ thống không cho tạo lịch kết thúc trước giờ bắt đầu hoặc bị trùng.

## 4. Quy tắc nghiệp vụ

### Lịch hẹn

- Mỗi lịch hẹn thuộc đúng một bác sĩ và một dịch vụ.
- Có thể đặt theo chuyên khoa; hệ thống phải chọn bác sĩ cụ thể trước khi lưu.
- Một slot của một bác sĩ chỉ có tối đa một lịch hẹn đang hoạt động.
- Lịch `CANCELLED`, `COMPLETED`, `NO_SHOW` không chiếm slot.
- Không cho đặt ngày/giờ trong quá khứ.
- Không cho đặt ngoài lịch làm việc hoặc vào ngày nghỉ.
- Thời điểm phải được xử lý nhất quán theo timezone của phòng khám, mặc định `Asia/Ho_Chi_Minh`.
- Mã đặt lịch là chuỗi dễ đọc, duy nhất, không dùng ID database làm mã hiển thị.
- Bệnh nhân chỉ được hủy trước thời gian khám tối thiểu theo cấu hình, mặc định 2 giờ.
- Khi hủy phải lưu người hủy, thời điểm hủy và lý do.

### Dữ liệu danh mục

- Chuyên khoa, bác sĩ và dịch vụ có trạng thái `ACTIVE/INACTIVE` thay vì xóa cứng khi đã được sử dụng.
- Giá dịch vụ lưu bằng số nguyên tiền Việt Nam (`BigInt` hoặc `Decimal`), không dùng số thực.
- Bác sĩ phải thuộc ít nhất một chuyên khoa.
- Không cho xóa chuyên khoa/bác sĩ/dịch vụ đang được tham chiếu bởi lịch hẹn; dùng ngừng hoạt động.

### Đồng thời và chống đặt trùng

- API lấy slot chỉ mang tính tham khảo.
- API tạo lịch phải kiểm tra lại slot ngay trong transaction.
- Database cần unique constraint cho `(doctor_id, appointment_date, start_time)` trên các lịch đang hoạt động hoặc dùng cơ chế giữ slot tương đương.
- Nếu có người đặt trước, trả `409 Conflict` và yêu cầu bệnh nhân chọn slot khác.

## 5. Mô hình dữ liệu đề xuất

Tên bảng dùng snake_case; tên model Prisma dùng PascalCase.

### User

- `id`, `email`, `password_hash`
- `full_name`, `phone`
- `role`: `ADMIN | STAFF | PATIENT`
- `status`: `ACTIVE | INACTIVE`
- `created_at`, `updated_at`

### Specialty

- `id`, `name`, `slug`, `description`
- `status`: `ACTIVE | INACTIVE`
- `created_at`, `updated_at`

### Doctor

- `id`, `user_id` nullable nếu bác sĩ chưa đăng nhập
- `full_name`, `phone`, `email`
- `license_number`, `title`, `bio`, `avatar_url`
- `status`: `ACTIVE | INACTIVE`
- `created_at`, `updated_at`

### DoctorSpecialty

- `doctor_id`, `specialty_id`
- Khóa chính ghép `(doctor_id, specialty_id)`.

### Service

- `id`, `specialty_id` nullable
- `name`, `description`, `duration_minutes`, `price`
- `status`: `ACTIVE | INACTIVE`
- `created_at`, `updated_at`

### WorkingSchedule

- `id`, `doctor_id`
- `day_of_week`: 0-6 hoặc 1-7, phải thống nhất toàn hệ thống
- `start_time`, `end_time`, `slot_duration_minutes`
- `effective_from`, `effective_to` nullable
- `status`: `ACTIVE | INACTIVE`

### ScheduleException

- `id`, `doctor_id`, `exception_date`
- `start_time`, `end_time` nullable
- `type`: `DAY_OFF | CUSTOM_HOURS`
- `reason`

### Appointment

- `id`, `booking_code` unique
- `patient_id` nullable nếu cho đặt không tài khoản
- `patient_name`, `patient_phone`, `patient_email`
- `doctor_id`, `specialty_id`, `service_id`
- `appointment_date`, `start_time`, `end_time`
- `status`: `PENDING | CONFIRMED | CANCELLED | COMPLETED | NO_SHOW`
- `patient_note`, `staff_note`, `cancel_reason`
- `confirmed_at`, `cancelled_at`, `completed_at`
- `created_at`, `updated_at`

### AppointmentStatusHistory

- `id`, `appointment_id`
- `from_status`, `to_status`, `reason`
- `changed_by` nullable cho thao tác của bệnh nhân
- `created_at`

### Quan hệ chính

```text
Specialty 1---n Service
Specialty n---n Doctor
Doctor 1---n WorkingSchedule
Doctor 1---n ScheduleException
Doctor 1---n Appointment
Service 1---n Appointment
Appointment 1---n AppointmentStatusHistory
User 1---0..1 Doctor
User 1---n Appointment (nếu bệnh nhân có tài khoản)
```

## 6. Thiết kế API

Base URL: `/api`

### Public API

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/specialties` | Danh sách chuyên khoa đang hoạt động |
| GET | `/specialties/:id` | Chi tiết chuyên khoa và bác sĩ |
| GET | `/doctors` | Tìm kiếm/lọc bác sĩ |
| GET | `/doctors/:id` | Chi tiết bác sĩ, chuyên khoa, dịch vụ |
| GET | `/services` | Danh sách dịch vụ và giá |
| GET | `/doctors/:id/available-slots?date=YYYY-MM-DD` | Slot còn trống |
| POST | `/appointments` | Tạo lịch hẹn |
| POST | `/appointments/lookup` | Tra cứu bằng mã và thông tin xác minh |
| POST | `/appointments/:id/cancel` | Bệnh nhân hủy lịch |
| GET | `/health` | Kiểm tra API/database |

### Admin/Staff API

| Method | Endpoint | Mục đích |
|---|---|---|
| POST/PUT/DELETE | `/admin/specialties` | CRUD chuyên khoa |
| POST/PUT/DELETE | `/admin/doctors` | CRUD bác sĩ |
| POST/PUT/DELETE | `/admin/services` | CRUD dịch vụ |
| GET/POST/PUT/DELETE | `/admin/doctors/:id/schedules` | CRUD lịch làm việc |
| GET | `/admin/appointments` | Danh sách lịch hẹn có filter/pagination |
| PATCH | `/admin/appointments/:id/status` | Đổi trạng thái lịch hẹn |
| GET | `/admin/statistics/appointments` | Thống kê theo ngày/tuần |

### Authentication API dự kiến

| Method | Endpoint | Mục đích |
|---|---|---|
| POST | `/auth/login` | Đăng nhập Admin/Staff/Patient |
| POST | `/auth/logout` | Đăng xuất |
| GET | `/auth/me` | Lấy người dùng hiện tại |

### Chuẩn response

Thành công:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Lỗi:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ.",
  "errors": []
}
```

Mã HTTP chính: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `422`, `500`.

## 7. Thiết kế frontend

### Khu vực bệnh nhân

- `/`: trang chủ, tìm nhanh bác sĩ/chuyên khoa.
- `/specialties`: danh sách chuyên khoa.
- `/specialties/:id`: chi tiết chuyên khoa và bác sĩ.
- `/doctors`: danh sách, tìm kiếm và lọc bác sĩ.
- `/doctors/:id`: hồ sơ bác sĩ, dịch vụ, giá.
- `/booking`: wizard chọn bác sĩ/chuyên khoa, ngày, slot và thông tin bệnh nhân.
- `/booking/success`: mã đặt lịch và hướng dẫn lưu mã.
- `/appointments/lookup`: tra cứu lịch hẹn.
- `/appointments/:bookingCode`: chi tiết và nút hủy nếu hợp lệ.

### Khu vực Admin/Staff

- `/admin/login`
- `/admin/dashboard`: số lịch theo ngày/tuần, lịch sắp tới.
- `/admin/appointments`: bảng lịch hẹn, lọc theo ngày/bác sĩ/trạng thái.
- `/admin/doctors`
- `/admin/specialties`
- `/admin/services`
- `/admin/schedules`

### Thành phần dùng chung

- Header, sidebar quản trị, breadcrumb.
- Data table có pagination, filter, empty/loading/error state.
- Form validation bằng React Hook Form + Zod.
- Date/time picker không cho chọn thời điểm không hợp lệ.
- Toast cho thao tác thành công/thất bại.
- Confirm dialog trước khi hủy/xóa.

## 8. Kiến trúc backend

Giữ cấu trúc Express hiện tại và mở rộng theo module:

```text
src/
  config/                 # env, database
  middleware/             # auth, role, validate, error, rate limit
  modules/
    auth/
    specialties/
    doctors/
    services/
    schedules/
    appointments/
    statistics/
  views/                  # response formatter
  routes/index.js
  app.js
  server.js
prisma/
  schema.prisma
  migrations/
  seed.js
```

Mỗi module nên có route, controller, service, schema và repository/model khi cần. Controller chỉ điều phối request/response; quy tắc đặt lịch và transaction nằm ở service.

## 9. Bảo mật và vận hành

- Hash mật khẩu bằng bcrypt; không lưu plaintext.
- JWT hoặc cookie httpOnly cho Admin/Staff; kiểm tra role ở middleware.
- CORS chỉ cho phép domain trong `CLIENT_URL`.
- Dùng Helmet, rate limit cho login và lookup.
- Validate toàn bộ body/query/params bằng Zod.
- Không trả password hash hoặc dữ liệu nội bộ trong response.
- Log thay đổi trạng thái lịch hẹn và thao tác quản trị.
- Dùng Prisma migration thay cho `prisma db push` khi triển khai chính thức.
- Dùng biến môi trường cho secret, database credential và timezone.
- Thêm healthcheck cho backend; không coi `depends_on` là server readiness.
- Backup PostgreSQL và giới hạn expose database/pgAdmin ở môi trường production.

## 10. Chỉ số thống kê

API thống kê nhận khoảng thời gian:

```text
GET /api/admin/statistics/appointments?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day
```

Kết quả cần có:

- Tổng số lịch.
- Số `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`.
- Số lượt theo từng ngày.
- Có thể lọc theo bác sĩ hoặc chuyên khoa.

Tuần được hiểu là thứ Hai đến Chủ Nhật theo timezone phòng khám.

## 11. Lộ trình triển khai

### Phase 1: Nền dữ liệu

- Thiết kế Prisma schema và enum.
- Tạo migration, seed dữ liệu mẫu.
- Tạo repository/service cơ bản.

### Phase 2: Danh mục công khai

- API và giao diện chuyên khoa, bác sĩ, dịch vụ.
- Search/filter và trạng thái loading/error.

### Phase 3: Lịch làm việc và slot

- CRUD lịch làm việc.
- Ngoại lệ/ngày nghỉ.
- API tính slot còn trống.
- Test chống slot quá khứ, ngoài giờ và trùng lịch.

### Phase 4: Đặt và tra cứu lịch

- Tạo appointment transaction-safe.
- Sinh booking code.
- Tra cứu/hủy lịch.
- Trang kết quả và thông báo.

### Phase 5: Quản trị và xác nhận

- Login, JWT/cookie, role middleware.
- Dashboard và bảng quản lý lịch.
- Chuyển trạng thái, lịch sử thao tác.

### Phase 6: Thống kê và hardening

- Thống kê ngày/tuần.
- Rate limit, Helmet, CORS, audit log.
- Test backend/frontend và kiểm tra production Docker.

## 12. Tiêu chí nghiệm thu phiên bản đầu

- Bệnh nhân xem được danh sách chuyên khoa, bác sĩ, dịch vụ và giá.
- Bệnh nhân không thể chọn slot đã kín hoặc đã qua.
- Tạo hai request đồng thời cho cùng slot chỉ tối đa một request thành công.
- Sau khi đặt lịch, bệnh nhân nhận mã đặt lịch duy nhất.
- Tra cứu sai thông tin không làm lộ dữ liệu lịch hẹn.
- Bệnh nhân hủy được lịch còn trong thời hạn cho phép.
- Staff/Admin lọc và cập nhật được lịch hẹn.
- Mọi thay đổi trạng thái có lịch sử.
- Dashboard hiển thị số liệu đúng với dữ liệu appointment.
- Các API chính có validation, response format thống nhất và test cho lỗi thường gặp.

## 13. Trạng thái hiện tại của repository

Repository hiện mới có:

- Docker Compose cho PostgreSQL, pgAdmin, Express và React.
- Express health API: `GET /api/health`.
- Prisma model `User` tối giản.
- React page kiểm tra trạng thái API/database.

Các phần trong tài liệu này là thiết kế mục tiêu cần triển khai tiếp, chưa phải chức năng đã có trong code.