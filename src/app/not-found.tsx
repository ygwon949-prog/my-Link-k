import { UserNotFoundCard } from "@/components/profile";

export default function NotFound() {
  return (
    <main className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#FFFBEB] dark:bg-zinc-950 min-h-[calc(100vh-64px)] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <UserNotFoundCard />
    </main>
  );
}
