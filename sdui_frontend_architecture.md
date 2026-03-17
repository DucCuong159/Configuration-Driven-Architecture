# CDA Frontend Architecture

---

## 1. Bối cảnh & Động lực

Hệ thống hiện tại triển khai các màn hình quản lý Asset (View & Edit) dưới dạng **hard-coded React components**. Mỗi Asset type mới (Model, Dataset, Service...) đòi hỏi một vòng phát triển đầy đủ: thiết kế UI, implementation, review, test và deploy. Cách tiếp cận này tạo ra gánh nặng technical debt khi số lượng Asset types tăng trưởng và yêu cầu thay đổi cấu trúc form liên tục.

Tài liệu này đề xuất migration sang kiến trúc **CDA (Configuration Driven Architecture)**, trong đó UI được định nghĩa qua JSON schema thay vì mã nguồn tĩnh. Mục tiêu là giảm chi phí phát triển tính năng mới và tăng khả năng tái sử dụng của rendering engine.

---

## 2. Phân loại Kiến trúc: CDUI vs SDUI

CDA bao gồm hai mô hình triển khai với đặc tính khác nhau:

| Tiêu chí                   | CDUI (Config-Driven UI)                                         | SDUI (Server-Driven UI)                                                |
| -------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Nguồn gốc config**       | Dev/Ops quản lý, phân phối qua CDN hoặc bundled cùng client     | Server sinh động theo context request (user segment, A/B test, device) |
| **Tần suất thay đổi**      | Theo release cycle, cần deploy khi cập nhật                     | Real-time, không cần client deploy                                     |
| **Độ phức tạp triển khai** | Thấp — client tự xử lý toàn bộ                                  | Cao — yêu cầu schema API contract giữa server và client                |
| **Ứng dụng phù hợp**       | Form builder, CMS, **Asset Management Forms**                   | Airbnb home feed, Shopify storefront, Spotify Now Playing              |
| **Phù hợp dự án hiện tại** | ✅ Phù hợp giai đoạn 1 — cấu trúc form Asset có schema xác định | 🔄 Định hướng dài hạn khi Server cần kiểm soát UI theo business rules  |

**Quyết định thiết kế:** Giai đoạn đầu áp dụng **CDUI** — config tĩnh, quản lý bởi team, fetch một lần và cache phía client. Kiến trúc được thiết kế để có thể chuyển tiếp sang SDUI mà không cần refactor engine.

---

## 3. Kiến trúc Hệ thống — 5-Layer Pipeline

Hệ thống được tổ chức thành 5 lớp xử lý tuần tự, theo nguyên tắc **single-responsibility** và **unidirectional data flow**. Mỗi lớp có interface rõ ràng, không phụ thuộc ngược.

```
[ JSON Config ] → Layer 1: Network & Cache
                → Layer 2: Schema Parser
                → Layer 3: State & Rule Engine
                → Layer 4: Rendering Engine
                → Layer 5: Action Resolver → [ User Interaction ]
```

---

### Layer 1 — Network & Gateway

- **Mục tiêu:** Truy vấn và lấy Schema JSON từ Backend/CDN qua HTTP (GET).
- **Xử lý lỗi:** Áp dụng cơ chế **Fail-fast**. Nếu fetch thất bại hoặc schema không tồn tại, hệ thống lập tức ngắt Pipeline và hiển thị Error State để tránh render data rác.

---

### Layer 2 — Schema Parser & Validator

**Mục tiêu:** Chuyển đổi và chuẩn hóa (Normalization) chuỗi JSON thô thành cấu trúc dữ liệu có cấu trúc (Typed Object). Đây là bộ lọc an ninh đảm bảo tính nhất quán của giao tiếp (Contract) giữa Backend và Rendering Engine.

**Nhiệm vụ cụ thể:**

