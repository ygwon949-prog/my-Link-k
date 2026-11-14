import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  deleteField,
  getDoc,
  getDocs,
  query,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db, auth } from "./firebase";
import { LinkItem, UserProfile } from "@/types";
import { DEFAULT_PROFILE_DATA } from "@/data";

/**
 * 사용자별 개인화 링크 저장용 Firestore 컬렉션 경로: users/{user.uid}/links
 */
export const USERS_COLLECTION = "users";
export const ANONYMOUS_USER_ID = "anonymous";
export const LINKS_SUBCOLLECTION = "links";
export const ANONYMOUS_LINKS_PATH = `${USERS_COLLECTION}/${ANONYMOUS_USER_ID}/${LINKS_SUBCOLLECTION}`;

/**
 * users/{uid} 문서 경로 문자열을 반환합니다.
 */
export function getUserDocPath(uid: string): string {
  return `${USERS_COLLECTION}/${uid}`;
}

/**
 * users/{uid}/links 서브컬렉션 경로 문자열을 반환합니다.
 */
export function getUserLinksPath(uid: string): string {
  return `${USERS_COLLECTION}/${uid}/${LINKS_SUBCOLLECTION}`;
}

/**
 * users/{uid} 문서 레퍼런스를 반환합니다.
 */
export function getUserDoc(uid: string) {
  return doc(db, USERS_COLLECTION, uid);
}

/**
 * users/{uid}/links 컬렉션 레퍼런스를 반환합니다.
 */
export function getUserLinksCollection(uid: string) {
  return collection(db, USERS_COLLECTION, uid, LINKS_SUBCOLLECTION);
}

/**
 * users/{uid}/links/{linkId} 문서 레퍼런스를 반환합니다.
 */
export function getUserLinkDoc(uid: string, linkId: string) {
  return doc(db, USERS_COLLECTION, uid, LINKS_SUBCOLLECTION, linkId);
}

/**
 * (하위 호환용) users/anonymous/links 컬렉션 레퍼런스를 반환합니다.
 */
export function getAnonymousLinksCollection() {
  const uid = auth.currentUser?.uid || ANONYMOUS_USER_ID;
  return getUserLinksCollection(uid);
}

/**
 * (하위 호환용) users/anonymous/links/{linkId} 문서 레퍼런스를 반환합니다.
 */
export function getAnonymousLinkDoc(linkId: string) {
  const uid = auth.currentUser?.uid || ANONYMOUS_USER_ID;
  return getUserLinkDoc(uid, linkId);
}

/**
 * 현재 요청에 사용할 사용자 UID를 확인합니다.
 */
function resolveTargetUid(uid?: string): string {
  const resolved = uid?.trim() || auth.currentUser?.uid;
  if (!resolved) {
    throw new Error("로그인이 필요한 기능입니다. Google 계정으로 로그인 후 다시 시도해주세요.");
  }
  return resolved;
}

/**
 * 이메일 주소에서 '@' 앞부분을 추출하여 반환합니다 (displayName 용도).
 */
export function getEmailDisplayName(
  email?: string | null,
  fallbackName?: string | null
): string {
  const emailPrefix = email ? email.split("@")[0]?.trim() : "";
  if (emailPrefix) {
    return emailPrefix;
  }
  return fallbackName?.trim() || DEFAULT_PROFILE_DATA.name;
}

/**
 * 사용자의 표시용 이름(username)을 반환합니다.
 * Google 로그인 시 전달되는 이름(authDisplayName)을 최우선으로 사용합니다.
 */
export function getUserName(
  username?: string | null,
  fallbackDisplayName?: string | null,
  email?: string | null
): string {
  if (username?.trim()) {
    return username.trim();
  }
  if (fallbackDisplayName?.trim()) {
    return fallbackDisplayName.trim();
  }
  return getEmailDisplayName(email);
}

/**
 * Firebase Auth의 User 객체로부터 기본 UserProfile 객체를 생성합니다.
 * - username: 로그인 시 Google 계정에서 나오는 이름(firebaseUser.displayName)
 * - displayName: 이메일의 앞부분('@' 이전 문자열)
 */
