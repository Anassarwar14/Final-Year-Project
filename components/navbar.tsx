"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white shadow-md">
      <Link href="/" className="text-xl font-bold">
        MyApp
      </Link>
      <div className="flex gap-6">
        <Link
          href="/"
          className={pathname === "/" ? "text-orange-400" : "hover:text-orange-300"}
        >
          Home
        </Link>
        <Link
          href="/login"
          className={pathname === "/login" ? "text-orange-400" : "hover:text-orange-300"}
        >
          Login
        </Link>
        <Link
          href="/signup"
          className={pathname === "/signup" ? "text-orange-400" : "hover:text-orange-300"}
        >
          Sign Up
        </Link>

         <Link
          href="/learning"
          className={pathname === "/signup" ? "text-orange-400" : "hover:text-orange-300"}
        >
          Learning
        </Link>


      </div>
    </nav>
  );
}