- **Contract Enforcement:** Sử dụng **JSON Schema Validator(ex: AJV)** để xác thực cấu trúc chuẩn. Hệ thống sẽ ngay lập tức từ chối các phiên bản schema không tương thích, tránh runtime crash.
- **Decomposition (Phân tách dữ liệu):** Phân rã tệp JSON tập trung thành các module dữ liệu riêng biệt:
  - `layoutTree`: Cấu trúc cây giao diện cơ sở (topology). Các mảng `children` chỉ còn lưu tập hợp `id` của các node con.
  - `fieldMap`: Cấu hình tĩnh gốc (type, label, options) của từng field, được trải phẳng (flatten) dưới dạng một từ điển (Key-Value) với key là `id` để tra cứu O(1).
  - `initialState`: Gồm các giá trị mặc định (defaults) và metadata khởi tạo (blueprint) cho từng fieldId.
  - `conditionMap`: Lưu trữ các biểu thức logic (`showIf`, `enableIf`) dưới dạng chuỗi có thể đánh giá (Evaluable).
  - `validationMap`: Tập hợp các quy tắc kiểm tra tính hợp lệ (`required`, `pattern`, `custom`).
  - `permissionMap`: Định nghĩa quyền truy cập (View/Edit) cho từng field, thường được trả về dựa trên Role của người dùng.

**Design Note:** Layer 2 được thiết kế như một **Pure Function** — đảm bảo tính Idempotent (cùng input luôn cho cùng output).

**Ví dụ — dự án Asset Management:**

Input — raw JSON từ Layer 1:

```json
{
  "categories": [
    {
      "id": "asset_information",
      "label": "Asset Information",
      "subCategories": [
        {
          "id": "general",
          "label": "General",
          "fields": [
            {
              "id": "name",
              "type": "input",
              "label": "Name",
              "required": true
            },
            {
              "id": "summary",
              "type": "textarea",
              "label": "Summary",
              "required": true
            },
            {
              "id": "type",
              "type": "select",
              "label": "Type",
              "required": true,
              "options": ["Type A", "Type B", "Type C"]
            },
            {
              "id": "tags",
              "type": "input",
              "label": "Tags",
              "required": true
            },
            {
              "id": "task",
              "type": "select",
              "label": "Task",
              "required": true,
              "showIf": {
                "and": [
                  { "!=": [{ "var": "type" }, null] },
                  { ">": [{ "var": "tags.length" }, 0] }
                ]
              }
            },
            {
              "id": "assetUrl",
              "type": "input",
              "label": "Asset URL",
              "required": true
            },
            {
              "id": "version",
              "type": "input",
              "label": "Version",
              "required": true,
              "fetchOptions": {
                "endpoint": "/api/asset/version",
                "params": { "url": "${assetUrl}" },
                "triggerOn": ["assetUrl"]
              }
            }
          ]
        }
      ]
    }
  ],
  "permission": {
    "edit": {
      "name": true,
      "summary": true,
      "type": true,
      "tags": false,
      "task": false,
      "assetUrl": false,
      "version": false
    },
    "view": {
      "name": true,
      "summary": true,
      "type": true,
      "tags": true,
      "task": true,
      "assetUrl": true,
      "version": true
    }
  }
}
```

Output — sau khi Layer 2 xử lý:

```json
{
  "layoutTree": [
    {
      "id": "asset_information",
      "type": "category",
      "label": "Asset Information",
      "children": [
        {
          "id": "general",
          "type": "subCategory",
          "label": "General",
          "children": ["name", "summary", "type", "tags", "task", "assetUrl", "version"]
        }
      ]
    }
  ],
  "fieldMap": {
    "name": { "type": "input", "label": "Name" },
    "summary": { "type": "textarea", "label": "Summary" },
    "type": { "type": "select", "label": "Type", "options": ["Type A", "Type B", "Type C"] },
    "tags": { "type": "input", "label": "Tags" },
    "task": { "type": "select", "label": "Task" },
    "assetUrl": { "type": "input", "label": "Asset URL" },
    "version": { "type": "input", "label": "Version" }
  },
  "initialState": {
    "name": null,
    "summary": null,
    "type": null,
    "tags": [],
    "task": null,
    "assetUrl": null,
    "version": null
  },
  "conditionMap": {
    "task": {
      "showIf": {
        "and": [
          { "!=": [{ "var": "type" }, null] },
          { ">": [{ "var": "tags.length" }, 0] }
        ]
      }
    },
    "version": {
      "fetchOptions": {
        "endpoint": "/api/asset/version",
        "params": { "url": "${assetUrl}" },
        "triggerOn": ["assetUrl"]
      }
    }
  },
  "validationMap": {
    "name": { "required": true },
    "summary": { "required": true },
    "type": { "required": true },
    "task": {
      "required": {
        "and": [
          { "!=": [{ "var": "type" }, null] },
          { ">": [{ "var": "tags.length" }, 0] }
        ]
      }
    },
    "assetUrl": {
      "required": true,
      "rule": "url"
    },
    "version": { "required": true }
  },
  "permissionMap": {
    "edit": {
      "name": true,
      "summary": true,
      "type": true,
      "tags": false,
      "task": false,
      "assetUrl": false,
      "version": false
    },
    "view": {
      "name": true,
      "summary": true,
      "type": true,
      "tags": true,
      "task": true,
      "assetUrl": true,
      "version": true
    }
  }
}
```