export function buildUserProfileFromAuth(firebaseUser: User): UserProfile {
  const displayName = getEmailDisplayName(
    firebaseUser.email,
    firebaseUser.displayName
  );
  const username = getUserName(
    firebaseUser.displayName,
    displayName,
    firebaseUser.email
  );

  return {
    uid: firebaseUser.uid,
    username,
    displayName,
    email: firebaseUser.email || "",
    photoURL:
      firebaseUser.photoURL || DEFAULT_PROFILE_DATA.avatarUrl || "/avatar.png",
    badge: DEFAULT_PROFILE_DATA.badge,
    bio: DEFAULT_PROFILE_DATA.bio,
    lastLoginAt: new Date().toISOString(),
  };
}

/**
 * 로그인한 사용자의 프로필 정보를 Firestore(경로: users/{user.uid})에 동기화하고
 * 해당 경로에 저장된 최신 유저 정보를 반환합니다.
 */
export async function syncUserProfileToFirestore(
  firebaseUser: User
): Promise<UserProfile> {
  const baseProfile = buildUserProfileFromAuth(firebaseUser);
  const userDocRef = getUserDoc(firebaseUser.uid);

  try {
    const existingSnap = await getDoc(userDocRef);
    const existingData = existingSnap.exists() ? existingSnap.data() : null;
    const resolvedEmail =
      firebaseUser.email ||
      (typeof existingData?.email === "string" ? existingData.email : "");

    const resolvedDisplayName = getEmailDisplayName(
      resolvedEmail,
      firebaseUser.displayName ||
        (typeof existingData?.displayName === "string"
          ? existingData.displayName
          : null)
    );

    const resolvedUsername = getUserName(
      firebaseUser.displayName ||
        (typeof existingData?.username === "string"
          ? existingData.username
          : null),
      resolvedDisplayName,
      resolvedEmail
    );

    const mergedProfile: UserProfile = {
      uid: firebaseUser.uid,
      username: resolvedUsername,
      displayName: resolvedDisplayName,
      email: resolvedEmail,
      photoURL:
        firebaseUser.photoURL ||
        (typeof existingData?.photoURL === "string" &&
        existingData.photoURL.trim()
          ? existingData.photoURL.trim()
          : baseProfile.photoURL),
      badge:
        typeof existingData?.badge === "string" && existingData.badge.trim()
          ? existingData.badge.trim()
          : baseProfile.badge,
      bio:
        typeof existingData?.bio === "string" && existingData.bio.trim()
          ? existingData.bio.trim()
          : baseProfile.bio,
      lastLoginAt: baseProfile.lastLoginAt,
    };

    await setDoc(
      userDocRef,
      {
        uid: mergedProfile.uid,
        username: mergedProfile.username,
        displayName: mergedProfile.displayName,
        email: mergedProfile.email,
        photoURL: mergedProfile.photoURL,
        badge: mergedProfile.badge,
        bio: mergedProfile.bio,
        lastLoginAt: mergedProfile.lastLoginAt,
      },
      { merge: true }
    );

    return mergedProfile;
  } catch (error) {
    console.warn("Firestore 유저 프로필 문서 동기화 경고 (기본 인증 정보 사용):", error);
    return baseProfile;
  }
}

/**
 * Firestore(경로: users/{uid})에서 유저 정보를 조회합니다.
 */
