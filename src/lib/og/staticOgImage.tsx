import { ImageResponse } from "next/og";
import { getOgFont } from "./fonts";

export const ogSize = {
  width: 1200,
  height: 630,
};

export const ogContentType = "image/png";

export interface StaticOgOptions {
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  tags?: string[];
  pathname?: string;
}

/**
 * 일반(정적) 경로를 위한 통일감 있는 네오브루탈리즘 스타일 OG 이미지를 생성합니다.
 */
export async function createStaticOgImage({
  title,
  description,
  badge = "⚡ MYLINK",
  badgeColor = "#A7F3D0",
  tags = ["#네오브루탈리즘", "#링크인바이오", "#실시간통계", "#초간편공유"],
  pathname = "mylink.kr",
}: StaticOgOptions): Promise<ImageResponse> {
  const fontData = await getOgFont();

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
          padding: "48px 56px",
          fontFamily: "'Noto Sans KR', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 네오브루탈리즘 레트로 도트 그리드 배경 SVG */}
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
              id="dot-grid"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="2" fill="#000000" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>

        {/* 상단 헤더 영역 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* 마이링크 메인 로고 뱃지 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "#FEF08A",
              border: "3.5px solid #000000",
              boxShadow: "4px 4px 0px #000000",
              borderRadius: "12px",
              padding: "10px 22px",
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 900, color: "#000000" }}>
              ⚡ mylink
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                backgroundColor: "#000000",
                color: "#FEF08A",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              PRO
            </span>
          </div>

          {/* 우측 상단 스티커 뱃지 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: badgeColor,
              border: "3px solid #000000",
              boxShadow: "4px 4px 0px #000000",
              borderRadius: "10px",
              padding: "8px 20px",
              transform: "rotate(2deg)",
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 900, color: "#000000" }}>
              {badge}
            </span>
          </div>
        </div>

        {/* 중앙 메인 쇼케이스 화이트 카드 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
            border: "4px solid #000000",
            boxShadow: "8px 8px 0px #000000",
            borderRadius: "18px",
            padding: "44px 50px",
            margin: "24px 0",
          }}
        >
          <div
            style={{
              fontSize: 50,
              fontWeight: 900,
              color: "#000000",
              lineHeight: 1.25,
              marginBottom: "16px",
              display: "flex",
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 23,
              fontWeight: 700,
              color: "#3f3f46",
              lineHeight: 1.45,
              marginBottom: "28px",
              display: "flex",
            }}
          >
            {description}
          </div>

          {/* 태그 리스트 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {tags.map((tag, idx) => {
              const bgColors = ["#BAE6FD", "#A7F3D0", "#FEF08A", "#F472B6", "#67E8F9"];
              const currentBg = bgColors[idx % bgColors.length];
              return (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: currentBg,
                    border: "2px solid #000000",
                    boxShadow: "2px 2px 0px #000000",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontSize: 16,
                    fontWeight: 900,
                    color: "#000000",
                  }}
                >
                  {tag}
                </div>
              );
            })}
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
              fontSize: 18,
              fontWeight: 900,
              color: "#18181b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>💥 가장 힙한 네오브루탈리즘 링크 인 바이오</span>
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
            <span>🔗 {pathname}</span>
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
