---
name: 마이링크 네오브루탈리즘 (MyLink Neobrutalism)
slug: neobrutalism
category: profile-link
last_updated: "2026-11-09"
created_at: "2026-10-03"
lang: ko
---

# Neobrutalism Design System Specification (with shadcn/ui)

본 문서는 **마이링크 (MyLink)** 프로젝트의 디자인 시스템 가이드입니다.  
**shadcn/ui**의 유연한 프리미티브 컴포넌트 아키텍처를 기반으로 하되, 시각적 스타일은 **네오브루탈리즘(Neobrutalism)** 테마를 엄격히 준수하여 구축합니다.

---

## 1. 핵심 디자인 원칙 (Core Principles)

1. **대담하고 선명한 테두리 (High-Contrast Bold Borders)**:
   - 모든 컴포넌트(카드, 버튼, 뱃지, 모달, 입력창 등)는 투명도 없는 **순수 블랙(`border-black` / `#000000`)** 테두리를 기본으로 사용합니다.
   - 기본 두께: `border-[2px]` (버튼/뱃지/입력창), `border-[2.5px] ~ border-[3px]` (카드/모달).
2. **블러 없는 하드 그림자 (Zero-Blur Hard Shadows)**:
   - 부드러운 Gaussian Blur 대신, x/y 오프셋만 적용된 **하드 드롭 섀도우(`shadow-[x_y_0px_#000000]`)**를 사용합니다.
   - 카드: `6px 6px 0px #000000`
   - 버튼/입력창: `3px 3px 0px #000000`
   - 뱃지/스티커: `2px 2px 0px #000000`
3. **손맛이 느껴지는 촉각적 인터랙션 (Tactile Micro-Interactions)**:
   - 버튼/링크 호버(Hover): 오른쪽 아래로 살짝 이동하며 그림자가 줄어듦 (`hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1.5px_1.5px_0px_#000000]`)
   - 클릭(Active): 완전히 눌리며 그림자가 사라짐 (`active:translate-x-[3px] active:translate-y-[3px] active:shadow-none`)
4. **비비드 & 레트로 파스텔 컬러 팔레트 (Vibrant & Retro Pastel Palette)**:
   - 채도가 높고 경쾌한 옐로우, 민트, 스카이블루, 핑크를 조화롭게 사용하여 유쾌하고 독창적인 개성을 전달합니다.

---

## 2. 디자인 토큰 정의 (Design Tokens)

### 2.1 컬러 시스템 (Color Palette)

| 토큰명 | Hex 코드 | shadcn 시맨틱 매핑 | 용도 |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#FFFBEB` (Amber 50) | `--background` | 전체 페이지 레트로 크림 배경 |
| **Pure Black** | `#000000` | `--foreground`, `--border`, `--ring` | 텍스트, 모든 테두리, 하드 섀도우 |
| **Signature Yellow** | `#FEF08A` (Yellow 200) | `--primary`, `--card` | 프로필 카드 배경, 메인 버튼, 로고 |
| **Mint Green** | `#A7F3D0` (Emerald 200) | `--accent` | `OPEN TO WORK` 상태 뱃지, 강조 태그 |
| **Sky Blue** | `#BAE6FD` (Sky 200) | `--secondary` | 서브 액션 버튼, 연락처 링크 |
| **Retro Pink** | `#F472B6` (Pink 400) | 커스텀 악센트 | 장식용 스티커, 하이라이트 |
| **Vivid Cyan** | `#67E8F9` (Cyan 300) | 커스텀 악센트 | 장식용 스티커 |
| **Activity Green** | `#4ADE80` (Green 400) | 커스텀 상태 | 온라인/활동중 펄스 인디케이터 |
| **Destructive Red** | `#F87171` (Red 400) | `--destructive` | 삭제, 위험 액션 버튼 |
| **Card White** | `#FFFFFF` | `--popover`, 입력 필드 | 모달 폼, 링크 버튼, 입력창 배경 |

### 2.2 테두리 및 그림자 (Borders & Shadows)

| 토큰명 | CSS 값 | Tailwind 클래스 | 적용 대상 |
| :--- | :--- | :--- | :--- |
| **Border Thin** | `2px solid #000000` | `border-[2px] border-black` | 뱃지, 태그, 입력창 |
| **Border Medium** | `2.5px solid #000000` | `border-[2.5px] border-black` | 링크 버튼, 서브 컴포넌트 |
| **Border Thick** | `3px solid #000000` | `border-[3px] border-black` | 프로필 카드 본체, 다이얼로그 모달, 헤더 |
| **Shadow Hard Small** | `2px 2px 0px #000000` | `shadow-[2px_2px_0px_#000000]` | 뱃지, 스티커, 태그 |
| **Shadow Hard Medium** | `3px 3px 0px #000000` | `shadow-[3px_3px_0px_#000000]` | 버튼, 입력 필드, 드롭다운 |
| **Shadow Hard Large** | `4px 4px 0px #000000` | `shadow-[4px_4px_0px_#000000]` | 아바타 이미지 |
| **Shadow Hard Card** | `6px 6px 0px #000000` | `shadow-[6px_6px_0px_#000000]` | 프로필 카드 본체, 편집 모달 |

### 2.3 라운딩 (Border Radius)

- `rounded-[8px]`: 뱃지, 태그, 헤더 로고
- `rounded-[10px]`: 링크 버튼, 입력 필드
- `rounded-[12px]`: 프로필 카드, 다이얼로그 모달
- `rounded-full`: 아바타 이미지, 원형 상태 표시등

---

## 3. shadcn/ui 컴포넌트 커스터마이징 가이드

shadcn/ui의 컴포넌트는 Neobrutalism 스타일 가이드에 맞추어 기본 variant와 슬롯을 커스텀합니다.

### 3.1 Button (`src/components/ui/button.tsx`)
- **공통 베이스**: `font-black border-[2px] sm:border-[2.5px] border-black rounded-[10px] shadow-[3px_3px_0px_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1.5px_1.5px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all`
- **Variants**:
  - `default`: `bg-primary text-black hover:bg-primary/90` (시그니처 옐로우 `#FEF08A`)
  - `secondary`: `bg-secondary text-black hover:bg-secondary/90` (스카이블루 `#BAE6FD`)
  - `accent`: `bg-accent text-black hover:bg-accent/90` (민트 `#A7F3D0`)
  - `outline`: `bg-white text-black hover:bg-zinc-50`
  - `destructive`: `bg-destructive text-black hover:bg-destructive/90`
  - `ghost`: `border-transparent shadow-none hover:bg-black/10`

### 3.2 Card / Dialog / Sheet (예정)
- 배경: `bg-card` (`#FEF08A` 카드형) 또는 `bg-white` (모달형)
- 테두리: `border-[3px] border-black`
- 그림자: `shadow-[6px_6px_0px_#000000]`
- 모서리: `rounded-[12px]`

### 3.3 Input / Textarea (예정)
- 배경: `bg-white text-black font-medium`
- 테두리: `border-[2px] border-black`
- 그림자: `shadow-[2px_2px_0px_#000000] focus:shadow-[3px_3px_0px_#000000] focus:ring-0`
- 모서리: `rounded-[8px]`

---

## 4. 배경 및 장식 패턴 (Patterns & Accents)

1. **레트로 도트 그리드**:
   - `bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-10`
2. **기울어진 스티커 (Tilted Stickers)**:
   - `-rotate-12` 또는 `rotate-6` 회전 각도 부여
   - 굵은 테두리와 작은 하드 섀도우로 카드 위에 얹힌 입체감 연출