export async function fetchUserProfileFromFirestore(
  uid: string,
  fallbackUser?: UserProfile
): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(getUserDoc(uid));
    if (!snap.exists()) {
      return fallbackUser ?? null;
    }
    const data = snap.data();
    const resolvedEmail =
      typeof data.email === "string" && data.email.trim()
        ? data.email.trim()
        : fallbackUser?.email || "";
    const resolvedDisplayName = getEmailDisplayName(
      resolvedEmail,
      typeof data.displayName === "string"
        ? data.displayName
        : fallbackUser?.displayName
    );
    const resolvedUsername = getUserName(
      typeof data.username === "string" ? data.username : fallbackUser?.username,
      resolvedDisplayName,
      resolvedEmail
    );

    return {
      uid,
      username: resolvedUsername,
      displayName: resolvedDisplayName,
      email: resolvedEmail,
      photoURL:
        typeof data.photoURL === "string" && data.photoURL.trim()
          ? data.photoURL.trim()
          : fallbackUser?.photoURL || DEFAULT_PROFILE_DATA.avatarUrl || "/avatar.png",
      badge:
        typeof data.badge === "string" && data.badge.trim()
          ? data.badge.trim()
          : fallbackUser?.badge || DEFAULT_PROFILE_DATA.badge,
      bio:
        typeof data.bio === "string" && data.bio.trim()
          ? data.bio.trim()
          : fallbackUser?.bio || DEFAULT_PROFILE_DATA.bio,
      lastLoginAt:
        typeof data.lastLoginAt === "string"
          ? data.lastLoginAt
          : fallbackUser?.lastLoginAt,
    };
  } catch (error) {
    console.warn("Firestore 유저 프로필 조회 실패:", error);
    return fallbackUser ?? null;
  }
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
 * 새로운 링크를 Firestore(경로: users/{user.uid}/links)에 추가합니다.
 */
export async function addLinkToFirestore(
  linkInput: Omit<LinkItem, "id"> & { id?: string },
  uid?: string
): Promise<LinkItem> {
  const targetUid = resolveTargetUid(uid);
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

  const docRef = await addDoc(getUserLinksCollection(targetUid), payload);

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
 * 기존 링크를 Firestore(경로: users/{user.uid}/links/{linkId})에서 수정합니다.
 */
export async function updateLinkInFirestore(
  linkId: string,
  linkInput: Omit<LinkItem, "id"> & { id?: string },
  uid?: string
): Promise<LinkItem> {
  const targetUid = resolveTargetUid(uid);
  const createdAt = linkInput.createdAt || new Date().toISOString();
  const trimmedDescription = linkInput.description?.trim();
  const docRef = getUserLinkDoc(targetUid, linkId);

  const baseFields: Record<string, unknown> = {
    title: linkInput.title.trim(),
    url: linkInput.url.trim(),
    icon: linkInput.icon?.trim() || "🔗",
    category: linkInput.category || "개발",
    isPinned: Boolean(linkInput.isPinned),
    createdAt,
  };

  try {
    await updateDoc(docRef, {
      ...baseFields,
      description: trimmedDescription ? trimmedDescription : deleteField(),
    });
  } catch (error) {
    const errCode = (error as { code?: string })?.code;
    const errMsg = error instanceof Error ? error.message : "";
    if (errCode === "not-found" || errMsg.includes("No document to update")) {
      const setPayload: Record<string, unknown> = { ...baseFields };
      if (trimmedDescription) {
        setPayload.description = trimmedDescription;
      }
      await setDoc(docRef, setPayload);
    } else {
      throw error;
    }
  }

  return {
    id: linkId,
    title: baseFields.title as string,
    url: baseFields.url as string,
    icon: baseFields.icon as string,
    ...(trimmedDescription ? { description: trimmedDescription } : {}),
    category: baseFields.category as string,
    isPinned: baseFields.isPinned as boolean,
    createdAt,
  };
}

/**
 * 기존 링크를 Firestore(경로: users/{user.uid}/links/{linkId})에서 삭제합니다.
 */
export async function deleteLinkFromFirestore(
  linkId: string,
  uid?: string
): Promise<void> {
  const targetUid = resolveTargetUid(uid);
  const docRef = getUserLinkDoc(targetUid, linkId);
  await deleteDoc(docRef);
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
 * Firestore(경로: users/{uid}/links)에서 저장된 개인화 링크 목록을 최신순으로 조회합니다.
 */
export async function fetchUserLinks(uid: string): Promise<LinkItem[]> {
  if (!uid?.trim()) {
    return [];
  }
  const q = query(
    getUserLinksCollection(uid.trim()),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  const links = snapshot.docs.map(mapDocToLinkItem);
  return sortLinksByCreatedAtDesc(links);
}

/**
 * (하위 호환용) 현재 로그인한 사용자의 링크 목록을 조회합니다.
 */
export async function fetchAnonymousLinks(): Promise<LinkItem[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    return [];
  }
  return fetchUserLinks(uid);
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
