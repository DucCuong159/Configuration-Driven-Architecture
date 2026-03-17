# CDA Frontend Architecture — Tài liệu Trình bày Team Lead

## 1. Mục tiêu

Tài liệu này đề xuất thay đổi cấu trúc dự án Frontend ReactJS hiện tại, chuyển dịch từ việc **hard-code các màn hình Quản lý Asset (View & Edit)** sang kiến trúc **CDA (Configuration Driven Architecture)** linh hoạt hơn.

**Tech stack hiện tại:** ReactJS · TypeScript · Redux · Jest · React Testing Library.

---

## 2. CDA là gì? (SDUI vs CDUI)

CDA là kiến trúc sử dụng các file cấu hình (JSON/YAML) để quyết định việc hiển thị thay vì viết mã UI tĩnh. CDA có 3 nhánh chính, dự án chúng ta sẽ tập trung vào nhóm **CDUI**:

| Đặc điểm | CDUI (Config-Driven UI) | SDUI (Server-Driven UI) |
|---|---|---|
| **Ví dụ** | Form Builder, CMS Dashboard, **Asset Forms của team ta**. | Màn hình Home của Airbnb, Shopify, Spotify. |
| **Vị trí Config** | Quản lý bởi Dev/Ops, file JSON có thể đi liền với code Frontend hoặc fetch 1 lần từ CDN. | Sinh ra động từ phía Server, phụ thuộc vào user segment, A/B testing. |
| **Lợi ích chính** | Thêm mới một Asset Form (Model, Dataset...) mà không cần dev lại UI, chỉ thêm JSON. | Tự do thay đổi bố cục màn hình ngay lập tức không cần chờ Approval từ App Store (Mobile). |
| **Sự phù hợp** | ✅ **Phù hợp nhất với bài toán hiện tại.** Các Form Asset có tính cấu trúc cao. | ❌ Hơi cồng kềnh cho giai đoạn 1, phù hợp định hướng dài hạn. |

*(Nhánh thứ 3 là CDD - Config-Driven Development, thường dùng cho cấu hình DevOps/Infra pipeline, không nằm trong phạm vi giao diện).*

---

## 3. Kiến trúc Hệ thống (5 Lớp Cốt lõi)

Để biến file JSON thành màn hình tương tác, hệ thống cần xử lý qua một dây chuyền 5 lớp (Layers). Dây chuyền này chạy 1 chiều từ lấy dữ liệu đến khi User tương tác:

1. **Lớp 1: Network & Cache (Tải và Lưu trữ)**
   * *Nhiệm vụ:* Kéo file cấu hình JSON từ Server về. Bảo đảm UI không bị giật lag nếu đường truyền chậm.
   * *Cơ chế:* Nếu JSON không thay đổi trên Server, tận dụng cơ chế Cache (ETag/LocalStorage) để đọc lên lập tức thay vì tải lại.

2. **Lớp 2: Schema Parser (Trình Phân tích)**
   * *Nhiệm vụ:* Đọc toàn bộ nội dung file JSON và kiểm tra tính hợp lệ (Validate bằng AJV). Sau đó "thái" JSON ra làm 3 phần: (1) Cấu trúc giao diện [Layout], (2) Các biến tạm đang có [Variables], (3) Các quy tắc rẽ nhánh [Rules].

3. **Lớp 3: State & Rule Engine (Lưu trữ Trạng thái & Tính toán Logic)**
   * *Nhiệm vụ:* Lưu dữ liệu User đang gõ tạm vào **Redux Store**. Đồng thời, **Rule Engine** sẽ chạy nền, liên tục đánh giá các quy tắc (Ví dụ: `age > 18` thì cho hiện ô nghề nghiệp) bằng thư viện toán tử học (như JsonLogic).

4. **Lớp 4: Rendering Engine (Động cơ Hiển thị)**
   * *Nhiệm vụ:* Cầm kết quả Cấu trúc của Lớp 2 và Trạng thái của Lớp 3 để vẽ ra DOM thực tế. Nó đóng vai trò "người đi chợ", thấy config ghi `type="button"`, nó chạy vào `Component Registry` (Kho chứa UI) lấy `<Button />` ra xài.

5. **Lớp 5: Action Resolver (Bộ Xử lý Tương tác)**
   * *Nhiệm vụ:* Khi User bấm "Lưu", hay cuộn chuột, Lớp này bắt lấy sự kiện (Event), phân dịch nó thành các mảnh lệnh (Action). Ví dụ: `[ { action: "VALIDATE" }, { action: "API_CALL", url: "/abc" } ]` và điều phối đi thực thi.

