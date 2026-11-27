# EDU TEST AI – Ngân hàng Đề kiểm tra Thông minh

Hệ thống quản lý ngân hàng câu hỏi, lập ma trận, bản đặc tả, tạo đề kiểm tra và thẩm định phê duyệt theo Chương trình GDPT 2018.

## Yêu cầu hệ thống

- **Node.js**: `>= 22.18.0` (khuyến nghị Node.js 22 LTS hoặc Node.js 24 để chạy trực tiếp `node server.ts`)
- **npm**: đi kèm Node.js

## Chạy ở môi trường phát triển (Local)

```bash
npm install
cp .env.example .env
# Điền GEMINI_API_KEY (và các biến cấu hình nếu cần) vào .env
npm run dev
```

## Build & Chạy Production

```bash
npm install
npm run build
NODE_ENV=production npm start
```

Máy chủ mặc định lắng nghe trên `PORT=3000` (hoặc biến môi trường `PORT` do nền tảng hosting cấp) và cung cấp endpoint kiểm tra trạng thái tại `/api/health`.

## Đưa mã nguồn lên GitHub

Tệp `.gitignore` đã được cấu hình để loại trừ tự động:
- `node_modules/`, `dist/`, `build/`
- `.env*` (chỉ giữ lại `.env.example`)
- `uploads/`, `*.traineddata`, `.aistudio/`
- Các tệp khóa bí mật (`*.pem`, `*.key`, `*service-account*.json`, `*firebase-adminsdk*.json`)

Các lệnh đẩy code lần đầu lên GitHub:

```bash
git init
git branch -M main
git add .
git status   # Kiểm tra lại chắc chắn không có tệp .env hay key bí mật
git commit -m "Initial commit: EDU TEST AI"
git remote add origin https://github.com/<tai-khoan>/<ten-repo>.git
git push -u origin main
```

## Triển khai AutoDeploy trên Hosting (cPanel / CloudLinux Node.js)

> **Quan trọng:** EDU TEST AI là ứng dụng **Full-Stack (React + Express Backend)**. Không triển khai dạng web tĩnh (GitHub Pages hoặc chỉ chép `dist/` vào `public_html`), vì mọi yêu cầu đăng nhập (`/api/auth/login`) và dữ liệu (`/api/*`) đều cần máy chủ Node.js chạy.

1. **Chọn Runtime**: Node.js 22 hoặc Node.js 24 (`engines.node >= 22.18.0`).
2. **Xác thực GitHub cho AutoDeploy** (tránh lỗi `could not read Username for 'https://github.com'`):
   - Dùng **SSH Deploy Key**: cấu hình URL `git@github.com:<tai-khoan>/<ten-repo>.git` (nhánh `main`) và thêm public key vào **GitHub Repo → Settings → Deploy keys**.
   - Hoặc dùng **HTTPS + Personal Access Token (quyền `repo`)**: `https://x-access-token:<TOKEN>@github.com/<tai-khoan>/<ten-repo>.git`.
3. **Lệnh Build & Start**:
   - Build command: `npm install && npm run build`
   - Start command: `npm start` (hoặc **Application startup file**: `app.js` / `server.ts` trên CloudLinux Node.js Selector)
   - Kiểm tra máy chủ đã chạy: mở `https://<ten-mien-cua-ban>/api/health` — phải trả về `{"ok":true,"status":"healthy",...}`.
4. **Biến môi trường (Environment Variables)**:
   - Khai báo `NODE_ENV=production`, `GEMINI_API_KEY`, `APP_RUNTIME_ENV=PRODUCTION`, `VITE_APP_RUNTIME_ENV=PRODUCTION`.
   - Tuỳ chọn `DATA_DIR` để chỉ định thư mục lưu dữ liệu ngoài `releases/` (mặc định máy chủ tự động nhận diện thư mục `shared-data` song song với `releases/` khi deploy bằng AutoDeploy).
5. **Đăng nhập Google / Firebase trên tên miền mới**:
   - Vào **Firebase Console → Authentication → Settings → Authorized domains** và thêm tên miền hosting của bạn (ví dụ `tenmiencuaban.edu.vn`) để bật đăng nhập Google và kết nối Firebase Auth từ trình duyệt.

## Lưu trữ & Đồng bộ Dữ liệu trực tiếp lên GitHub Repository

Ứng dụng tích hợp sẵn lớp lưu trữ dữ liệu qua GitHub Contents API ở phía máy chủ Backend (hỗ trợ tệp lớn qua Git Blobs API và tự động tách bỏ phiên đăng nhập trước khi commit):

1. Tạo **GitHub Personal Access Token** (Fine-grained token cấp quyền `Contents: Read and write` cho kho dữ liệu — khuyến nghị dùng kho **Private**).
2. Khai báo các biến môi trường trên máy chủ (`.env` hoặc Environment Variables trên Hosting):
   ```env
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
   GITHUB_DATA_OWNER=minhasminh
   GITHUB_DATA_REPO=dekiemtra
   GITHUB_DATA_BRANCH=data-storage
   GITHUB_DATA_PATH=data/edutest_multitenant_db.json
   GITHUB_DATA_AUTOSYNC=true
   ```
3. Khởi động lại máy chủ Backend, sau đó đăng nhập bằng tài khoản Quản trị và vào **Thiết lập hệ thống** (`Cài đặt Hệ thống & Cấu hình Lớp Lưu trữ Dữ liệu`) để:
   - Kiểm tra kết nối GitHub.
   - Bật/tắt chế độ tự động đồng bộ khi có thay đổi dữ liệu.
   - Đẩy dữ liệu lên GitHub ngay lập tức hoặc khôi phục lại toàn bộ dữ liệu từ tệp JSON trên GitHub.


