import { ImageResponse } from "next/og";
import { getOgFont } from "./fonts";
import { fetchUserByUsername, fetchUserLinks } from "@/lib/links";
import { DEFAULT_PROFILE_DATA } from "@/data";
import { SITE_DOMAIN } from "@/lib/constants";

export const ogSize = {
  width: 1200,
  height: 630,
};

export const ogContentType = "image/png";

interface DynamicProfileOgProps {
  username: string;
}

/**
 * 사용자 프로필 동적 경로(/[username])를 위한 감각적인 네오브루탈리즘 스타일 OG 이미지를 생성합니다.
 */
export async function createDynamicProfileOgImage({
  username,
}: DynamicProfileOgProps): Promise<ImageResponse> {
  const fontData = await getOgFont();

  // Firestore에서 유저 정보 및 링크 수 비동기 조회 (안전한 예외 처리 포함)
  let displayName = username;
  let bio = `@${username}님의 마이링크(MyLink) 프로필 및 링크 모음입니다.`;
  let badge = DEFAULT_PROFILE_DATA.badge || "크리에이터";
  let photoURL: string | null = null;
  let linksCount = 0;

  try {
    const userProfile = await fetchUserByUsername(username);
    if (userProfile) {
      displayName = userProfile.displayName || username;
      bio = userProfile.bio || bio;
      badge = userProfile.badge || badge;
      photoURL =
        userProfile.photoURL && userProfile.photoURL.startsWith("http")
          ? userProfile.photoURL
          : null;

      if (userProfile.uid) {
        const links = await fetchUserLinks(userProfile.uid);
        linksCount = links.length;
      }
    }
  } catch (err) {
    console.warn("OG 이미지 유저 데이터 조회 실패 (기본값 사용):", err);
  }

  // 아바타 이니셜 추출
  const initialChar = (displayName || username).slice(0, 1).toUpperCase();

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
              id="dot-grid-profile"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="2" fill="#000000" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid-profile)" />
        </svg>

        {/* 상단 힙한 네오브루탈리즘 스티커 2개 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* 좌측 스티커: 유저 핸들 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#67E8F9",
              border: "3px solid #000000",
              boxShadow: "4px 4px 0px #000000",
              borderRadius: "10px",
              padding: "8px 20px",
              transform: "rotate(-2deg)",
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 900, color: "#000000" }}>
              ⚡ @{username}
            </span>
          </div>

          {/* 중앙 로고 칩 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              border: "2.5px solid #000000",
              boxShadow: "3px 3px 0px #000000",
              borderRadius: "8px",
              padding: "6px 16px",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 900, color: "#000000" }}>
              mylink profile
            </span>
          </div>

          {/* 우측 스티커: 브랜드 슬로건 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#F472B6",
              border: "3px solid #000000",
              boxShadow: "4px 4px 0px #000000",
              borderRadius: "10px",
              padding: "8px 20px",
              transform: "rotate(2deg)",
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 900, color: "#000000" }}>
              🚀 MYLINK
            </span>
          </div>
        </div>

        {/* 중앙 시그니처 옐로우 메인 프로필 카드 */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FEF08A",
            border: "4.5px solid #000000",
            boxShadow: "10px 10px 0px #000000",
            borderRadius: "20px",
            padding: "36px 42px",
            margin: "18px 0",
            gap: "36px",
          }}
        >
          {/* 아바타 영역 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "70px",
                border: "3.5px solid #000000",
                boxShadow: "4px 4px 0px #000000",
                backgroundColor: "#BAE6FD",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoURL}
                  alt={displayName}
                  width="140"
                  height="140"
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: 64,
                    fontWeight: 900,
                    color: "#000000",
                  }}
                >
                  {initialChar}
                </span>
              )}

              {/* 온라인 상태 인디케이터 점 */}
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "8px",
                  width: "22px",
                  height: "22px",
                  borderRadius: "11px",
                  backgroundColor: "#4ADE80",
                  border: "2.5px solid #000000",
                }}
              />
            </div>

            {/* 아바타 하단 미니 뱃지 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#A7F3D0",
                border: "2px solid #000000",
                boxShadow: "2px 2px 0px #000000",
                borderRadius: "6px",
                padding: "3px 10px",
                fontSize: 13,
                fontWeight: 900,
                color: "#000000",
              }}
            >
              ONLINE
            </div>
          </div>

          {/* 프로필 정보 영역 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {/* 상단 뱃지 행 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#A7F3D0",
                  border: "2px solid #000000",
                  boxShadow: "2px 2px 0px #000000",
                  borderRadius: "8px",
                  padding: "4px 14px",
                  fontSize: 15,
                  fontWeight: 900,
                  color: "#000000",
                }}
              >
                {badge}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #000000",
                  boxShadow: "2px 2px 0px #000000",
                  borderRadius: "8px",
                  padding: "4px 12px",
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#000000",
                }}
              >
                🔗 {linksCount > 0 ? `${linksCount}개의 링크` : "프로필 링크"}
              </div>
            </div>

            {/* 표시 이름 & 핸들 */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "14px",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  color: "#000000",
                  lineHeight: 1.1,
                }}
              >
                {displayName}
              </span>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#525252",
                }}
              >
                @{username}
              </span>
            </div>

            {/* 소개글 bio */}
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#18181b",
                lineHeight: 1.4,
                marginBottom: "20px",
                display: "flex",
              }}
            >
              {bio}
            </div>

            {/* 하단 링크 바로가기 바 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#FFFFFF",
                border: "2.5px solid #000000",
                boxShadow: "3px 3px 0px #000000",
                borderRadius: "10px",
                padding: "10px 18px",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#000000",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                👉 {displayName}님의 링크 & 포트폴리오 지금 확인하기
              </span>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#BAE6FD",
                  border: "2px solid #000000",
                  borderRadius: "6px",
                  padding: "4px 12px",
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#000000",
                }}
              >
                OPEN
              </div>
            </div>
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
            <span>✨ 3초 만에 만드는 나만의 프로필 링크</span>
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
            <span>🔗 {SITE_DOMAIN}/@{username}</span>
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
