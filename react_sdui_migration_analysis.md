# Phân tích Kiến trúc Server Driven UI (SDUI) & Giải pháp Migrate cho ReactJS

Tài liệu này tổng hợp các kiến thức chuyên sâu về Configuration Driven Architecture (CDA) / Server Driven UI (SDUI), giải pháp chuyển đổi từ dự án ReactJS thông thường sang kiến trúc SDUI, và những bài học rút ra từ kiến trúc mã nguồn của DivKit Android.

## 1. Giải pháp Migrate dự án ReactJS sang kiến trúc SDUI

Quá trình chuyển đổi sang SDUI không phải là "đập đi xây lại", mà là hành trình **chuyển đổi tư duy từ "Hard-code UI layout" sang "Render UI từ Data"**. Dưới đây là lộ trình từng bước:

### Bước 1: Xây dựng Component Registry (Từ điển tỷ lệ 1-1)
*   **Mục tiêu:** Tập hợp các UI components hiện có (Button, Input, Card, Modal, Table...) thành các "Dumb Components" (chỉ nhận props hiển thị, không chứa logic gọi API hay điều hướng).
*   **Hành động:** Tạo một `Registry Object` để ánh xạ giữa chuỗi định danh từ Server và React Component thực tế.
    *   *Ví dụ:* `const ComponentRegistry = { "text": Typography, "button": CustomButton, "container": Box }`.

### Bước 2: Viết SDUI Engine Core (Trái tim của hệ thống)
*   **Mục tiêu:** Tạo bộ Renderer để phân tích cấu trúc cấu hình và dựng thành giao diện.
*   **Hành động:** Viết một Component đệ quy nhận vào schema JSON và trả về cây Component tương ứng từ Registry.
    *   *Ví dụ:* `<SduiRenderer schema={jsonFromServer} />` sẽ lặp qua schema để map `type: "button"` thành `<CustomButton {...props} />`.

### Bước 3: Tích hợp State Management và Rule Evaluator
*   **Global Store:** Form Data hay State cục bộ của màn hình phải được quản lý tập trung (như dùng *Zustand*, *Redux*).
*   **Rule Engine:** Tích hợp một bộ xử lý logic nhỏ ở frontend (như `JsonLogic` hoặc evaluate AST strings) để đánh giá các biểu thức động từ server (ví dụ: *Ẩn/hiện button khi form có lỗi* hoặc *nếu age > 18*).

### Bước 4: Chuyển dịch API & Server
*   Thay vì gọi API chỉ lấy dữ liệu (`GET /users`), Server giờ sẽ trả về bao gồm cả **Layout schema** (cấu trúc UI) và **Data** (dữ liệu điền vào UI).

### Bước 5: Áp dụng tiệm cận (Strangler Pattern)
*   Không cần chuyển đổi toàn bộ dự án cùng lúc. Có thể giữ nguyên luồng cũ, và áp dụng SDUI cho các module cần thay đổi cấu trúc thường xuyên như: Trang chủ (Home), Dashboard, hoặc các luồng Forms động.

---

## 2. Thiết kế hệ thống SDUI & Vai trò các thành phần

Một hệ thống SDUI chuẩn thường bao gồm 3 lớp chính với sự giao tiếp chặt chẽ:

### A. Phía Server (SDUI Backend)
1.  **Schema & Component Builder (Trình tạo Cấu hình):** Tổng hợp UI Layout để trả về cho client. Hệ thống cân nhắc profile user (role, thiết bị, A/B Testing) để quyết định output JSON.
2.  **Action / Business API:** Nơi xử lý logic nghiệp vụ. Server không gửi code JavaScript mà gửi chuỗi cấu hình hành động (VD: đi tới trang nào, gọi API nào tiếp theo...).

