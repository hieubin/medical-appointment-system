# Phòng khám Đa khoa Hiếu Hải

Web đặt lịch khám của **một bệnh viện**. Bệnh nhân tự tạo tài khoản để đặt lịch. Admin có sẵn tài khoản để xem và duyệt lịch. Không có cổng nhân viên, không có nhiều phòng khám riêng.

Trang demo: https://medical-appointment-system-lake.vercel.app

## Nói gì khi thuyết trình (30 giây)

Bệnh nhân vào web, chọn cơ sở, chuyên khoa, bác sĩ và giờ khám. Hệ thống giữ chỗ và đưa mã phiếu. Admin mở danh sách, xác nhận hoặc hủy. Bệnh nhân vào lại vẫn thấy trạng thái mới.

## Tài khoản để demo

Bấm sẵn trên màn hình đăng nhập, khỏi gõ.

| Ai | Email | Mật khẩu | Vào đâu |
|---|---|---|---|
| Bệnh nhân | patient@clinic.test | Patient123! | Cổng bệnh nhân |
| Admin | admin@clinic.test | Admin123! | Trang quản trị |

Người mới bấm **Đăng ký khám bệnh** thì luôn thành bệnh nhân. Chỉ admin mới vào được trang quản trị.

## Kịch bản bấm demo

1. Mở trang, bấm **Bệnh nhân**, rồi **Đăng nhập**.
2. Bấm **Đặt lịch khám**. Chọn một cơ sở, một bác sĩ, một ngày trong tuần, một giờ còn trống. Gửi form.
3. Nhớ **mã phiếu** (dạng `MA-` kèm 8 ký tự). Trạng thái lúc này là **Chờ xác nhận**.
4. Đăng xuất. Bấm **Admin**, đăng nhập.
5. Vào **Lịch hẹn**, tìm mã phiếu vừa đặt, bấm xác nhận. Trạng thái thành **Đã xác nhận**.
6. Đăng xuất, vào lại bệnh nhân. Lịch đó đã được duyệt.

Muốn nói thêm: bệnh nhân hủy được khi lịch còn chờ hoặc đã xác nhận, và phải trước giờ khám ít nhất 2 giờ. Admin có thể xác nhận, hủy, đánh dấu đã khám xong, hoặc không đến.

## Quy tắc dễ nhớ

- Khám thứ Hai đến thứ Sáu. Sáng 8h–12h, chiều 13h–17h. Mỗi suất 30 phút.
- Cuối tuần không có suất. Giờ đã qua không hiện. Một bác sĩ không nhận hai lịch cùng giờ nếu lịch kia còn chờ hoặc đã xác nhận.
- Trạng thái đi một chiều: Chờ xác nhận → Đã xác nhận hoặc Đã hủy. Đã xác nhận → Đã khám xong, Đã hủy, hoặc Không đến.

## Bệnh viện có gì

Bốn cơ sở: Quận 5 (trụ sở), Bình Thạnh, Thủ Đức, Cầu Giấy.

Mười chuyên khoa: nội tổng quát, tim mạch, nhi, sản phụ khoa, da liễu, tai mũi họng, răng hàm mặt, cơ xương khớp, mắt, thần kinh. Mỗi khoa có bác sĩ và dịch vụ kèm giá.

Dữ liệu mẫu có sẵn 10 lịch hẹn `APT-001-2026` đến `APT-010-2026` để admin mở lên là thấy danh sách, không phải màn trống.

## Chạy trên máy để demo offline

Cần hai cửa sổ.

Cửa sổ 1, trong thư mục `expressjs`:

```bash
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

API chạy ở http://localhost:4000. File dữ liệu là `expressjs/prisma/data/medical.db`.

Cửa sổ 2, trong thư mục `reactjs`:

```bash
npm install
npm run dev
```

Web chạy ở http://localhost:3000 và tự gọi API qua `/api`.

Nếu quên mật khẩu trên giao diện: màn hình chỉ báo đã gửi email. Hệ thống chưa gửi email thật, nên demo dùng hai tài khoản ở trên.

## Công nghệ, nói được khi bị hỏi

Đồ án chia hai phần, nói chuyện với nhau bằng API.

| Phần | Thư mục | Việc nó làm | Công nghệ |
|---|---|---|---|
| Giao diện | `reactjs` | Màn đăng nhập, cổng bệnh nhân, trang admin | React, Vite, Axios |
| Máy chủ | `expressjs` | Nhận yêu cầu, kiểm tra quyền, đọc ghi dữ liệu | Express, Prisma, SQLite |

Trình duyệt không mở file database. Nó gọi địa chỉ `/api/...`. Máy dev thì Vite chuyển `/api` sang Express ở cổng 4000. Lên mạng thì giao diện nằm trên Vercel, API nằm trên Render.

Máy chủ viết theo kiểu tách lớp, dễ chỉ trên sơ đồ:

- `routes` nhận đường dẫn, ví dụ `/api/auth/login`, `/api/appointments`.
- `controllers` lấy dữ liệu từ request rồi gọi xử lý.
- `services` chứa luật: đặt lịch, hủy lịch, đổi trạng thái.
- `schemas` dùng Zod để chặn dữ liệu sai trước khi vào database.
- Prisma là lớp nói chuyện với SQLite.

Trang admin nằm sau `/api/admin`. Request phải kèm token và tài khoản phải là `ADMIN`. Bệnh nhân gọi được các API công khai: đăng ký, đăng nhập, xem bác sĩ, đặt lịch, tra cứu phiếu.

## SQLite trong đồ án này

SQLite là database nằm trọn trong **một file**, không cần cài MySQL hay mở server database riêng. File đó là:

`expressjs/prisma/data/medical.db`

Biến `DATABASE_URL` trỏ tới file này, dạng `file:./data/medical.db`. Prisma đọc file `schema.prisma` để biết có những bảng nào, rồi dùng lệnh `npx prisma db push` tạo bảng trong file `.db`. Lệnh `npm run prisma:seed` đổ dữ liệu mẫu: tài khoản, 10 chuyên khoa, bác sĩ, dịch vụ, lịch làm thứ Hai–thứ Sáu, và 10 phiếu `APT-001-2026` đến `APT-010-2026`.

Copy file `medical.db` sang máy khác là mang theo cả dữ liệu. Vì vậy bản trên Render cũng dùng chính file này, production có cùng bác sĩ, cơ sở và lịch mẫu với máy local.

Các bảng, gọi tên cho dễ nhớ:

| Bảng | Giữ cái gì |
|---|---|
| User | Tài khoản. Vai trò chỉ có bệnh nhân hoặc admin |
| AuthSession | Phiên đăng nhập, hết hạn thì token không dùng được |
| Location | 4 cơ sở |
| Specialty | Chuyên khoa |
| Doctor | Bác sĩ, nối với chuyên khoa qua DoctorSpecialty |
| Service | Dịch vụ khám, có thời lượng và giá |
| WorkingSchedule | Giờ làm của bác sĩ, mỗi suất 30 phút |
| Appointment | Phiếu khám: mã, bệnh nhân, bác sĩ, ngày, giờ, trạng thái |
| AppointmentStatusHistory | Lịch sử mỗi lần đổi trạng thái |
| MedicalRecord | Hồ sơ sức khỏe của bệnh nhân demo |

Phiếu mới do bệnh nhân đặt có mã `MA-` cộng 8 ký tự. Phiếu có sẵn khi seed thì mã `APT-...`.

## Đăng nhập nói ngắn

Mật khẩu không lưu chữ thường. Lúc tạo tài khoản, bcrypt băm mật khẩu rồi mới ghi vào cột `passwordHash`.

Đăng nhập đúng thì server ký một JWT, sống 8 giờ, và tạo một dòng trong `AuthSession`. Giao diện giữ token trong `localStorage`, mỗi request gửi kèm header `Authorization: Bearer ...`. Server kiểm tra chữ ký JWT, rồi kiểm tra phiên còn hạn và chưa bị thu hồi.

Đăng ký công khai luôn gán vai trò `PATIENT`. Gõ đúng `admin@clinic.test` mới vào `/admin`. Người không phải admin mà mở `/admin` thì bị đưa về cổng bệnh nhân.

## Một lần đặt lịch đi qua đâu

1. Bệnh nhân chọn cơ sở, bác sĩ, ngày. Giao diện hỏi API các giờ còn trống.
2. Server lấy lịch làm thứ Hai–thứ Sáu, bỏ giờ đã qua, bỏ giờ đã có phiếu Chờ xác nhận hoặc Đã xác nhận.
3. Bệnh nhân gửi form. Server tạo dòng `Appointment` trạng thái `PENDING` và một dòng lịch sử.
4. Admin xác nhận. Server chỉ cho đi đúng chiều trạng thái, rồi ghi thêm lịch sử.
5. Bệnh nhân tải lại cổng của mình và thấy trạng thái mới, vì cả hai bên đọc cùng file SQLite.
