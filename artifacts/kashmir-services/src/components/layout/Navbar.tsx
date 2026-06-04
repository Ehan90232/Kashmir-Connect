import { Link } from "wouter";
import { User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            K
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">KashWork</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/workers" className="text-foreground/80 hover:text-primary transition-colors">
            Find Workers
          </Link>
          <Link href="/register" className="text-foreground/80 hover:text-primary transition-colors">
            Register as Worker
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden md:inline-flex">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              <span>Login</span>
            </Button>
          </Link>
          <Link href="/signup" className="hidden md:inline-flex">
            <Button size="sm" className="gap-2">
              Sign Up
            </Button>
          </Link>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