### B. Giao thức giao tiếp (Khối JSON Payload)
Chuỗi JSON Payload là linh hồn của hệ thống, thường chia làm các phần:
*   **Data/State:** Dữ liệu thuần.
*   **Layout Tree:** Mô tả cấu trúc giao diện (có thể dạng phân cấp lồng nhau hoặc phẳng có key).
*   **Events/Actions:** Gắn với các hành động tương tác (onClick, onScroll).

### C. Phía Client (SDUI Frontend - ReactJS)
1.  **Network & Cache Layer:** Tải JSON từ Server, tối ưu hóa bằng ETag/Cache cục bộ để không phải render lại toàn bộ trang nếu cấu hình không đổi.
2.  **Parser / Mapper:** Phân tích JSON, biến các cặp key-value thành thuộc tính `props` an toàn để truyền cho React.
3.  **Component Registry:** Tập hợp các UI Components đã dựng sẵn.
4.  **Action Resolver (Bộ giải quyết Sự kiện):** Lắng nghe các sự kiện do người dùng tạo ra (click, cuộn). Khi user hành động, resolver sẽ đọc payload cấu hình như `{ action: "NAVIGATE", url: "/home" }` và gọi hàm router React tương ứng.
5.  **State/Rule Engine:** Đánh giá các logic hiển thị/ẩn, thay đổi dữ liệu mà không cần gửi request lên server (phản hồi ngay lập tức).

**Luồng làm việc (Workflow):**
`[Client Yêu cầu] -> [Server sinh JSON UI] -> [Client Tải JSON] -> [Parser biên dịch] -> [Ánh xạ Registry] -> [Hiển thị React Component] -> [User tương tác] -> [Action Resolver cập nhật State/Gọi API]`

---

## 3. Kiến trúc Source Code DivKit (Android) - Case Study Điển hình

Mã nguồn của DivKit Android minh họa xuất sắc các định nghĩa và tư tưởng của SDUI/CDA:

1.  **Sự phân tách Execution Engine và Cấu hình (Separation of Concerns):**
    *   **Module `div-json` / `div-data`:** Đóng vai trò là Parser. Đọc và phân tách JSON template/card thành Object `DivData` an toàn.
    *   **Module `div-core` / `Div2View`:** Đóng vai trò là Renderer (Execution Engine), chuyển hoá dữ liệu thành View Native Android.

2.  **Dynamic Logic không cần Server (Xử lý tại Client):**
    *   Sự xuất hiện của **`div-evaluable`** đóng vai trò là Expression/Rule Engine. Nó đánh giá các biến động (`if`, tính toán logic, điều kiện bật tắt) một cách an toàn mà không dính rủi ro bảo mật (thay vì evaluate code thực tế).
    *   Module **`div-states`** dùng để hoán đổi state ngay nội bộ component mà không cần gọi network.

3.  **Khả năng mở rộng (Extensibility) qua Registry Vô tận:**
    *   Khái niệm "Component Registry" được thể hiện qua **`DivCustomContainerViewAdapter`**. DivKit chia ra các gói render độc lập như `div-video`, `div-lottie`, `div-rive`, `div-markdown`.
    *   Người dùng (Client Developer) khởi tạo `DivConfiguration` có thể "inject" các custom adapter này để mở rộng khả năng hiển thị của Engine mà không cần sửa core.

4.  **Xử lý sự kiện với Action Resolver:**
    *   DivKit sở hữu interface `DivActionHandler` để chặn (intercept) mọi tương tác (click, long tap). Thay vì hardcode hàm chuyển hướng, nó phát ra event dựa trên URL kiểu `div-action://some_action`. Native App nhận event và tự quyết định logic theo Business thực tế.

**Tổng kết:** Module hóa rành mạch (Parser, Core Renderer, Evaluator, Custom Registry, Action Resolver) là chìa khóa để kiến trúc SDUI bền vững. Nếu áp dụng tư tưởng kiến trúc này của DivKit vào dự án ReactJS SDUI, hệ thống sẽ cực kỳ mạnh mẽ, dễ bảo trì và mở rộng ở cấp độ doanh nghiệp.