- Layer 3 (Rule Engine) nhận `conditionMap` và `permissionMap` để kết hợp evaluate:
  - logic (`showIf/ enableIf`) AND quyền (`view` + `edit`) → hiện/ẩn/enable field.
  - `assetUrl` thay đổi → gọi API `version`.
- Layer 4 chỉ đọc `layoutTree` (cấu trúc) và `fieldMap` (ui gốc) để vẽ, không biết gì về logic điều kiện hay phân quyền.

---

### Layer 3 — State Management & Rule Engine

**Mục tiêu:** Lưu trữ giá trị người dùng nhập vào và thực thi các quy tắc logic được định nghĩa trong schema (hiện/ẩn field, fetch data...).

**Cơ chế khởi tạo:** Layer này tiếp nhận `initialState` từ Layer 2 để thực hiện **Hydrate (Đổ dữ liệu)** vào Store. Tại thời điểm này, `formData` và `fieldMeta` chính thức được "sinh ra" trong bộ nhớ.

**Hai thành phần:**

- **Redux Store** — lưu 2 loại dữ liệu tách biệt:
  - `formData`: Lưu giá trị (value) — ví dụ:
    ```json
    {
      "name": "Asset A",
      "type": "Type A",
      "tags": ["Urgent", "Internal"]
    }
    ```
  - `fieldMeta`: Lưu metadata của field — là 1 Map với key = `id` của field:
    ```json
    {
      "name": {
        "visible": true,
        "disabled": false,
        "error": null
      },
      "task": {
        "visible": true,
        "disabled": false,
        "loading": false
      },
      "version": {
        "visible": true,
        "loading": true,
        "options": []
      }
    }
    ```

- **Rule Engine (ex: JsonLogic lib)** — đọc `conditionMap`, `validationMap` và `permissionMap` từ Layer 2, lắng nghe `formData` thay đổi, tính lại các flag (`visible`, `disabled`, `error`...) và cập nhật vào `fieldMeta`.

**Cơ chế Validation (Kiểm tra dữ liệu):**

Validation là trách nhiệm của Layer 3, được trigger khi người dùng tương tác (onChange/onBlur) hoặc khi Submit form. Luồng xử lý như sau:

1. **Permission Check:** Nếu field KHÔNG có quyền edit (chỉ view) -> Bỏ qua validate.
2. **Rule Evaluation:** Layer 3 đối chiếu `formData` hiện tại với `validationMap`:
   - **Required cơ bản (`name`, `summary`):** Báo lỗi nếu thiếu data. Khi submit, nếu gom lại có lỗi -> Toast "Please fill all information."
   - **Dependent Validation (`task`):** Cờ `required` của `task` không phải là boolean cứng, mà là biểu thức động (chỉ required khi `tags` có data và `type` có data).
   - **Named Rule Validation (`assetUrl`):** Thay vì bắt thiết kế viên (những người không nắm rõ Regex) viết một đoạn regex khổng lồ vào JSON, Layer 2 chỉ cần định nghĩa định danh `"rule": "url"`. Layer 3 lúc này chứa một **Validation Registry** (tập hợp các hàm map cứng ở Frontend như `isValidUrl`, `isValidEmail`...). Rule Engine phát hiện key "url" sẽ lấy hàm `isValidUrl` ra chạy (bên trong hàm FE đã gom cả Regex check link, ipv4, ipv6...).
