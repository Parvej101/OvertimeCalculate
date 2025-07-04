import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Navbar ইম্পোর্ট করা
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Overtime Calculator",
  description: "Calculate employee overtime easily",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body className={`${inter.className} bg-gray-50 text-gray-800 antialiased`}>
        <Providers>
          <Navbar />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </Providers>


      </body>
    </html>
  );
}