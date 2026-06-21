# Kế Hoạch Thiết Kế Lại Giao Diện Kiến Thức - Hệ Thống Thiết Kế Adora

Tái thiết kế toàn bộ giao diện thư viện kiến thức tích phân (`TheoryPage.jsx`) dựa trên **Adora Design System** (Ấn tượng bảo tàng đằng sau kính mờ, sử dụng các tone màu pastel, font chữ hiện đại, góc bo tròn siêu rộng và các điểm nhấn vẽ tay squiggle).

---

## Các Thay Đồi Đề Xuất

### [MODIFY] [TheoryPage.jsx](file:///c:/Users/giaba/source/repos/4/Ky2/integral_models/web-ui/src/pages/TheoryPage.jsx)

- **Cấu hình Tokens & CSS Variables (Adora)**:
  - Khai báo các custom properties cục bộ trong thẻ `<style>` của component để tránh ảnh hưởng đến các trang khác:
    - `--color-electric-violet: #592eff;` (Màu hành động chính, viền active)
    - `--color-midnight-plum: #21164c;` (Màu tiêu đề chính, tạo sắc tím trầm thanh lịch)
    - `--color-obsidian-charcoal: #353241;` (Màu chữ nội dung, nét vẽ cơ bản)
    - `--color-slate-smoke: #5f5f69;` (Màu phụ, chú thích nhỏ)
    - `--color-pearl-mist: #e0e0db;` (Viền siêu nhỏ cho card và input)
    - `--color-soft-concrete: #eeeeee;` (Màu nền phụ hoặc các nút recessed)
    - `--color-pure-white: #ffffff;` (Màu nền chính của trang và các thẻ card)
    - `--color-sky-tint: #bcf2ff;`, `--color-lime-spritz: #dfff9d;`, `--color-cotton-candy: #ffaae6;` (Các gam màu pastel trang trí).
- **Typography**:
  - Tiêu đề sử dụng font `Plus Jakarta Sans` hoặc `General Sans` (weight 700) với khoảng cách chữ chặt chẽ `-0.02em` và màu Midnight Plum.
  - Body text sử dụng màu chữ Obsidian Charcoal (`#353241`) mang tông tím than trầm ấm thay vì đen thuần.
- **Shapes & Bo Góc (Adora Border Radii)**:
  - Thiết lập bo tròn thẻ lớn (Cards) là `40px` tạo sự mềm mại, sang trọng.
  - Các nút hành động (Buttons) bo tròn nhẹ `8px`.
  - Các nhãn lọc (Badges) bo tròn dạng sân vận động `200px`.
  - Khung giới thiệu chính (Hero Product Frame) bo tròn rộng `64px` đặt trên nền sơn dầu loang cực quang.
- **Hiệu Ứng Squiggle Underline**:
  - Tích hợp một hình vẽ Squiggle (nét lượn sóng vẽ tay bằng SVG) làm điểm nhấn gạch chân dưới các từ khóa quan trọng của tiêu đề lớn.
- **Bố Cục Trực Quan**:
  - Giữ nguyên cấu trúc 7 phân hệ lý thuyết nhưng sắp xếp gọn gàng trong các khối thẻ bo tròn rộng 40px, phân tách bằng khoảng cách trống thoáng đãng (80px), không lạm dụng các nét gạch chia ngang thô kệch.

---

## Kế Hoạch Xác Minh Giao Diện

### Kiểm tra Thủ công
1. Truy cập trang `/theory`.
2. Kiểm tra tông màu chủ đạo: Nền trang chủ là màu trắng ngà kết hợp các dải màu loang cực quang pastel dịu mắt ở phần Hero.
3. Kiểm tra bo góc của thẻ bài học (phải bo tròn rộng 40px) và nút bấm (bo tròn nhẹ 8px).
4. Kiểm tra nét lượn sóng Squiggle dưới chữ "Giải Tích Phân" có hiển thị đúng màu pastel hồng Cotton Candy và lấp dưới chân chữ một cách tinh tế không.