3. **Kết quả:** Nếu có lỗi, Layer 3 cập nhật `fieldMeta[fieldName].error = "Error string"`. NodeRenderer (Layer 4) nghe thấy biến `error` thay đổi sẽ lập tức vẽ viền đỏ cho trường đó.

**Ví dụ — tiếp nối dự án Asset Management:**

| Sự kiện                               | Rule Engine xử lý                            | Kết quả ghi vào `fieldMeta`                  |
| ------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| Chọn `type` AND nhập ít nhất 1 `tags` | `showIf` = true AND `permission.view` = true | `fieldMeta.task.visible = true`              |
| User muốn sửa field `tags`            | `permission.edit.tags` = false               | `fieldMeta.tags.disabled = true`             |
| User nhập `assetUrl`                  | Detect `version.triggerOn` → fetch API       | `fieldMeta.version.options` = kết quả trả về |

---

### Layer 4 — Rendering Engine

**Mục tiêu:** Ánh xạ cấu hình logic (`layoutTree`) thành giao diện người dùng thực tế thông qua React Components. Đảm bảo tính trung thực tuyệt đối giữa định nghĩa Schema và UI hiển thị.

**Cơ chế vận hành:**

- **Recursive Traversal:** Duyệt cây cấu hình theo chiều sâu (Depth-first). Áp dụng mẫu thiết kế **Factory Pattern** thông qua `ComponentRegistry` để chuyển đổi định danh `type` thành `React.Component` tương ứng.
- **Nodes Orchestration:** Mỗi thành phần được bao bọc bởi `<NodeRenderer id="..." />`. Lớp này đảm nhận:
  - Tra cứu `fieldMap[id]` để biết cấu hình hiển thị tĩnh (vd: Component này là Textarea hay Dropdown, label là gì).
  - Kết nối dữ liệu từ Store (`formData`, `fieldMeta`),
  - Quản lý vòng đời hiển thị (Mount/Redraw),
- **Extensibility (Khả năng mở rộng):** Cho phép lập trình viên tự tạo và "cắm" thêm các component đặc thù (Custom Widgets) vào hệ thống mà không phải sửa code lõi của form.
  - **Ví dụ:** Mặc định hệ thống hỗ trợ các loại `type` cơ bản (`input`, `select`...). Nhưng nếu dự án Asset cần một trường đính kèm bản đồ tọa độ (`{"type": "location_picker"}`), ta chỉ việc viết một component `<LocationPicker />` riêng rồi "đăng ký" (Registry) vào Rendering Engine để nó tự gọi ra khi gặp.

**Làm sao để biết một `type` (VD: `input`) có những thuộc tính (properties) gì?**
Đây là bài toán cốt lõi của SDUI được giải quyết bằng khái niệm **Schema Contract (Giao kèo tập trung)**:
1. **Đối với Frontend:** Mỗi Widget bắt buộc phải định nghĩa một Interface/Type rõ ràng bằng TypeScript.
   ```typescript
   // src/widgets/core/InputWidget.tsx
   export interface InputWidgetProps {
     id: string;
     label: string;
     placeholder?: string;
     disabled?: boolean;
     maxLength?: number;  // Thuộc tính riêng của type "input"
     type: "text" | "password" | "number";
   }
   ```
2. **Đối với Backend / Người thiết kế Form:** Toàn bộ các Frontend Interfaces ở trên sẽ được biên dịch (generate) thành một tài liệu **JSON Schema (Draft-07/04)**. Người thiết kế form sẽ dựa vào tài liệu này (hoặc JSON Schema tích hợp thẳng vào VSCode/Swagger) để cấu hình. Nếu họ gõ sai tên thuộc tính (VD: gõ `max_length` thay vì `maxLength`), **Layer 2** (với thư viện AJV) sẽ báo lỗi từ chối render ngay lập tức.

