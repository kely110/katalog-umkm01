import { proxy } from "./proxy";

/**
 * Middleware Next.js untuk memproteksi seluruh rute /admin (US-06).
 * Dijalankan otomatis oleh engine Next.js pada setiap request yang cocok.
 */
export async function middleware(request) {
  return proxy(request);
}

export default middleware;

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