---

## 4. Cấu trúc Thư mục Đề xuất

Kiến trúc thư mục được chia thành **4 khối chức năng phân tách trách nhiệm chặt chẽ**:

```text
src/
├── core/               # Khối 1: Trái tim Hệ thống (Core Engine)
│                       # → Tuyệt đối không chứa logic nghiệp vụ đặc thù dự án.
│                       # → Chứa Renderer, Parser, Action Resolver, Rule Engine.
│ 
├── widgets/            # Khối 2: Kho Gạch Xây Hình (UI Components)
│                       # → Đây là các "Dumb Components" (TextInput, Button...).
│                       # → Chỉ nhận Props hiển thị và phát ra HTML Events. Không tự call API.
│ 
├── store/              # Khối 3: Não Bộ Trạng Thái (Redux State)
│                       # → Nơi cấu hình Redux Store (cdaSlice.ts). 
│                       # → Giữ state tạm của Form, trạng thái loading từng field.
│ 
└── schema/ & hooks/    # Khối 4: Nơi Lắp Ráp & Ứng Dụng
                        # → 'schema/': Chứa cụ thể các file JSON (model.json, service.json).
                        # → 'hooks/': Các Custom Hooks kết nối Engine (core) với React App hiện tại.
```

---

## 5. Event/Action Handling (Case Study Thực tế)

Hệ thống CDUI dựa vào việc map Event người dùng (onClick, onChange) thành các chuỗi Action khai báo trong JSON.

### Case 1: Tương tác nhập liệu cơ bản (Simple Change)
> **Tình huống:** User gõ vào một ô `TextInput` tên Asset.

- **Dòng chảy:** `onChange(value)` → dispatch action `SET_FIELD_VALUE` lên Redux.
- **Render:** Redux Store cập nhật, ô Input `<NodeRenderer />` tương ứng re-render hiển thị chữ vừa gõ. Các phần khác của màn hình **đứng im**. Không cần Rule Engine.

### Case 2: Ẩn hiện Field liên đới (Show/Hide Dependency)
> **Tình huống:** Nếu user chọn `inputType="image"`, hệ thống mới cho hiện field `imageFormat`.

- JSON Config:
  ```json
  {
    "id": "imageFormat",
    "type": "select",
    "showIf": { "===": [{ "var": "state.inputType" }, "image"] }
  }
  ```
- **Dòng chảy:** User đổi select `inputType` → Redux nhận giá trị `"image"`.
- Rule Engine "ngửi" thấy Redux vừa đổi, nó chọc vào evaluate cục `showIf` của biến `imageFormat` → Kết quả `=` `true`.
- Engine cấp lệnh cho Node chứa `imageFormat` mount và hiển thị lên UI.

### Case 3: Kích hoạt tải dữ liệu liên đới (Fetch Data Trigger)
> **Tình huống:** Chọn `Quốc gia` là Việt Nam, Dropdown `Tỉnh thành` lập tức gọi API tải danh sách theo "VN".

- JSON Config:
  ```json
  {
    "id": "province",
    "type": "select",
    "fetchOptions": {
      "endpoint": "/api/provinces",
      "params": { "country": "$state.country" },
      "triggerOn": ["country"]
    }
  }
  ```
- **Dòng chảy:** Giá trị `country` thay đổi trên Redux. `ActionResolver` nhận diện đây là field nằm trong mảng `triggerOn` của `province`.
- Nó trigger một side-effect (middleware) gọi API đến `/api/provinces?country=VN`.
- Sau khi có kết quả, bắn tiếp lệnh `SET_OPTIONS` cập nhật Data Source thẳng vào Widget Select của `province`.

### Case 4: Logic Nghiệp vụ Phức tạp (Custom Hành vi)
> **Tình huống:** Quy định siêu loằng ngoằng: "Nếu type là Model, Framework là TensorFlow, Dung lượng vượt 1GB → Ẩn nút Submit, bôi đỏ ô Type, cảnh báo dung lượng". Việc này viết bằng toán tử JSON rất ức chế và khó maintain.

- Giải pháp là Engine nhường lại quyền kiểm soát, cho phép Developer viết Code thực thụ **(Quy tắc 80/20: JSON lo 80% case phổ thông, Code lo 20% cá biệt)**.
- **Developer đăng ký Custom Action ở Frontend:**
```typescript
ActionResolver.register("VALIDATE_LARGE_TF_MODEL", (payload, dispatch, getState) => {
  const { type, framework, size } = getState();
  if (type === 'Model' && framework === 'TensorFlow' && size > 1_000_000) {
    dispatch(disableNode("submitBtn"));
    dispatch(showWarning("Cảnh báo dung lượng"));
  }
});
```
- Trên JSON chỉ cần khai báo "gọi":
```json
{ "events": { "onChange": [{ "action": "VALIDATE_LARGE_TF_MODEL" }] } }
```