**Isolation Principle:** Rendering Engine được thiết kế như một **Presentation Layer** thuần túy: Tiếp nhận State để hiển thị, tuyệt đối không can thiệp vào Business Logic hoặc trực tiếp thao tác dữ liệu.

---

### Layer 5 — Action Resolver

**Mục tiêu:** Xử lý các sự kiện (click, change) từ UI và biến chúng thành các hành động cụ thể (gọi API, cập nhật Redux...).

**Ba chức năng:**

1. **Dịch sự kiện (Event Translation):** Component UI chỉ làm nhiệm vụ "báo cáo" (VD: "Nút Submit vừa bị click"). Layer 5 sẽ đọc JSON để xem "Khi click thì phải làm gì?" và thực thi lệnh đó.
2. **Chuỗi hành động (Execution Pipeline):** Code JSON có thể cấu hình nối tiếp nhiều hành động. VD: Gọi API lưu data → Thành công thì chuyển trang, Thất bại thì hiện thông báo lỗi.
3. **Hành động tuỳ chỉnh (Custom Actions):** Ngoài các lệnh có sẵn như (`SET_FIELD_VALUE` hay `API_CALL`), bạn có thể tự viết thêm các hàm JS (Custom Action) để xử lý các nghiệp vụ quá phức tạp không thể viết bằng JSON.

> **Layer 3 vs Layer 5:**
>
> - **Layer 5 (Action Resolver)** chỉ xử lý các "Hành động chủ động" từ người dùng (User Interactions) như bấm nút Submit, bấm nút Delete, click Link chuyển trang.
> - **Layer 3 (Rule Engine)** lo phần "Logic phản ứng ngầm" (Reactive Logic). Ví dụ: việc _gõ vào field A làm hiện field B_, hay _chọn Dropdown C thì tự động Call API điền vào field D_. Những logic này được config trong schema (`conditionMap`) và do Layer 3 tự động kích hoạt khi value thay đổi, Layer 5 **không** can thiệp.

**Reference:** Đóng vai trò tương đương `DivActionHandler` trong DivKit, đảm nhiệm việc trung hòa (Intercept) các Layout Events trước khi phân phối về các dịch vụ xử lý.

---

> **Architectural Reference — DivKit (Yandex):** Hệ thống SDUI production-scale open-source, kiến trúc module hóa tương ứng trực tiếp với 5-layer pipeline:
>
> | Layer                      | DivKit Module           | Chức năng                            |
> | -------------------------- | ----------------------- | ------------------------------------ |
> | Layer 2 — Schema Parser    | `div-json` + `div-data` | Deserialize JSON → typed `DivData`   |
> | Layer 3 — Rule Engine      | `div-evaluable`         | Expression evaluation engine         |
> | Layer 4 — Rendering Engine | `div-core` / `Div2View` | Layout tree traversal + View binding |
> | Layer 5 — Action Resolver  | `DivActionHandler`      | Event interception + dispatch        |
>
> Widget extensions (`div-video`, `div-lottie`) được inject vào `DivConfiguration` — cùng pattern với `ComponentRegistry` trong thiết kế này.

---

## 4. Module Structure

Codebase được tổ chức theo **functional boundaries**, phản ánh trực tiếp 5 layers của pipeline. Ranh giới module được giữ cứng để tránh coupling ngoài ý muốn.

```
src/
├── core/               # Engine layer — framework-agnostic, zero business logic
│   ├── network/        # Layer 1: Fetch + ETag cache strategy
│   ├── parser/         # Layer 2: AJV validation + schema decomposition
│   ├── evaluator/      # Layer 3 (Rule Engine): JsonLogic expression evaluator
│   ├── engine/         # Layer 4: Recursive renderer + NodeRenderer
│   ├── registry/       # Layer 4: ComponentRegistry + ActionRegistry
│   └── actions/        # Layer 5: Built-in action handlers
│
├── store/              # Layer 3 (State): Redux slice, selectors, middleware
│   └── cdaSlice.ts     # formData · fieldMeta · loadingFields
│
├── widgets/            # Presentational components — pure, no side effects
│   ├── core/           # TextInput, Select, Checkbox, DatePicker...
│   ├── layout/         # Container, Row, Column, Divider...
│   └── custom/         # Project-specific widgets (TagInput, AssetPreview...)
│
├── schema/             # JSON config files per Asset type
│   ├── model.json
│   ├── dataset.json
│   └── service.json
│
└── hooks/              # Integration layer — connect engine to React app
    ├── useCdaScreen.ts # Orchestrate fetch → parse → render lifecycle
    └── useAction.ts    # Bridge between widget events and Action Resolver
```

