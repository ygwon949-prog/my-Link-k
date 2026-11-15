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
 * 이메일 주소에서 '@' 앞부분을 추출하여 반환합니다 (username 용도).
 */
export function getEmailUsername(
  email?: string | null,
  fallbackUsername?: string | null
): string {
  const emailPrefix = email ? email.split("@")[0]?.trim() : "";
  if (emailPrefix) {
    return emailPrefix;
  }
  return fallbackUsername?.trim() || "user";
}

/**
 * (하위 호환용) 이메일 주소에서 '@' 앞부분을 추출하여 반환합니다.
 */
export function getEmailDisplayName(
  email?: string | null,
  fallbackName?: string | null
): string {
  return getEmailUsername(email, fallbackName);
}

/**
 * 사용자의 아이디(username)를 반환합니다.
 * 항상 이메일의 '@' 앞부분을 최우선으로 사용합니다.
 */
export function getUserName(
  email?: string | null,
  fallbackUsername?: string | null
): string {
  return getEmailUsername(email, fallbackUsername);
}

/**
 * 사용자의 표시용 이름(displayName)을 반환합니다.
 * 사용자가 설정/수정한 displayName이 있으면 우선 사용하고,
 * 없으면 Google 로그인 시 전달되는 이름(googleDisplayName)을 기본값으로 사용합니다.
 */
export function getDisplayName(
  displayName?: string | null,
  googleDisplayName?: string | null,
  email?: string | null
): string {
  if (displayName?.trim()) {
    return displayName.trim();
  }
  if (googleDisplayName?.trim()) {
    return googleDisplayName.trim();
  }
  return getEmailUsername(email, DEFAULT_PROFILE_DATA.name);
}

/**
 * Firebase Auth User 객체에서 Google 프로바이더 원본 이름을 추출합니다.
 */
export function extractGoogleAuthName(firebaseUser?: User | null): string {
  if (!firebaseUser) return "";
  const googleProvider = firebaseUser.providerData?.find(
    (p) => p.providerId === "google.com"
  );
  if (googleProvider?.displayName?.trim()) {
    return googleProvider.displayName.trim();
  }
  return firebaseUser.displayName?.trim() || "";
}

/**
 * Firebase Auth의 User 객체로부터 기본 UserProfile 객체를 생성합니다.
 * - username: 이메일의 앞부분('@' 이전 문자열)
 * - displayName: 로그인 시 Google 계정에서 나오는 이름(googleDisplayName) 기본값
 */
