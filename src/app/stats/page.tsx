"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { useMounted } from "@/hooks/useMounted";
import { getEmailUsername } from "@/lib/links";
import { Card, CardContent } from "@/components/ui";
import { Loader2 } from "lucide-react";

export default function LegacyStatsRedirectPage() {
  const router = useRouter();
  const isMounted = useMounted();
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  useEffect(() => {
    if (!isMounted || isAuthLoading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    const username = getEmailUsername(user.email, user.username);
    if (username) {
      router.replace(`/${encodeURIComponent(username)}/stats`);
    } else {
      router.replace("/");
    }
  }, [isMounted, isAuthLoading, user, router]);

  return (
    <main className="relative flex-1 flex items-center justify-center p-4 bg-[#FFFBEB] dark:bg-zinc-950 min-h-[calc(100vh-64px)]">
      <Card variant="default" className="p-8 mx-auto text-center max-w-[400px]">
        <CardContent className="p-0 flex flex-col items-center gap-3 py-4">
          <Loader2 className="w-8 h-8 animate-spin text-black stroke-[2.5]" />
          <p className="text-sm font-black text-black">
            개인 통계 페이지로 이동하는 중입니다...
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