**Dependency rule:** `core/` không import từ `store/`, `widgets/`, hoặc `schema/`. `widgets/` không import từ `store/`. Dependency chỉ chạy từ ngoài vào trong, không ngược lại.

---

## 5. Event, Effect & Action Handling

Tất cả user interaction đều đi qua Action Resolver theo pattern: **Event → Action Descriptor → Handler → State / Side Effect**.

### Case 1: Simple Field Update

Scenario đơn giản nhất — user nhập liệu vào một trường độc lập.

**Flow:** `onChange(value)` → `ActionResolver.dispatch({ action: "SET_FIELD_VALUE", fieldId, value })` → Redux `formData` update → chỉ `NodeRenderer` của field đó re-render (nhờ Reselect selector).

Không có Rule Engine involvement. Layer 3 chỉ ghi nhận state mới.

---

### Case 2: Conditional Visibility (Show/Hide Dependency)

Field visibility được điều khiển bởi giá trị của field khác.

**Schema contract:**

```json
{
  "id": "imageFormat",
  "type": "select",
  "showIf": { "===": [{ "var": "inputType" }, "image"] }
}
```

**Flow:** `inputType` thay đổi → Redux update → Rule Engine re-evaluate `showIf` expression → ghi kết quả vào `fieldMeta.imageFormat.visible` → `NodeRenderer` của `imageFormat` đọc flag và mount/unmount.

Rule Engine là observer của Redux store — reactive, không polling.

---

### Case 3: Cross-field Data Dependency (Cascading Fetch)

Field B cần fetch options từ API dựa trên giá trị hiện tại của Field A.

**Schema contract:**

```json
{
  "id": "province",
  "type": "select",
  "fetchOptions": {
    "endpoint": "/api/provinces",
    "params": { "country": "${country}" },
    "triggerOn": ["country"]
  }
}
```

**Flow:** `country` thay đổi → Action Resolver phát hiện `country` nằm trong `triggerOn` của `province` → dispatch `FETCH_OPTIONS(province)` → gọi API với runtime param interpolation → kết quả ghi vào `fieldMeta.province.options` → Select widget re-render với options mới.

---

### Case 4: Complex Business Logic — Custom Action Handler

Một số business rule không thể biểu diễn đầy đủ trong JSON schema do độ phức tạp của điều kiện hoặc tác động đa chiều. Engine cung cấp **Custom Action extension point**.

**Nguyên tắc 80/20:** Schema JSON xử lý ~80% interaction flows thông thường. 20% business-specific logic được delegate sang imperative handlers đăng ký tại application layer.

**Handler registration:**

```typescript
ActionResolver.register(
  "VALIDATE_ASSET_CONSTRAINTS",
  (payload, { dispatch, getState }) => {
    const { assetType, framework, storageSize } = getState().formData;
    if (
      assetType === "Model" &&
      framework === "TensorFlow" &&
      storageSize > 1_000_000
    ) {
      dispatch(setFieldMeta("submitBtn", { disabled: true }));
      dispatch(
        setFieldMeta("storageSize", {
          error: "Exceeds limit for TensorFlow models",
        }),
      );
    }
  },
);
```

**Schema declaration:**

```json
{ "events": { "onChange": [{ "action": "VALIDATE_ASSET_CONSTRAINTS" }] } }
```

Schema chỉ khai báo trigger — implementation nằm hoàn toàn trong codebase, có thể type-safe, testable, và versioned qua git.

---

## 6. Performance Considerations

Kiến trúc CDA/SDUI dựa trên mô hình rendering đệ quy và quản lý trạng thái tập trung, do đó cần giải quyết triệt để các rủi ro về hiệu năng sau:

