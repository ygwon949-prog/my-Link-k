import { ImageResponse } from "next/og";
import { getOgFont } from "./fonts";
import { fetchUserByUsername, fetchUserLinks } from "@/lib/links";

export const ogSize = {
  width: 1200,
  height: 630,
};

export const ogContentType = "image/png";

interface DynamicStatsOgProps {
  username: string;
}

/**
 * 사용자 통계 동적 경로(/[username]/stats)를 위한 네오브루탈리즘 스타일 OG 이미지를 생성합니다.
 */
export async function createDynamicStatsOgImage({
  username,
}: DynamicStatsOgProps): Promise<ImageResponse> {
  const fontData = await getOgFont();

  let displayName = username;
  let totalLinks = 0;
  let totalClicks = 0;
  let topCategory = "개발";

  try {
    const userProfile = await fetchUserByUsername(username);
    if (userProfile) {
      displayName = userProfile.displayName || username;
      if (userProfile.uid) {
        const links = await fetchUserLinks(userProfile.uid);
        totalLinks = links.length;
        totalClicks = links.reduce(
          (sum, link) => sum + (typeof link.clickCount === "number" ? link.clickCount : 0),
          0
        );

        if (links.length > 0) {
          const categoryCounts: Record<string, number> = {};
          for (const link of links) {
            const cat = link.category || "기타";
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
          }
          const sortedCats = Object.entries(categoryCounts).sort(
            (a, b) => b[1] - a[1]
          );
          if (sortedCats.length > 0) {
            topCategory = sortedCats[0][0];
          }
        }
      }
    }
  } catch (err) {
    console.warn("통계 OG 이미지 데이터 조회 실패 (기본값 사용):", err);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FFFBEB",
          padding: "44px 52px",
          fontFamily: "'Noto Sans KR', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 네오브루탈리즘 도트 그리드 배경 SVG */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.12,
          }}
        >
          <defs>
            <pattern
              id="dot-grid-stats"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="2" fill="#000000" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid-stats)" />
        </svg>

        {/* 상단 스티커 영역 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* 좌측 스티커: 유저 통계 배지 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#BAE6FD",
              border: "3px solid #000000",
              boxShadow: "4px 4px 0px #000000",
              borderRadius: "10px",
              padding: "8px 20px",
              transform: "rotate(-2deg)",
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 900, color: "#000000" }}>
              📊 @{username} 통계 분석
            </span>
          </div>

          {/* 중앙 로고 칩 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#FEF08A",
              border: "2.5px solid #000000",
              boxShadow: "3px 3px 0px #000000",
              borderRadius: "8px",
              padding: "6px 16px",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 900, color: "#000000" }}>
              ⚡ LIVE DASHBOARD
            </span>
          </div>

          {/* 우측 스티커: 실시간 분석 태그 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#A7F3D0",
              border: "3px solid #000000",
              boxShadow: "4px 4px 0px #000000",
              borderRadius: "10px",
              padding: "8px 20px",
              transform: "rotate(2deg)",
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 900, color: "#000000" }}>
              📈 REALTIME
            </span>
          </div>
        </div>

        {/* 중앙 메인 통계 쇼케이스 화이트 카드 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#FFFFFF",
            border: "4.5px solid #000000",
            boxShadow: "10px 10px 0px #000000",
            borderRadius: "20px",
            padding: "32px 40px",
            margin: "18px 0",
          }}
        >
          {/* 타이틀 및 유저 인포 헤더 */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: "#000000",
              }}
            >
              {displayName}님의 링크 클릭 & 방문 통계
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#525252",
              }}
            >
              @{username}
            </span>
          </div>

          {/* 3가지 네오브루탈리즘 지표 메트릭 박스 */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            {/* 1. 총 클릭 수 */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#FEF08A",
                border: "3px solid #000000",
                boxShadow: "4px 4px 0px #000000",
                borderRadius: "14px",
                padding: "18px 20px",
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  color: "#000000",
                  marginBottom: "8px",
                }}
              >
                🔥 총 클릭 수
              </span>
              <span
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  color: "#000000",
                  lineHeight: 1,
                }}
              >
                {totalClicks.toLocaleString()}
              </span>
            </div>

            {/* 2. 등록된 링크 수 */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#BAE6FD",
                border: "3px solid #000000",
                boxShadow: "4px 4px 0px #000000",
                borderRadius: "14px",
                padding: "18px 20px",
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  color: "#000000",
                  marginBottom: "8px",
                }}
              >
                🔗 등록된 링크
              </span>
              <span
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  color: "#000000",
                  lineHeight: 1,
                }}
              >
                {totalLinks}개
              </span>
            </div>

            {/* 3. 주요 카테고리 */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#A7F3D0",
                border: "3px solid #000000",
                boxShadow: "4px 4px 0px #000000",
                borderRadius: "14px",
                padding: "18px 20px",
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  color: "#000000",
                  marginBottom: "8px",
                }}
              >
                🏆 인기 카테고리
              </span>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: "#000000",
                  lineHeight: 1.25,
                }}
              >
                {topCategory}
              </span>
            </div>
          </div>

          {/* 하단 요약 안내 배너 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#FFFBEB",
              border: "2px solid #000000",
              borderRadius: "10px",
              padding: "10px 18px",
              fontSize: 16,
              fontWeight: 800,
              color: "#000000",
            }}
          >
            <span>
              📈 실시간 클릭 추적으로 어떤 링크가 가장 많은 관심을 받았는지 한눈에 파악하세요!
            </span>
          </div>
        </div>

        {/* 하단 푸터 바 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 17,
              fontWeight: 900,
              color: "#18181b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚡ 마이링크 실시간 링크 클릭 분석 플랫폼</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#000000",
              color: "#FFFFFF",
              border: "2px solid #000000",
              borderRadius: "8px",
              padding: "6px 16px",
              fontSize: 16,
              fontWeight: 900,
            }}
          >
            <span>🔗 mylink.kr/@{username}/stats</span>
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        {
          name: "Noto Sans KR",
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
