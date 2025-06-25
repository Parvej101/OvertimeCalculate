// src/middleware.js

export { default } from "next-auth/middleware";

export const config = {
  // --- সমাধান: matcher-এ /api/setup-admin যোগ করা ---
  matcher: [
    // /login, /register, এবং এখন /api/setup-admin পেজ ছাড়া বাকি সব সুরক্ষিত
    "/((?!api/register|api/setup-admin|login|_next/static|_next/image|favicon.ico).*)",
  ],
};