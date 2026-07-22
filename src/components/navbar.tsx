"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Accessibility, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { liveTools } from "@/lib/tools";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "All Tools" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 路由改变时自动收起所有菜单
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const closeDropdown = () => {
    setDropdownOpen(false);
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-slate-900"
          onClick={() => {
            setMobileOpen(false);
            closeDropdown();
          }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
            <Accessibility className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            A11y<span className="text-teal-700">Kit</span>
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            if (link.href === "/tools") {
              return (
                <li
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                    onClick={() => closeDropdown()}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        dropdownOpen && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </Link>

                  {/* Dropdown Menu */}
                  <div
                    className={cn(
                      "absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-lg transition-all duration-150",
                      dropdownOpen
                        ? "visible opacity-100 translate-y-0"
                        : "invisible opacity-0 -translate-y-1 pointer-events-none"
                    )}
                  >
                    <div className="grid grid-cols-1 gap-0.5">
                      {liveTools.map((tool) => {
                        const toolActive = pathname === `/tools/${tool.slug}`;
                        return (
                          <Link
                            key={tool.slug}
                            href={`/tools/${tool.slug}`}
                            className={cn(
                              "block rounded-md px-3 py-1.5 text-sm transition-colors",
                              toolActive
                                ? "bg-teal-50 text-teal-700 font-medium"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                            onClick={() => closeDropdown()}
                          >
                            {tool.shortTitle}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </li>
              );
            }
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  onClick={() => closeDropdown()}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-slate-200 bg-white">
          <ul className="space-y-1 px-4 py-3">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-md px-3 py-2 text-base font-medium",
                      isActive
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
