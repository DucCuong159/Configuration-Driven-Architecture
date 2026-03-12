# Kiến thức Chuyên sâu: Triển khai Configuration Driven Architecture (CDA) Thực tế

Để triển khai một kiến trúc CDA (hay Server-Driven UI - SDUI) đáp ứng được các dự án quy mô lớn, chúng ta cần giải quyết những bài toán hóc búa về thiết kế cấu trúc dữ liệu, quản lý trạng thái, và tối ưu hóa hiệu năng. Dưới đây là cái nhìn sâu hơn vào các khía cạnh kỹ thuật cốt lõi:

## 1. Thiết Kế Schema (Schema Design Architecture)

Schema là linh hồn của CDA, đóng vai trò như bản thiết kế (blueprint). Có hai trường phái thiết kế schema chính:

### a. Hierarchical (Cấu trúc phân cấp/lồng nhau)
Schema phản ánh chính xác cây DOM của UI.
```json
{
  "type": "Screen",
  "children": [
    {
      "type": "NavigationBar",
      "props": { "title": "Dashboard" }
    },
    {
      "type": "Form",
      "children": [
        { "type": "TextInput", "id": "username", "label": "Tên đăng nhập" }
      ]
    }
  ]
}
```
*   **Ưu điểm:** Dành cho các UI đơn giản, luồng dọc từ trên xuống dưới dễ duyệt bằng đệ quy (recursion).
*   **Nhược điểm:** Khó bảo trì khi UI phức tạp, lồng nhau quá sâu (Prop Drilling). 

### b. Flat & Keyed Configuration (Cấu trúc phẳng có Key)
Thay vì lồng ghép sâu, tất cả component được để trong một từ điển (dictionary / map).
```json
{
  "rootId": "screen_1",
  "components": {
    "screen_1": { "type": "Container", "childrenIds": ["nav_1", "form_1"] },
    "nav_1": { "type": "NavigationBar", "props": { "title": "Dashboard" } },
    "form_1": { "type": "Form", "childrenIds": ["input_user"] },
    "input_user": { "type": "TextInput", "props": { "label": "Tên đăng nhập" } }
  }
}
```
*   **Ưu điểm:** Hiệu năng truy xuất O(1), dễ dàng cập nhật độc lập một component mà không cần load lại cả cái cây. Mở đường cho các thư viện quản lý state như Redux hay Zustand.

## 2. Quản Lý Trạng Thái và Interactivity (State Management)

Làm sao để một file cấu hình thụ động có thể phản hồi tính tương tác của người dùng? (Ví dụ: Chọn dropdown "Quốc gia" -> Gọi API -> Cập nhật dropdown "Tỉnh/Thành").

*   **Bộ chứa trạng thái toàn cục (Global Context/State):** Trình biên dịch (Engine) phải cung cấp một `Context` hay `Store` giữ dữ liệu của cả màn hình. Các component sẽ đọc và ghi dữ liệu học theo ID.
*   **Event Handling qua Actions:** Schema cần định nghĩa rõ một "Hành động" (Action) sẽ làm gì.
```json
{
  "type": "Button",
  "props": { "label": "Lưu" },
  "events": {
    "onClick": [
      { "action": "VALIDATE_FORM", "targetId": "form_1" },
      { "action": "API_CALL", "endpoint": "/api/users", "method": "POST" }
    ]
  }
}
```
Engine ở Client sẽ có một "Action Resolver" (Bộ xử lý hành động) đọc các lệnh này và thực thi hàm tương ứng đã được lập trình sẵn.

## 3. Dynamic Logic & Rule Engine (Động cơ logic)

Không phải lúc nào cấu hình cũng tĩnh. Bạn cần xử lý các logic động: "ẩn input này nếu user chưa đủ 18 tuổi". Do JSON không chứa được hàm (functions), chúng ta sử dụng **Rule Engines**.

*   **JsonLogic:** Một tiêu chuẩn phổ biến để viết các biểu thức điều kiện bằng JSON.
```json
// Hiển thị nếu giá trị của biến "age" > 18
"showIf": {
  ">": [ { "var": "formData.age" }, 18 ]
}
```
*   **Expression Strings:** Dùng chuỗi evaluate (ví dụ như AST parser nhỏ) để thực thi. VD: `"showIf": "$state.age > 18"`. Client sẽ phân tích cú pháp chuỗi này một cách an toàn (tránh dùng `eval` trực tiếp rủi ro bảo mật).

## 4. Giao Tiếp Server - Client và Phiên Bản (Versioning)

Một trong những hạn chế khi server trả về schema (Server-Driven UI) là việc nâng cấp và tương thích:
*   **Component Registry Mismatch:** Điều gì xảy ra khi Server trả về `{ "type": "VideoPlayer" }` nhưng app Mobile trên máy người dùng là phiên bản cũ, chưa code component này? 
    *   *Cách giải quyết (Fallback/Graceful Degradation):* Luôn có một component mặc định (như "UpdateAppBanner") để hiển thị nếu gặp component lạ, yêu cầu người dùng nâng cấp.
*   **Caching & Hiệu năng:** Fetch metadata JSON mỗi lần load trang rất chậm. Phải sử dụng bộ đệm (LocalStorage/Cache). Giao thức kiểm tra phiên bản (ETag) giúp client biết khi nào JSON cấu hình trên server thay đổi để tải lại.

## 5. Hệ Sinh Thái và Công Cụ

Để CDA khả thi ở tầm doanh nghiệp, bạn không thể bắt business analyst (BA) hay đội Operation ngồi viết file JSON thủ công.
*   **CMS / Low-Code Builder:** Cần một giao diện kéo thả (Visual Builder) cho phép người dùng lắp ráp giao diện, chỉnh logic, sau đó hệ thống tự động xuất/lưu thành file cấu hình JSON chuẩn. (Giống cách Webflow hay Shopify Store builder hoạt động).
*   **Type Safety (An toàn kiểu dữ liệu):** Dùng `JSON Schema (AJV)` hoặc kết hợp `GraphQL` để kiểm tra tĩnh. Nếu thiếu trường bắt buộc, hệ thống không cho phép lưu cấu trúc config đó.

---
### Nguồn tham khảo Chuyên sâu (References)

1. **J. Ooi, WeWeb (2025).** *Server-Driven UI Pattern & Architectures*. Liên kết: [weweb.io](https://weweb.io/) (Nghiên cứu về Schema Design, Component Registry và Fallbacks).
2. **Shopify Engineering.** *Building Shop: A Server-Driven UI Architecture*. Liên kết: [shopify.engineering](https://shopify.engineering/) (Ví dụ thực tế về CMS và giao diện kéo thả biên dịch thành SDUI).
3. **Apollo GraphQL.** *Server-Driven UI with GraphQL*. Liên kết: [apollographql.com](https://www.apollographql.com/) (Ứng dụng GraphQL cho việc kiểm tra tĩnh (Type Safety) trong dữ liệu Schema cấu hình).
4. **F. Husain.** *What is Config Driven UI?*. Liên kết: [faisalhusa.in](https://faisalhusa.in/) (Khái niệm về Structure Design cho Config UI).
5. **N. Ghasemi, Dev.to.** *Configuration-driven UI*. Liên kết: [dev.to](https://dev.to/) (Nguyên tắc thiết kế hệ thống phân cấp và phẳng của dữ liệu cấu hình).
