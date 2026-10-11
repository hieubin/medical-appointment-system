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

## Nếu giảng viên hỏi công nghệ

Giao diện viết bằng React. Máy chủ viết bằng Express. Dữ liệu để trong SQLite. Mật khẩu được băm, không lưu dạng thường. Trang quản trị chỉ mở khi tài khoản là admin.
