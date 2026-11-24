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

## Triển khai AutoDeploy trên Hosting

1. **Chọn Runtime**: Node.js 22 hoặc Node.js 24 (`engines.node >= 22.18.0`).
2. **Xác thực GitHub cho AutoDeploy** (tránh lỗi `could not read Username for 'https://github.com'`):
   - Dùng **SSH Deploy Key**: cấu hình URL `git@github.com:<tai-khoan>/<ten-repo>.git` (nhánh `main`) và thêm public key vào **GitHub Repo → Settings → Deploy keys**.
   - Hoặc dùng **HTTPS + Personal Access Token (quyền `repo`)**: `https://x-access-token:<TOKEN>@github.com/<tai-khoan>/<ten-repo>.git`.
3. **Lệnh Build & Start**:
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
4. **Biến môi trường (Environment Variables)**: Khai báo `NODE_ENV=production`, `GEMINI_API_KEY`, `APP_RUNTIME_ENV=PRODUCTION`, `VITE_APP_RUNTIME_ENV=PRODUCTION` trong cấu hình của hosting.