export function buildUserProfileFromAuth(firebaseUser: User): UserProfile {
  const username = getEmailUsername(firebaseUser.email);
  const googleDisplayName =
    extractGoogleAuthName(firebaseUser) || username || DEFAULT_PROFILE_DATA.name;
  const displayName = getDisplayName(
    googleDisplayName,
    googleDisplayName,
    firebaseUser.email
  );

  return {
    uid: firebaseUser.uid,
    username,
    displayName,
    googleDisplayName,
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

    // username은 항상 이메일 앞부분('@' 이전 문자열)
    const resolvedUsername = getEmailUsername(
      resolvedEmail,
      typeof existingData?.username === "string" ? existingData.username : null
    );

    const googleDisplayName =
      extractGoogleAuthName(firebaseUser) ||
      (typeof existingData?.googleDisplayName === "string" &&
      existingData.googleDisplayName.trim()
        ? existingData.googleDisplayName.trim()
        : resolvedUsername);

    const existingDisplayName =
      typeof existingData?.displayName === "string"
        ? existingData.displayName.trim()
        : "";
    const hasCustomUpdate = Boolean(existingData?.updatedAt);

    // 이전 버전에서 displayName에 이메일 앞부분이 자동 저장된 레거시 문서인 경우 Google 이름으로 보정
    const isLegacyEmailPrefixDisplayName =
      !hasCustomUpdate &&
      existingDisplayName === resolvedUsername &&
      Boolean(googleDisplayName) &&
      googleDisplayName !== resolvedUsername;

    const resolvedDisplayName = isLegacyEmailPrefixDisplayName
      ? googleDisplayName
      : getDisplayName(existingDisplayName, googleDisplayName, resolvedEmail);

    const mergedProfile: UserProfile = {
      uid: firebaseUser.uid,
      username: resolvedUsername,
      displayName: resolvedDisplayName,
      googleDisplayName,
      email: resolvedEmail,
      photoURL:
        (typeof existingData?.photoURL === "string" &&
        existingData.photoURL.trim()
          ? existingData.photoURL.trim()
          : firebaseUser.photoURL) || baseProfile.photoURL,
      badge:
        typeof existingData?.badge === "string" && existingData.badge.trim()
          ? existingData.badge.trim()
          : baseProfile.badge,
      bio:
        typeof existingData?.bio === "string" && existingData.bio.trim()
          ? existingData.bio.trim()
          : baseProfile.bio,
      lastLoginAt: baseProfile.lastLoginAt,
      ...(typeof existingData?.updatedAt === "string"
        ? { updatedAt: existingData.updatedAt }
        : {}),
    };

    await setDoc(
      userDocRef,
      {
        uid: mergedProfile.uid,
        username: mergedProfile.username,
        displayName: mergedProfile.displayName,
        displayNameLower: mergedProfile.displayName.toLowerCase(),
        googleDisplayName: mergedProfile.googleDisplayName,
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
    console.warn(
      "Firestore 유저 프로필 문서 동기화 경고 (기본 인증 정보 사용):",
      error
    );
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
    const resolvedUsername = getEmailUsername(
      resolvedEmail,
      typeof data.username === "string"
        ? data.username
        : fallbackUser?.username
    );
    const googleDisplayName =
      typeof data.googleDisplayName === "string" &&
      data.googleDisplayName.trim()
        ? data.googleDisplayName.trim()
        : fallbackUser?.googleDisplayName || resolvedUsername;
    const resolvedDisplayName = getDisplayName(
      typeof data.displayName === "string"
        ? data.displayName
        : fallbackUser?.displayName,
      googleDisplayName,
      resolvedEmail
    );

    return {
      uid,
      username: resolvedUsername,
      displayName: resolvedDisplayName,
      googleDisplayName,
      email: resolvedEmail,
      photoURL:
        typeof data.photoURL === "string" && data.photoURL.trim()
          ? data.photoURL.trim()
          : fallbackUser?.photoURL ||
            DEFAULT_PROFILE_DATA.avatarUrl ||
            "/avatar.png",
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
      updatedAt:
        typeof data.updatedAt === "string"
          ? data.updatedAt
          : fallbackUser?.updatedAt,
    };
  } catch (error) {
    console.warn("Firestore 유저 프로필 조회 실패:", error);
    return fallbackUser ?? null;
  }
}

/**
 * Firestore의 users 컬렉션에서 다른 사용자가 동일한 displayName을 사용 중인지 중복 여부를 확인합니다.
 * @param displayName 확인할 표시 이름
 * @param excludeUid 중복 검사에서 제외할 현재 로그인 사용자의 UID
 * @returns 중복이면 true, 사용 가능하면 false
 */
export async function checkDisplayNameDuplicate(
  displayName: string,
  excludeUid?: string
): Promise<boolean> {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return false;
  }

  const normalizedTarget = trimmed.toLowerCase();
  const currentUid = excludeUid?.trim() || auth.currentUser?.uid;

  const usersCol = collection(db, USERS_COLLECTION);
  const snapshot = await getDocs(usersCol);

  for (const docSnap of snapshot.docs) {
    if (currentUid && docSnap.id === currentUid) {
      continue;
    }

    const data = docSnap.data();
    const docDisplayNameLower =
      typeof data.displayNameLower === "string"
        ? data.displayNameLower.trim().toLowerCase()
        : "";
    const docDisplayName =
      typeof data.displayName === "string"
        ? data.displayName.trim().toLowerCase()
        : "";

    if (
      docDisplayNameLower === normalizedTarget ||
      docDisplayName === normalizedTarget
    ) {
      return true;
    }
  }

  return false;
}

export interface UpdateUserProfileInput {
  displayName: string;
  badge: string;
  bio: string;
  photoURL?: string;
}

/**
 * 사용자의 프로필 정보(displayName, badge, bio, photoURL)를 Firestore(users/{uid})에 수정 저장합니다.
 * username은 이메일 앞부분으로 유지되며, displayName 중복 여부를 저장 전 검증합니다.
 */
export async function updateUserProfileInFirestore(
  input: UpdateUserProfileInput,
  uid?: string
): Promise<UserProfile> {
  const targetUid = resolveTargetUid(uid);
  const trimmedDisplayName = input.displayName.trim();
  const trimmedBadge = input.badge.trim() || DEFAULT_PROFILE_DATA.badge;
  const trimmedBio = input.bio.trim() || DEFAULT_PROFILE_DATA.bio;
  const trimmedPhotoURL = input.photoURL?.trim();

  // 저장 전 displayName 중복 여부 재검증
  const isDuplicate = await checkDisplayNameDuplicate(
    trimmedDisplayName,
    targetUid
  );
  if (isDuplicate) {
    throw new Error(
      "이미 다른 사용자가 사용 중인 표시 이름(Display Name)입니다. 다른 이름을 입력해주세요."
    );
  }

  const userDocRef = getUserDoc(targetUid);
  const existingSnap = await getDoc(userDocRef);
  const existingData = existingSnap.exists() ? existingSnap.data() : null;

  const currentUser = auth.currentUser;
  const resolvedEmail =
    currentUser?.email ||
    (typeof existingData?.email === "string" ? existingData.email : "");
  const resolvedUsername = getEmailUsername(
    resolvedEmail,
    typeof existingData?.username === "string" ? existingData.username : null
  );
  const googleDisplayName =
    extractGoogleAuthName(currentUser) ||
    (typeof existingData?.googleDisplayName === "string" &&
    existingData.googleDisplayName.trim()
      ? existingData.googleDisplayName.trim()
      : resolvedUsername);

  const resolvedPhotoURL =
    trimmedPhotoURL ||
    (typeof existingData?.photoURL === "string" && existingData.photoURL.trim()
      ? existingData.photoURL.trim()
      : currentUser?.photoURL) ||
    DEFAULT_PROFILE_DATA.avatarUrl ||
    "/avatar.png";

  const nowIso = new Date().toISOString();

  const updatedProfile: UserProfile = {
    uid: targetUid,
    username: resolvedUsername,
    displayName: trimmedDisplayName,
    googleDisplayName,
    email: resolvedEmail,
    photoURL: resolvedPhotoURL,
    badge: trimmedBadge,
    bio: trimmedBio,
    lastLoginAt:
      typeof existingData?.lastLoginAt === "string"
        ? existingData.lastLoginAt
        : nowIso,
    updatedAt: nowIso,
  };

  await setDoc(
    userDocRef,
    {
      uid: updatedProfile.uid,
      username: updatedProfile.username,
      displayName: updatedProfile.displayName,
      displayNameLower: updatedProfile.displayName.toLowerCase(),
      googleDisplayName: updatedProfile.googleDisplayName,
      email: updatedProfile.email,
      photoURL: updatedProfile.photoURL,
      badge: updatedProfile.badge,
      bio: updatedProfile.bio,
      lastLoginAt: updatedProfile.lastLoginAt,
      updatedAt: updatedProfile.updatedAt,
    },
    { merge: true }
  );

  return updatedProfile;
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
