"use client";

import Link from "next/link";
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo / Brand */}
          <div>
            <h2 className="text-2xl font-bold text-white">FinAdvisor</h2>
            <p className="mt-2 text-sm text-gray-400">
              Your personal financial literacy and advisor platform.  
              Learn. Invest. Grow.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/learning" className="hover:text-white transition">
                  Learning Hub
                </Link>
              </li>
              <li>
                <Link href="/advisor" className="hover:text-white transition">
                  Financial Advisor
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h3 className="text-lg font-semibold text-white">Follow Us</h3>
            <div className="flex space-x-4 mt-3">
              <Link href="https://facebook.com" target="_blank">
                <FaFacebook className="w-6 h-6 hover:text-blue-500 transition" />
              </Link>
              <Link href="https://twitter.com" target="_blank">
                <FaTwitter className="w-6 h-6 hover:text-sky-400 transition" />
              </Link>
              <Link href="https://linkedin.com" target="_blank">
                <FaLinkedin className="w-6 h-6 hover:text-blue-400 transition" />
              </Link>
              <Link href="https://github.com" target="_blank">
                <FaGithub className="w-6 h-6 hover:text-gray-100 transition" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} FinAdvisor. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
