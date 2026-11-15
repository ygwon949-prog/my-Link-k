"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // 실시간 기능(자동 폴링, 포커스/재연결 시 자동 리페치)을 비활성화하고
  // 명시적인 데이터 조회(useQuery)와 변경(useMutation) 시에만 동작하도록 설정
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
            refetchOnWindowFocus: false, // 창 포커스 시 자동 재요청 비활성화
            refetchOnReconnect: false, // 네트워크 재연결 시 자동 재요청 비활성화
            refetchInterval: false, // 주기적 실시간 폴링 비활성화
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
