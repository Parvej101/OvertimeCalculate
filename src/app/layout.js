import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Navbar ইম্পোর্ট করুন

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Overtime Calculator",
  description: "Calculate employee overtime easily",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar /> {/* Navbar কম্পোনেন্টটি এখানে যোগ করুন */}
        <main>{children}</main> {/* আপনার পেজের কন্টেন্ট এখানে থাকবে */}
      </body>
    </html>
  );
}