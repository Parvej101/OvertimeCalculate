import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Navbar ইম্পোর্ট করা

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Overtime Calculator",
  description: "Calculate employee overtime easily",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* --- সমাধান ১: body-তে একটি সুন্দর ব্যাকগ্রাউন্ড এবং ফন্ট স্টাইল যোগ করা --- */}
      <body className={`${inter.className} bg-gray-50 text-gray-800 antialiased`}>
        <Navbar />
        
        {/* --- সমাধান ২: main কন্টেন্টের জন্য একটি কন্টেইনার এবং সুন্দর প্যাডিং --- */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
      </body>
    </html>
  );
}