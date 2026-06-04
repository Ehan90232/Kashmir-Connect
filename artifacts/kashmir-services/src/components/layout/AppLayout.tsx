import { Navbar } from "./Navbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="py-8 text-center text-sm text-muted-foreground border-t bg-card mt-auto">
        <p>KashWork &copy; {new Date().getFullYear()}. For the people of Kashmir.</p>
      </footer>
    </div>
  );
}
