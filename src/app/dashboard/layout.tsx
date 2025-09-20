import { Header } from "@/components/dashboard/header";
import { MainNav } from "@/components/dashboard/main-nav";
import { UserProvider } from "@/context/user-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr]">
        <div className="hidden border-r bg-card md:block">
          <MainNav />
        </div>
        <div className="flex flex-col">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background/50">
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
