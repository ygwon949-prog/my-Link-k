import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import { LinkItem } from "@/types";

/**
 * 익명 사용자 링크 저장용 Firestore 컬렉션 경로: users/anonymous/links
 */
export const USERS_COLLECTION = "users";
export const ANONYMOUS_USER_ID = "anonymous";
export const LINKS_SUBCOLLECTION = "links";
export const ANONYMOUS_LINKS_PATH = `${USERS_COLLECTION}/${ANONYMOUS_USER_ID}/${LINKS_SUBCOLLECTION}`;

/**
 * users/anonymous/links 컬렉션 레퍼런스를 반환합니다.
 */
export function getAnonymousLinksCollection() {
  return collection(db, USERS_COLLECTION, ANONYMOUS_USER_ID, LINKS_SUBCOLLECTION);
}

/**
 * Firestore 문서 스냅샷을 LinkItem 객체로 변환합니다.
 */
function mapDocToLinkItem(
  docSnap: QueryDocumentSnapshot<DocumentData>
): LinkItem {
  const data = docSnap.data();

  let createdAt: string;
  if (typeof data.createdAt === "string") {
    createdAt = data.createdAt;
  } else if (
    data.createdAt &&
    typeof (data.createdAt as { toDate?: () => Date }).toDate === "function"
  ) {
    createdAt = (data.createdAt as { toDate: () => Date })
      .toDate()
      .toISOString();
  } else {
    createdAt = new Date().toISOString();
  }

  return {
    id: docSnap.id,
    title: typeof data.title === "string" ? data.title : "",
    url: typeof data.url === "string" ? data.url : "",
    icon: typeof data.icon === "string" && data.icon.trim() ? data.icon : "🔗",
    description:
      typeof data.description === "string" && data.description.trim()
        ? data.description
        : undefined,
    category:
      typeof data.category === "string" && data.category.trim()
        ? data.category
        : "개발",
    isPinned: Boolean(data.isPinned),
    createdAt,
  };
}

/**
 * 새로운 링크를 Firestore(경로: users/anonymous/links)에 추가합니다.
 */
export async function addLinkToFirestore(
  linkInput: Omit<LinkItem, "id"> & { id?: string }
): Promise<LinkItem> {
  const createdAt = linkInput.createdAt || new Date().toISOString();
  const trimmedDescription = linkInput.description?.trim();

  // Firestore는 undefined 필드 값을 허용하지 않으므로 유효한 필드만 구성
  const payload: Record<string, unknown> = {
    title: linkInput.title.trim(),
    url: linkInput.url.trim(),
    icon: linkInput.icon?.trim() || "🔗",
    category: linkInput.category || "개발",
    isPinned: Boolean(linkInput.isPinned),
    createdAt,
  };

  if (trimmedDescription) {
    payload.description = trimmedDescription;
  }

  const docRef = await addDoc(getAnonymousLinksCollection(), payload);

  return {
    id: docRef.id,
    title: payload.title as string,
    url: payload.url as string,
    icon: payload.icon as string,
    ...(trimmedDescription ? { description: trimmedDescription } : {}),
    category: payload.category as string,
    isPinned: payload.isPinned as boolean,
    createdAt,
  };
}

/**
 * 링크 목록을 createdAt 기준 최신순(내림차순)으로 정렬합니다.
 */
export function sortLinksByCreatedAtDesc(links: LinkItem[]): LinkItem[] {
  return [...links].sort((a, b) => {
    const timeA = a.createdAt ? Date.parse(a.createdAt) : 0;
    const timeB = b.createdAt ? Date.parse(b.createdAt) : 0;
    const validTimeA = Number.isNaN(timeA) ? 0 : timeA;
    const validTimeB = Number.isNaN(timeB) ? 0 : timeB;
    return validTimeB - validTimeA;
  });
}

/**
 * Firestore(경로: users/anonymous/links)에서 저장된 링크 목록을 최신순으로 조회합니다.
 */
export async function fetchAnonymousLinks(): Promise<LinkItem[]> {
  const q = query(
    getAnonymousLinksCollection(),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  const links = snapshot.docs.map(mapDocToLinkItem);
  return sortLinksByCreatedAtDesc(links);
}

/**
 * Firestore에서 불러온 링크 목록과 기본(Base) 링크 목록을 중복(ID 또는 URL) 없이 병합하고
 * createdAt 기준 최신순으로 정렬하여 반환합니다.
 */
export function mergeFirestoreLinks(
  firestoreLinks: LinkItem[],
  baseLinks: LinkItem[]
): LinkItem[] {
  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();
  const merged: LinkItem[] = [];

  for (const item of [...firestoreLinks, ...baseLinks]) {
    const normalizedUrl = item.url.trim().toLowerCase();
    if (seenIds.has(item.id) || seenUrls.has(normalizedUrl)) {
      continue;
    }
    seenIds.add(item.id);
    seenUrls.add(normalizedUrl);
    merged.push(item);
  }

  return sortLinksByCreatedAtDesc(merged);
}
