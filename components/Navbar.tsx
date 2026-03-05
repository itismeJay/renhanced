"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Menu, X, Moon, Sun, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [navigating, setNavigating] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const handleGetStarted = () => {
    if (isPending) return;
    const target = session ? "/dashboard" : "/login";
    router.push(target);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clear navigating state when pathname changes
  useEffect(() => {
    setNavigating(null);
  }, [pathname]);

  // Only compute theme after mounted
  const isDark = mounted
    ? theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    : false;

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(isDark ? "light" : "dark");
  };

  const scrolltoTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/templates", label: "Templates" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border transition-colors duration-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            onClick={scrolltoTop}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">Renhanced</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-500 hover:text-primary ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full relative overflow-hidden cursor-pointer"
              >
                <Sun
                  className={`absolute w-5 h-5 transition-all duration-500 ${
                    isDark
                      ? "opacity-100 rotate-0 scale-100"
                      : "opacity-0 -rotate-90 scale-0"
                  }`}
                />
                <Moon
                  className={`absolute w-5 h-5 transition-all duration-500 ${
                    isDark
                      ? "opacity-0 rotate-90 scale-0"
                      : "opacity-100 rotate-0 scale-100"
                  }`}
                />
              </Button>
            )}
            <Button
              variant="ghost"
              className="cursor-pointer"
              size="sm"
              onClick={() => {
                setNavigating("auth");
                router.push(session ? "/dashboard" : "/login");
              }}
            >
              {navigating === "auth" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : !session ? (
                "Sign in"
              ) : (
                "Dashboard"
              )}
            </Button>

            <Button
              variant="gradient"
              className="cursor-pointer"
              size="sm"
              onClick={() => {
                setNavigating("cta");
                router.push(session ? "/dashboard" : "/login");
              }}
            >
              {navigating === "cta" ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
              ) : (
                "Get Started Free"
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full relative overflow-hidden"
              >
                <Sun
                  className={`absolute w-5 h-5 transition-all duration-500 ${
                    isDark
                      ? "opacity-100 rotate-0 scale-100"
                      : "opacity-0 -rotate-90 scale-0"
                  }`}
                />
                <Moon
                  className={`absolute w-5 h-5 transition-all duration-500 ${
                    isDark
                      ? "opacity-0 rotate-90 scale-0"
                      : "opacity-100 rotate-0 scale-100"
                  }`}
                />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Links */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-500"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Link href="/login" className="cursor-pointer w-full">
                  <Button variant="ghost" className="w-full justify-start">
                    Log in
                  </Button>
                </Link>

                <Button
                  className="w-full"
                  onClick={() => {
                    if (isPending) return;
                    setNavigating("mobile-cta");
                    handleGetStarted();
                  }}
                  disabled={isPending}
                >
                  {navigating === "mobile-cta" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
