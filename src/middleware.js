import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // যদি ব্যবহারকারী লগইন করা না থাকে, তাকে এখানে পাঠানো হবে
  },
});

// এই matcher কনফিগারেশনটি কোন কোন পেজকে সুরক্ষিত করবে তা নির্ধারণ করে
export const config = {
  matcher: [
    /*
     * নিচের পাথগুলো ছাড়া বাকি সব পাথকে সুরক্ষিত করা হবে।
     * এটি নিশ্চিত করে যে /login, /register, এবং API রুটগুলো সুরক্ষিত নয়,
     * কিন্তু বাকি সবকিছু (যেমন: /, /employeeList, /attendance) সুরক্ষিত।
     */
    "/((?!api|login|register|_next/static|_next/image|favicon.ico).*)",
  ],
};