### Case 5: Luồng Tác vụ Dây chuyền (Chain of Effects)
> **Tình huống:** Khi bấm nút Submit → Validate Toàn bộ form → (Đúng) Gọi API Lưu → (Lưu xong) Về trang chủ.

- Các Action khai báo trên JSON dưới dạng mảng **thực thi tuần tự**:
```json
{
  "events": {
    "onClick": [
      { "action": "VALIDATE_ALL" },
      { "action": "API_CALL", "endpoint": "/assets", "method": "POST", "body": "$formData",
        "onSuccess": [ { "action": "NAVIGATE", "url": "/home" } ],
        "onError": [ { "action": "SHOW_TOAST", "message": "Failed to save" } ]
      }
    ]
  }
}
```

---

## 6. Tối ưu Hiệu năng (Performance Deep Dive)

Dựng Component tự động bằng đệ quy rất dễ chết yểu về performance. Hệ thống phải xử lý triệt để 4 vấn đề sau:

### Vấn đề 1: Form lớn nhập liệu bị "Cứng ngắc" (Over-rendering Component)
- **Hiện trạng:** Form 50 fields, Redux lưu 1 cục cục bộ. Gõ 1 chữ vào ô "Tên", Redux dispatch → React hiểu state bị dơ → **Cả 50 fields bị đập đi vẽ lại** làm lag JS Thread.
- **Giải pháp Cơ chế Node Binding (`reselect`):** Engine tạo Component bọc viền `<NodeRenderer id="fieldName" />`. Hàm bắt state `useSelector` của Redux dùng kèm `createSelector` để memoize. Khi Redux bắn tín hiệu, chỉ có Node của ô "Tên" thấy mẩu data nhỏ xíu của nó đổi. 49 thằng kia phát hiện data của mình không đổi, React áp dụng cơ chế `React.memo` (đứng im không tham gia quy trình vẽ).
- *PoC:* Demo React DevTools Profiler tick "Highlight updates" - Khi gõ chữ, chỉ đúng vùng viền sát Input nháy xanh.

### Vấn đề 2: Treo hình khi mới mở Trang (UI Thread Blocking)
- **Hiện trạng:** Cấu hình JSON có 5,000 dòng. Parse toàn bộ 5,000 dòng đổ vào cây React ảo ngay Tích tắc đầu tiên làm trình duyệt đứng vài giây.
- **Giải pháp Parse Từng Phần (Lazy Parse):** Giao diện phức tạp thường nằm trong Tabs / Accordions. Chỉ parse và mount đoạn JSON thuộc Tab mặc định ban đầu. Các nhánh còn lại đánh dấu `isSuspended=true`, khi User click mở tab số 2, Parser mới duyệt tiếp cục Config của Tab 2.
- *PoC:* So sánh chỉ số Time to Interactive (TTI) của Lighthouse giữa lúc render toàn cây vs lúc render từng tab.

### Vấn đề 3: Thời gian đợi cục Config (Network Letency)
- **Hiện trạng:** Người dùng bấm "F5" dính màn hình chờ xoay quay vì phải đợi fetch file JSON, dù form đó vẫn y ngày hôm qua.
- **Giải pháp HTTP ETag & Local Caching:** Backend cấu hình trả mã băm ETag đính lên Header file JSON. Ở lần gọi thứ 2, Frontend hỏi: *"Lấy file có mã XYZ nè, ổng đổi chưa?"*. Backend phán: *"Chưa đổi" (Mã 304 Not Modified)*. API Payload lúc này mất **0 bytes** truyền mạng, Client khựi file từ ổ cứng lên xài không độ trễ.

### Vấn đề 4: Tải "rác" không dùng (Bundle Bloat)
- **Hiện trạng:** `ComponentRegistry` có sẵn các "món ăn chơi" hạng nặng (Map Viewer, Video Player, Code Editor). Kéo theo Chunk JS khổng lồ.
- **Giải pháp Bundle Code-Splitting (`React.lazy`):** Trong kho Registry chỉ chứa Function Factory chỉ đường: `{ "video": React.lazy(() => import('./VideoWidget')) }`. Parser quét toàn bộ file JSON không thấy tag `"video"` nào. Chunk JS của Video không bao giờ được Network tải xuống cho đến khi có một Form Asset nào đó cần cấu hình nó.

