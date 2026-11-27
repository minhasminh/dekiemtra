// Entry point tương thích với cPanel / CloudLinux Node.js Selector & Phusion Passenger (Application startup file: app.js)
// Không dùng top-level await để tương thích với cả require('./app.js') của Passenger và node app.js
void (async () => {
  try {
    await import('./server.ts');
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
    const msg = err instanceof Error ? err.message : String(err || '');
    if (code === 'ERR_UNKNOWN_FILE_EXTENSION' || msg.includes('.ts')) {
      try {
        const tsxApi = await import('tsx/esm/api');
        if (typeof tsxApi.register === 'function') {
          tsxApi.register();
        }
        await import('./server.ts');
        return;
      } catch {
        console.error(
          '[EDU TEST AI] Phiên bản Node.js hiện tại chưa hỗ trợ chạy trực tiếp server.ts. Hãy chọn Node.js 22.18+ hoặc 24 trong cPanel Node.js Selector.'
        );
      }
    }
    console.error('[EDU TEST AI] Lỗi khởi động máy chủ Node.js:', err);
    process.exitCode = 1;
  }
})();
