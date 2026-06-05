import { useState } from "react";
import { Link, useLocation } from "wouter";
import { User, Menu, X, Home, Users, UserPlus, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/workers", label: "Find Workers", icon: Users },
  { href: "/register", label: "Register as Worker", icon: UserPlus },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            K
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">KashWork</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/workers" className="text-foreground/80 hover:text-primary transition-colors">
            Find Workers
          </Link>
          <Link href="/register" className="text-foreground/80 hover:text-primary transition-colors">
            Register as Worker
          </Link>
        </nav>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign Up</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0 flex flex-col">
            {/* Brand header */}
            <div className="flex items-center gap-2 px-5 py-5 border-b">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                K
              </div>
              <span className="font-bold text-xl tracking-tight text-primary">KashWork</span>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = location === href;
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)}>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    }`}>
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Auth buttons at bottom */}
            <div className="px-5 pb-6 pt-3 border-t space-y-2">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full gap-2">
                  <User className="w-4 h-4" />
                  Login
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)}>
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