### 6.1. Kiểm soát Over-rendering trong quá trình nhập liệu

- **Rủi ro:** Cập nhật Redux state thường xuyên khi user nhập liệu có thể kích hoạt quy trình re-render toàn bộ cây component (subtree dirty marking). Đối với form lớn (100+ fields), điều này gây hiện tượng input lag.
- **Giải pháp - Node Binding:** Áp dụng `createSelector` (Reselect) tại mỗi `NodeRenderer` để đảm bảo component chỉ subscribe đúng mảnh state tương ứng. Kết hợp `React.memo` để triệt tiêu việc re-render các node không có thay đổi dữ liệu.
- **Kiểm chứng (PoC):** Sử dụng React DevTools Profiler ("Highlight updates") để xác nhận chỉ duy nhất node đang thao tác thực hiện quy trình render.

### 6.2. Giảm thiểu UI Thread Blocking khi khởi tạo Form

- **Rủi ro:** Việc thực hiện Parse và Mount đồng loạt hàng trăm fields cùng lúc chiếm dụng JS Main Thread, gây hiện tượng "đơ" UI hoặc màn hình trắng trong thời gian dài.
- **Giải pháp:**
  - **A. Field Virtualization:** Sử dụng `@tanstack/react-virtual` để chỉ duy trì trong DOM các fields thuộc khung nhìn (viewport). Hệ thống chỉ mount các nodes mới khi user thực hiện thao tác cuộn.
  - **B. Deferred Rendering:** Sử dụng `React.startTransition` để tách biệt quá trình render form khỏi luồng cập nhật UI ưu tiên cao (như animation hoặc skeleton).
- **Kiểm chứng (PoC):** Đo lường chỉ số TTI (Time to Interactive) trên Lighthouse; mục tiêu duy trì ngưỡng < 200ms cho form quy mô lớn.

### 6.3. Tối ưu hóa Network Latency & Băng thông (ETag Mechanism)

- **Rủi ro:** Các file JSON cấu hình có dung lượng lớn, việc tải lại schema trong mỗi session làm tăng độ trễ và tải trọng lên hệ thống network.
- **Giải pháp - ETag Validation:**
  1. **Handshake:** Client gửi yêu cầu kèm header `If-None-Match: [ETag_Hash]` đã lưu từ session trước.
  2. **Verification:** Server so khớp mã băm của file hiện tại với mã client gửi lên. Nếu trùng khớp, server phản hồi mã **304 Not Modified** với thân bài rỗng (**0 bytes payload**).
  3. **Hydration:** Client nhận mã 304 và ngay lập tức lấy dữ liệu từ LocalStorage để hiển thị UI, loại bỏ hoàn toàn thời gian chờ tải dữ liệu.
- **Kiểm chứng (PoC):** Network tab hiển thị mã `304` với kích thước payload tối thiểu cho các lần truy cập lặp lại.

### 6.4. Kiểm soát kích thước Bundle chính (Bundle Bloat)

- **Rủi ro:** Việc đăng ký toàn bộ UI Widgets vào `ComponentRegistry` theo cách tĩnh sẽ kéo theo tất cả mã nguồn (bao gồm cả các widget nặng như RichText, Charts) vào bundle chính.
- **Giải pháp - Code Splitting:** Đăng ký widget dưới dạng các **Lazy Factory** sử dụng `React.lazy()`. Schema Parser sẽ chỉ kích hoạt việc tải JS chunk của một widget cụ thể khi gặp định nghĩa `type` tương ứng trong tệp JSON.
- **Kiểm chứng (PoC):** Sử dụng Bundle Analyzer để xác nhận các widget nặng được tách ra thành các async chunks độc lập.

---

## 7. Testing Strategy

Test coverage được tổ chức theo layer boundary, đảm bảo mỗi layer có thể được verify độc lập.

