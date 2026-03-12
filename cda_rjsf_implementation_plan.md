# Kế hoạch Triển khai (Implementation Plan) React JSON Schema Form (RJSF) cho CDA

Tài liệu này đóng vai trò là "kim chỉ nam" cho đội ngũ phát triển sau khi đã quyết định lựa chọn **React JSON Schema Form (RJSF)** làm công cụ cốt lõi để xây dựng Server-Driven UI (CDA) áp dụng riêng cho các module: **Quản lý Asset Card, Cập nhật Activity, và Đánh giá Review**.

---

## Giai đoạn 1: Thống nhất "Hợp đồng Component" (API Contract) giữa Frontend & Backend

Để Frontend render được UI, Backend buộc phải cung cấp đủ 1 payload JSON chuẩn mực.

### 1.1. Cấu trúc Payload chuẩn cần thống nhất
Mọi API trả về cấu hình Form (Ví dụ: `GET /api/forms/asset-create` hoặc `GET /api/forms/review-submit`) đều phải tuân thủ format:

```json
{
  "schema": {
    "title": "Tạo mới Asset",
    "type": "object",
    "required": ["assetName", "category"],
    "properties": {
      "assetName": { "type": "string", "title": "Tên tài sản" },
      "category": {
        "type": "string",
        "title": "Danh mục",
        "enum": ["laptop", "monitor", "mouse"],
        "enumNames": ["Máy tính xách tay", "Màn hình rời", "Chuột quang"]
      }
    }
  },
  "uiSchema": {
    "assetName": {
      "ui:autofocus": true,
      "ui:placeholder": "Nhập tên tài sản..."
    },
    "category": {
      "ui:widget": "radio" 
    }
  },
  "formData": {
    "category": "laptop"
  }
}
```

### 1.2. Trách nhiệm các bên
*   **Backend:** Chịu trách nhiệm thiết kế `schema` (quyết định form có ô nào, validate gì) và `uiSchema` (quyết định ô đó là dropdown hay radio, label là gì).
*   **Frontend:** Nhận dữ liệu "Sight unseen", thả vào component `<Form>` của RJSF và hứng kết quả `onSubmit` trả lại đúng định dạng Backend cần.

---

## Giai đoạn 2: Xây dựng Bộ "Custom Widgets & Templates" (Design System)

Các thẻ input mặc định của RJSF là HTML5 nguyên bản, rất thô sơ. Dự án cần giao diện đồng nhất (MUI, Ant Design, Bootstrap...).

### 2.1. Cài đặt Theme
*   Sử dụng các package có sẵn của RJSF tương ứng với UI library đang dùng (Ví dụ: `@rjsf/mui`, `@rjsf/antd`, v.v.).

### 2.2. Xây dựng Custom Widgets đặc thù nghiệp vụ
Bạn sẽ không thể dùng thẻ input text cho mọi thứ. Cần lập trình (hardcode) các Widget sau trên Frontend, sau đó Backend chỉ cần gọi tên qua `ui:widget`:

*   **`ReviewStarWidget`**: Hiển thị 5 ngôi sao thay cho input số (chuyên dùng cho form Review).
*   **`AssetPickerWidget`**: Có ô search có khả năng gọi API (debounce) lấy danh sách Asset Card hiện có (cho form Activity liên kết Asset).
*   **`ImageUploadWidget`**: Tích hợp luồng upload ảnh lên S3/Cloudinary -> trả về URL chuỗi (Dành cho việc user chụp ảnh hỏng hóc trong Activity).

*Đăng ký widget vào form:*
```jsx
const widgets = {
  ReviewStar: ReviewStarWidget,
  AssetPicker: AssetPickerWidget,
  ImageUpload: ImageUploadWidget
};

<Form schema={schema} uiSchema={uiSchema} widgets={widgets} />
```

### 2.3. Viết Custom Layout Templates (ObjectFieldTemplate)
Mặc định RJSF dồn form thành 1 cột dọc dài ngoằng. Cần viết `<ObjectFieldTemplate>` tùy biến để chia Grid (VD: 2 cột, 3 cột) hoặc chia thành các Tabs, Accordion dựa trên config từ `uiSchema`.

---

## Giai đoạn 3: Phác thảo luồng xử lý "Logic Động" (Side Effects & Dependencies)

Giao diện Form không tĩnh. Chúng phản ứng khi người dùng tương tác.

### 3.1. Logic tĩnh (Thay đổi giao diện dựa trên giá trị)
Sử dụng tính năng `dependencies` của chuẩn JSON Schema ở Backend.
*   **Ví dụ:** Trong form cấu hình hỏng hóc, nếu người dùng tick vào "Có lỗi phần cứng", form mới hiện ra ô "Loại lỗi phần cứng". Toàn bộ logic này khai báo hoàn toàn trong `schema` JSON. Backend điều khiển, Frontend không cần if-else.

### 3.2. Logic gọi API động (Side-effects)
JSON Schema không ép gọi API khi điền form. 
*   **Cơ chế xử lý:** Frontend phải lắng nghe event `onChange` của RJSF, bắt được dữ liệu (formData) thay đổi.
*   **Ví dụ:** User gõ mã nhân viên vào form -> Frontend bắt được `formData.employeeId` -> Gọi API lấy thông tin nhân viên -> Ghép kết quả (`employeeName`, `department`) đè vào phần `formData` và `schema` hiện tại để form tự động fill dữu liệu.

---

## Giai đoạn 4: Thiết kế Lưu trữ Schema (Phía Backend & Database)

Để thực sự là "Configuration Driven", các cấu hình JSON không nên bị "hardcode" bên trong source code của Backend, mà nên được quản lý linh hoạt.

### 4.1. Cấu trúc Database lưu trữ Form Config
Tạo một bảng/collection (VD: `FormDefinitions`) để quản lý các mẫu Form:
*   `form_id`: (VD: "asset_create", "review_submit")
*   `version`: (Mỗi form có thể có nhiều bản)
*   `schema`: (Payload JSON Schema quy định cấu trúc)
*   `ui_schema`: (Payload UI Schema quy định hiển thị)
*   `status`: (Draft, Active, Archived)

### 4.2. Quản lý Phiên bản (Versioning) cực kỳ quan trọng
Phải đảm bảo Backwards Compatibility (Tương thích ngược). 
*   Nếu thay đổi cấu trúc của form Review (Thêm trường bắt buộc `attachment`), Backend tạo Version `v2`.
*   Mobile App bản cũ hoặc thao tác đang làm dở gọi api lấy schema cũ vẫn sẽ nhận bản `v1` để không bị crash.

---

## Giai đoạn 5: Thực thi Proof of Concept (PoC) Nội bộ

Đừng tốn thời gian viết toàn bộ hệ thống ngay. Hãy bắt đầu bằng một Demo nhỏ.

1.  **Mục tiêu:** Chứng minh Frontend và Backend ghép nối được thông qua JSON.
2.  **Khởi tạo dự án:** `npx create-react-app sdui-poc` hoặc dùng Vite.
3.  **Mô phỏng Backend:** Tạo 1 thư mục Mock chứa file data `asset-update.json` thay vì xây Backend thật.
4.  **Tích hợp:** Dùng React `fetch` file JSON đó, nạp vào thư viện RJSF.
5.  **Test Custom Widget:** Viết thử 1 component `StarRatingWidget` đơn giản. Cấu hình bên trong `uiSchema` để RJSF gọi widget này lên.
6.  **Review PoC:** Check xem khi bấm "Submit", output `formData` có trả ra Object format đúng như mong đợi không. Nếu "Xanh", bắt đầu code production!
