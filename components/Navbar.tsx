"use client"

import Link from "next/link"
import { Instagram } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";


const links = [
  { href: "/features", label: "Features" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/news", label: "News" },
];


export default function GlassmorphismNavbar() {
    const [active, setActive] = useState<number | null>(null);
    const [underline, setUnderline] = useState({ left: 0, width: 0, visible: false });
    const containerRef = useRef<HTMLDivElement>(null);
    const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    const handleMouseEnter = (i: number) => {
        const link = linkRefs.current[i];
        const container = containerRef.current;
        if (link && container) {
        const linkRect = link.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        setUnderline({
            left: linkRect.left - containerRect.left,
            width: linkRect.width,
            visible: true,
        });
        }
    };

    const handleMouseLeave = () => {
        setUnderline((u) => ({ ...u, visible: false }));
    };

    return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-accent/20 bg-background/10">
      <div className="max-w-7xl mx-auto">
        <div className="relative backdrop-blur-sm px-8">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center py-4">
              <Link href="/" className="text-2xl font-bold text-foreground hover:text-foreground/80 transition-colors">
                <Image
                  src="/favicon.ico" 
                  alt="WealthFlow Logo" 
                  width={32} 
                  height={32}
                    className="h-8 w-8 object-contain"
                />
              </Link>
            </div>

            <div
              className="py-6 relative hidden md:flex items-center gap-8"
              ref={containerRef}
              onMouseLeave={handleMouseLeave}
            >
              {links.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  ref={el => { linkRefs.current[i] = el; }}
                  onMouseEnter={() => handleMouseEnter(i)}
                  className="relative text-secondary/90 hover:text-primary transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}

              {/* Animated underline */}
              <span
                className="pointer-events-none absolute bottom-0 h-[2px] bg-primary transition-all duration-300 ease-in-out rounded-full"
                style={{
                  left: underline.left,
                  width: underline.visible ? underline.width : 0,
                  opacity: underline.visible ? 1 : 0,
                }}
              />
            </div>
            
            {/* Social Icons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="https://instagram.com"
                target="_blank"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
              >
                <svg className="w-5 h-5 text-foreground/70" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
               <Button asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/10">
              <svg className="w-5 h-5 text-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