| Layer                      | Coverage Target                                                        | Approach                                      |
| -------------------------- | ---------------------------------------------------------------------- | --------------------------------------------- |
| **Schema Validation**      | Toàn bộ required fields, type constraints, unknown properties          | AJV schema test với valid/invalid fixtures    |
| **Rule Engine**            | Tất cả expression operators, edge cases (null, undefined, empty array) | Parameterized unit tests (Jest `test.each`)   |
| **NodeRenderer**           | Render đúng component type, áp dụng đúng props từ schema               | RTL component test với mock registry          |
| **Action Resolver**        | Mỗi built-in action type → đúng Redux dispatch hoặc side effect        | Jest với mock store và spies                  |
| **Integration Flow**       | Schema → Parse → Render → User interaction → State update              | RTL + MSW (Mock Service Worker) cho API calls |
| **Performance Regression** | Render time không vượt threshold khi schema size tăng                  | React Profiler API trong test environment     |

---

## 8. Migration Roadmap — Strangler Fig Pattern

Migration thực hiện theo chiến lược **Strangler Fig** — hệ thống mới được xây dựng song song, dần thay thế hệ thống cũ theo từng vertical slice, không có big-bang cutover.

| Phase                     | Scope                                                                                                            | Success Criteria                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Phase 0 — Audit**       | Inventory tất cả Asset form fields hiện tại, phân loại field types, xác định custom logic                        | Schema taxonomy document, field coverage matrix                                 |
| **Phase 1 — Core Engine** | Implement 5-layer pipeline, 6 widget primitives (Text, Select, Checkbox, Number, Container, Button), Redux slice | Engine chạy ổn định với 3 schema fixtures, test coverage ≥ 80%                  |
| **Phase 2 — Pilot**       | Migrate 1 Asset form (Model) sang CDA, chạy song song với implementation cũ qua feature flag                     | Zero regression trên E2E test suite, performance parity                         |
| **Phase 3 — Rollout**     | Migrate các Asset form còn lại (Dataset, Service, Agent), bổ sung custom widgets                                 | Full Asset type coverage, không còn hard-coded form components                  |
| **Phase 4 — Cleanup**     | Xóa legacy form components, remove feature flags, tối ưu bundle                                                  | Bundle size giảm, codebase complexity giảm đo bằng LOC và cyclomatic complexity |

---

## 9. Graceful Degradation — Fallback Architecture

Một rủi ro đặc thù của SDUI: khi schema tham chiếu đến một `type` chưa được đăng ký trong `ComponentRegistry` — xảy ra khi backend deploy schema mới trước khi frontend được cập nhật.

**Cơ chế xử lý:**

1. **ErrorBoundary at NodeRenderer level:** Mỗi `NodeRenderer` được bọc bởi React `ErrorBoundary`. Khi registry lookup fail, boundary catch lỗi và render `UnknownWidgetPlaceholder` — form tiếp tục hoạt động bình thường với các node còn lại.

2. **Role-based visibility:** `UnknownWidgetPlaceholder` hiển thị warning chi tiết với Admin/Developer role; ẩn hoàn toàn với end-user.

3. **Telemetry on unknown type:** Action Resolver tự động dispatch log event khi gặp unresolvable type — payload bao gồm component type, client version, schema version. Cho phép team định lượng frequency và ưu tiên implementation.

**Kết quả:** Không có white screen of death do schema/client version mismatch.

---

## References

| Source                                                                                             | Relevance                                                                                                                       |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **DivKit (Yandex)** — [github.com/divkit/divkit](https://github.com/divkit/divkit)                 | Primary architectural reference. `div-json → div-evaluable → div-core → DivActionHandler` pipeline là basis của 5-layer design. |
| **Airbnb Ghost Platform** — [medium.com/airbnb-engineering](https://medium.com/airbnb-engineering) | SDUI tại production scale — lessons learned về schema versioning và client compatibility.                                       |
| **Shopify SDUI** — [shopify.engineering](https://shopify.engineering)                              | Real-time UI control không qua App Store cycle — motivation cho định hướng SDUI dài hạn.                                        |
| **JsonLogic** — [jsonlogic.com](https://jsonlogic.com)                                             | JSON-serializable, eval-free expression language cho Rule Engine.                                                               |
| **Formily (Alibaba)** — [formilyjs.org](https://formilyjs.org)                                     | Reactive form model với fine-grained reactivity — reference cho Layer 3 design.                                                 |