---

## 7. Chiến lược Kiểm thử (Testing Strategy)

Việc áp dụng Jest & React Testing Library (RTL) sẽ được chia lớp ngang, thay vì test mù:

| Mảng Test | Output cần đảm bảo | Tool Test đề xuất |
|---|---|---|
| **Schema Validation** | Chặn lại và báo lỗi cấu trúc ngay nếu Config JSON viết sai (thiếu id, sai type field). | Unit Test (**Jest** vs Data gốc) |
| **Logic & Rule Engine** | Evaluate chính xác các hàm nhúng jsonLogic lớn nhó (`>`, `<`, `in`, `==`) qua mọi edge cases. | Unit Test Mảng bảng (**Jest**) |
| **State Reduction** | `cdaSlice` reducer xử lý data (mảng/object sâu) không bị sai reference. | Unit Test (**Jest**) |
| **Widget UI Render** | Một Node TextInput render đúng class, màu, thuộc tính nhận từ Props config mẫu. | Component Snapshot (**RTL**) |
| **Node Resolver Engine** | Bơm 1 Config đơn giản gồm: "Input rỗng -> Ấn lỗi". RTL click vào nút, Check xem store báo lỗi ko. | Integration Mạch dọc (**RTL**) |
| **DOM Perf Benchmark** | Ép hàm loop tạo mock JSON 200 nodes, kiểm tra render duration có <= ~100ms. | React Test Profiler API / Playwright |

---

## 8. Lộ trình Triển khai (Strangler Migration Pattern)

Không xoá code cũ đập đi xây lại cái mới để tránh rủi ro vỡ luồng kinh doanh (Big Bang). Thay vì vậy, ta bóp nghẹt hệ thống cũ từ từ:

- **Giai đoạn 0 (Audit & POC):** Phân tích Form quản lý Model Asset (đang nhức nhối nhất), list ra các type component. Tạo 1 file `model.json` mô phỏng bằng tay trên giấy.
- **Giai đoạn 1 (Foundation):** Đội ngũ Frontend Architect dựng Khối 1 (core engine) và 5 Fields cơ bản nhất (Text, ID, Select, Button, Container). Cắm Redux Store và chạy qua test nội bộ.
- **Giai đoạn 2 (A/B Pilot):** Đưa Form Model của CDA vào chạy song song. Phân quyền cho một vài User Pilot test tính linh hoạt, còn các form Asset khác (Dataset, Agent) vẫn là form hard-code cũ.
- **Giai đoạn 3 (Scale Out):** Bơm dần các Widget đặc thù (TagsInput, DateRange). Migrate cuốn chiếu các form Asset còn lại bằng cách dịch chúng sang JSON.
- **Giai đoạn 4 (Clean up):** Khi file JSON cuối cùng hoạt động, dọn dẹp nhổ bỏ toàn bộ hàng chục ngàn dòng code Form hardcode ở repo cũ để lấy lại Performance cho Web app.

---

## 9. Đề xuất Tăng cường Hệ thống (Cơ chế Fallback - Graceful Degradation)

**Vấn đề:** Sau khi triển khai xong, một ngày nọ Backend tự ý deploy file JSON cho Form mới, chèn vào một Component tên là `type="3D_Viewer"`. Frontend team 2 ngày sau mới làm cái này. Lúc này Production Website bị Frontend ném Error sập trắng trang (White Screen of Death).

**Giải pháp (Kiến trúc An toàn):**
1. **Bọc Lưới An Toàn (Error Boundaries):** Động cơ duyệt cây của Frontend luôn được bọc trong bộ lọc. Lúc đi tìm hàm `3D_Viewer` trong Kho mà hàm rỗng (Lookup Failed), hệ thống không sập. 
2. **Hiển thị Thay thế Kín đáo:** Nó lặng lẽ in ra một khối UI mặc định: *"Tính năng này yêu cầu cập nhật"* (ẩn với End-user, chỉ báo vàng với tài khoản Admin). Render engine vẫn bình tĩnh vẽ tiếp các Input Text, Button kế dưới nó.
3. **Cảnh báo (Telemetry Log):** Hệ thống Lớp 5 Action âm thầm gửi 1 chuỗi log về Chatbot Telegram/Slack của Tech Lead: *"(Warning): Client Ver 1.4 vừa fetch phải Widget `3D_Viewer` nhưng Registry không có."* Team có ngay chỉ định task cần code bổ sung vào Frontend.
