import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: MongoDBAdapter(connectDB()), // ডাটাবেসের সাথে NextAuth-কে কানেক্ট করা
  
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {}, // আমরা লগইন ফর্ম থেকে credentials পাব

      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectDB();
          const user = await User.findOne({ email });

          // যদি ইউজার না পাওয়া যায়
          if (!user) {
            throw new Error("No user found with this email.");
          }

          // পাসওয়ার্ড মেলানো
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            throw new Error("Incorrect password.");
          }

          // যদি সবকিছু ঠিক থাকে, ইউজার অবজেক্ট রিটার্ন করা
          return user;

        } catch (error) {
          console.error("Authorization Error:", error.message);
          throw new Error(error.message); // এরর মেসেজ ক্লায়েন্টে পাঠানো
        }
      },
    }),
  ],

  session: {
    strategy: "jwt", // সেশন ম্যানেজমেন্টের জন্য JWT ব্যবহার করা
  },
  
  secret: process.env.NEXTAUTH_SECRET, // সেশন টোকেন সাইন করার জন্য একটি গোপন কী

  pages: {
    signIn: "/login", // আমাদের কাস্টম লগইন পেজের পাথ
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };