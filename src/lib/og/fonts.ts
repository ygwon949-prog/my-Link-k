import { readFile } from "node:fs/promises";
import { join } from "node:path";

let cachedFont: ArrayBuffer | null = null;

/**
 * OG 이미지 생성 시 사용할 한글/영문 공통 Noto Sans KR Bold 폰트 버퍼를 반환합니다.
 */
export async function getOgFont(): Promise<ArrayBuffer> {
  if (cachedFont) {
    return cachedFont;
  }

  try {
    const fontPath = join(process.cwd(), "src/assets/fonts/NotoSansKR-Bold.ttf");
    const buffer = await readFile(fontPath);
    cachedFont = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
    return cachedFont;
  } catch (err) {
    console.warn("로컬 폰트 로드 실패, 원격 폰트 다운로드 시도:", err);
    // Fallback: Google Fonts 원격 폰트 페칭
    const res = await fetch(
      "https://fonts.gstatic.com/s/notosanskr/v40/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzg01eLQ.ttf"
    );
    cachedFont = await res.arrayBuffer();
    return cachedFont;
  }
}
