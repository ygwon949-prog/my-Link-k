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
  where,
  orderBy,
  writeBatch,
  increment,
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
/**
 * 표시 이름 유일성 보장용 예약 컬렉션: displayNames/{소문자 표시 이름} -> { uid }
 */
export const DISPLAY_NAMES_COLLECTION = "displayNames";
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
 *
 * - 최초 로그인: Google 이름을 기본 표시 이름으로 사용하되, 이미 사용 중이면 숫자를 붙여
 *   중복되지 않게 정하고 displayNames/{이름} 예약 문서와 함께 원자적으로 생성합니다.
 * - 재로그인: 표시 이름(displayName)은 수정 불가이므로 기존 값을 그대로 유지합니다.
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

    const buildMergedProfile = (displayName: string): UserProfile => ({
      uid: firebaseUser.uid,
      username: resolvedUsername,
      displayName,
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
    });

    const toDocPayload = (profile: UserProfile) => ({
      uid: profile.uid,
      username: profile.username,
      displayName: profile.displayName,
      displayNameLower: getDisplayNameKey(profile.displayName),
      googleDisplayName: profile.googleDisplayName,
      email: profile.email,
      photoURL: profile.photoURL,
      badge: profile.badge,
      bio: profile.bio,
      lastLoginAt: profile.lastLoginAt,
    });

    // ── 재로그인: 표시 이름 유지 (수정 불가) ──
    if (existingSnap.exists() && existingDisplayName) {
      const mergedProfile = buildMergedProfile(existingDisplayName);

      // 문서 ID로 쓸 수 없는 레거시 이름('/' 등)은 예약 없이 프로필만 동기화
      if (!isReservableDisplayName(existingDisplayName)) {
        await setDoc(userDocRef, toDocPayload(mergedProfile), { merge: true });
        return mergedProfile;
      }

      const reservationRef = getDisplayNameReservationRef(existingDisplayName);
      const reservationSnap = await getDoc(reservationRef);

      // 예약 문서가 없는 기존 사용자(마이그레이션)는 예약을 보강하되,
      // 다른 사용자가 이미 같은 이름을 예약한 경우에는 건너뜁니다.
      if (!reservationSnap.exists()) {
        try {
          const batch = writeBatch(db);
          batch.set(userDocRef, toDocPayload(mergedProfile), { merge: true });
          batch.set(reservationRef, { uid: firebaseUser.uid });
          await batch.commit();
          return mergedProfile;
        } catch (error) {
          console.warn("표시 이름 예약 보강 실패 (프로필만 동기화):", error);
        }
      }

      await setDoc(userDocRef, toDocPayload(mergedProfile), { merge: true });
      return mergedProfile;
    }

    // ── 최초 로그인: 중복되지 않는 표시 이름 결정 후 예약 문서와 함께 원자적으로 생성 ──
    const baseName = sanitizeDisplayName(googleDisplayName, resolvedUsername);
    let startIndex = 1;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { name, index } = await findAvailableDisplayName(
        baseName,
        firebaseUser.uid,
        startIndex
      );
      const mergedProfile = buildMergedProfile(name);

      try {
        const batch = writeBatch(db);
        batch.set(userDocRef, toDocPayload(mergedProfile), { merge: true });
        batch.set(getDisplayNameReservationRef(name), {
          uid: firebaseUser.uid,
        });
        await batch.commit();
        return mergedProfile;
      } catch (error) {
        // 동시 가입 등으로 같은 이름이 먼저 예약된 경우 다음 후보로 재시도
        lastError = error;
        startIndex = index + 1;
      }
    }

    throw lastError ?? new Error("표시 이름을 확정하지 못했습니다.");
  } catch (error) {
    console.warn(
      "Firestore 유저 프로필 문서 동기화 경고 (기본 인증 정보 사용):",
      error
    );
    return baseProfile;
  }
}

/**
 * URL 파라미터 등으로 전달된 username 문자열을 정규화합니다.
 * (URL 디코딩, 공백 제거, 선행 '@' 기호 제거)
 */
export function normalizeUsernameParam(rawUsername?: string | null): string {
  if (!rawUsername) return "";
  let decoded = rawUsername;
  try {
    decoded = decodeURIComponent(rawUsername);
  } catch {
    decoded = rawUsername;
  }
  return decoded.trim().replace(/^@+/, "").trim();
}

/**
 * Firestore users/{uid} 문서 데이터를 UserProfile 객체로 변환합니다.
 */
function mapDocToUserProfile(
  uid: string,
  data: DocumentData,
  fallbackUser?: UserProfile
): UserProfile {
  const resolvedEmail =
    typeof data.email === "string" && data.email.trim()
      ? data.email.trim()
      : fallbackUser?.email || "";
  const resolvedUsername = getEmailUsername(
    resolvedEmail,
    typeof data.username === "string" ? data.username : fallbackUser?.username
  );
  const googleDisplayName =
    typeof data.googleDisplayName === "string" && data.googleDisplayName.trim()
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
    return mapDocToUserProfile(uid, snap.data(), fallbackUser);
  } catch (error) {
    console.warn("Firestore 유저 프로필 조회 실패:", error);
    return fallbackUser ?? null;
  }
}

/**
 * Firestore(컬렉션: users)에서 username으로 유저를 검색하여 반환합니다.
 * 일치하는 유저가 없으면 null을 반환합니다.
 */
export async function fetchUserByUsername(
  username: string
): Promise<UserProfile | null> {
  const normalized = normalizeUsernameParam(username);
  if (!normalized) {
    return null;
  }

  const normalizedLower = normalized.toLowerCase();
  const usersCol = collection(db, USERS_COLLECTION);

  // 1차: username 필드 정확 일치 쿼리
  const exactQuery = query(usersCol, where("username", "==", normalized));
  const exactSnap = await getDocs(exactQuery);
  if (!exactSnap.empty) {
    const docSnap = exactSnap.docs[0];
    return mapDocToUserProfile(docSnap.id, docSnap.data());
  }

  // 2차: 소문자 username 필드 일치 쿼리
  if (normalizedLower !== normalized) {
    const lowerQuery = query(
      usersCol,
      where("username", "==", normalizedLower)
    );
    const lowerSnap = await getDocs(lowerQuery);
    if (!lowerSnap.empty) {
      const docSnap = lowerSnap.docs[0];
      return mapDocToUserProfile(docSnap.id, docSnap.data());
    }
  }

  // 3차: 대소문자 구분 없는 username 또는 이메일 앞부분 매칭 확인
  const allSnap = await getDocs(usersCol);
  for (const docSnap of allSnap.docs) {
    const data = docSnap.data();
    const docUsername =
      typeof data.username === "string" ? data.username.trim().toLowerCase() : "";
    const emailPrefix = getEmailUsername(
      typeof data.email === "string" ? data.email : null,
      typeof data.username === "string" ? data.username : null
    ).toLowerCase();

    if (docUsername === normalizedLower || emailPrefix === normalizedLower) {
      return mapDocToUserProfile(docSnap.id, data);
    }
  }

  // 현재 로그인한 사용자의 username과 일치하는 경우 동기화 후 반환
  const currentUser = auth.currentUser;
  if (currentUser) {
    const currentUsername = getEmailUsername(currentUser.email).toLowerCase();
    if (currentUsername === normalizedLower) {
      return syncUserProfileToFirestore(currentUser);
    }
  }

  return null;
}

/**
 * 표시 이름을 Firestore 문서 ID(displayNames/{key})로 쓸 수 있는 형태로 정리합니다.
 * - 문서 ID에 쓸 수 없는 '/' 치환, 공백 정리, 최대 100자
 * - '.', '..', '__x__' 형태(문서 ID 예약어) 회피
 */
export function sanitizeDisplayName(
  rawName?: string | null,
  fallbackName = "user"
): string {
  let name = (rawName ?? "").replace(/\//g, "-").trim().slice(0, 100).trim();
  if (!name) {
    name = fallbackName.replace(/\//g, "-").trim() || "user";
  }
  if (/^\.{1,2}$/.test(name) || /^__.*__$/.test(name.toLowerCase())) {
    name = `user ${name}`;
  }
  return name;
}

/**
 * 표시 이름 예약 문서 키 (대소문자 구분 없는 유일성 보장용). users/{uid}.displayNameLower 와 동일해야 합니다.
 */
export function getDisplayNameKey(displayName: string): string {
  return displayName.trim().toLowerCase();
}

/**
 * 표시 이름을 예약 문서 ID(displayNames/{key})로 쓸 수 있는지 확인합니다.
 */
function isReservableDisplayName(displayName: string): boolean {
  const key = getDisplayNameKey(displayName);
  return (
    key.length > 0 &&
    key.length <= 100 &&
    !key.includes("/") &&
    !/^\.{1,2}$/.test(key) &&
    !/^__.*__$/.test(key)
  );
}

function getDisplayNameReservationRef(displayName: string) {
  return doc(db, DISPLAY_NAMES_COLLECTION, getDisplayNameKey(displayName));
}

/**
 * 표시 이름 예약 문서(displayNames/{이름})를 조회하여 다른 사용자가 이미 사용 중인지 확인합니다.
 * @param displayName 확인할 표시 이름
 * @param excludeUid 본인 UID (본인이 예약한 이름은 중복으로 보지 않음)
 * @returns 중복이면 true, 사용 가능하면 false
 */
export async function checkDisplayNameDuplicate(
  displayName: string,
  excludeUid?: string
): Promise<boolean> {
  const sanitized = sanitizeDisplayName(displayName, "");
  if (!displayName.trim() || !sanitized) {
    return false;
  }

  const currentUid = excludeUid?.trim() || auth.currentUser?.uid;
  const snap = await getDoc(getDisplayNameReservationRef(sanitized));
  if (!snap.exists()) {
    return false;
  }
  const ownerUid = snap.data()?.uid;
  return !(currentUid && ownerUid === currentUid);
}

/**
 * 중복되지 않는 표시 이름을 찾습니다. 이미 사용 중이면 뒤에 숫자(2, 3, ...)를 붙입니다.
 */
async function findAvailableDisplayName(
  baseName: string,
  uid: string,
  startIndex = 1
): Promise<{ name: string; index: number }> {
  const MAX_TRIES = 50;
  for (let index = startIndex; index < startIndex + MAX_TRIES; index += 1) {
    const suffix = index === 1 ? "" : String(index);
    const candidate = sanitizeDisplayName(
      `${baseName.slice(0, 100 - suffix.length)}${suffix}`
    );
    if (!(await checkDisplayNameDuplicate(candidate, uid))) {
      return { name: candidate, index };
    }
  }
  // 극단적으로 충돌이 많은 경우 랜덤 접미사로 확정
  const random = Math.random().toString(36).slice(2, 8);
  return {
    name: sanitizeDisplayName(`${baseName.slice(0, 90)}-${random}`),
    index: startIndex + MAX_TRIES,
  };
}

/**
 * 표시 이름(displayName)은 최초 생성 이후 수정할 수 없으므로 입력에 포함하지 않습니다.
 */
export interface UpdateUserProfileInput {
  badge: string;
  bio: string;
  photoURL?: string;
}

/**
 * 사용자의 프로필 정보(badge, bio, photoURL)를 Firestore(users/{uid})에 수정 저장합니다.
 * username(이메일 앞부분)과 displayName은 변경되지 않습니다.
 */
export async function updateUserProfileInFirestore(
  input: UpdateUserProfileInput,
  uid?: string
): Promise<UserProfile> {
  const targetUid = resolveTargetUid(uid);
  const trimmedBadge = input.badge.trim() || DEFAULT_PROFILE_DATA.badge;
  const trimmedBio = input.bio.trim() || DEFAULT_PROFILE_DATA.bio;
  const trimmedPhotoURL = input.photoURL?.trim();

  const userDocRef = getUserDoc(targetUid);
  const existingSnap = await getDoc(userDocRef);
  const existingData = existingSnap.exists() ? existingSnap.data() : null;

  // 표시 이름은 기존 값을 그대로 유지 (수정 불가)
  const lockedDisplayName =
    typeof existingData?.displayName === "string"
      ? existingData.displayName.trim()
      : "";
  if (!existingData || !lockedDisplayName) {
    throw new Error(
      "프로필 문서를 찾을 수 없습니다. 로그아웃 후 다시 로그인해주세요."
    );
  }

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
    displayName: lockedDisplayName,
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
      displayNameLower: getDisplayNameKey(updatedProfile.displayName),
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

  const clickCount =
    typeof data.clickCount === "number"
      ? data.clickCount
      : typeof data.clicks === "number"
      ? data.clicks
      : Number(data.clickCount) || Number(data.clicks) || 0;

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
    clickCount,
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
  const clickCount =
    typeof linkInput.clickCount === "number" ? linkInput.clickCount : 0;

  // Firestore는 undefined 필드 값을 허용하지 않으므로 유효한 필드만 구성
  const payload: Record<string, unknown> = {
    title: linkInput.title.trim(),
    url: linkInput.url.trim(),
    icon: linkInput.icon?.trim() || "🔗",
    category: linkInput.category || "개발",
    isPinned: Boolean(linkInput.isPinned),
    clickCount,
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
    clickCount,
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
  const clickCount =
    typeof linkInput.clickCount === "number" ? linkInput.clickCount : 0;

  const baseFields: Record<string, unknown> = {
    title: linkInput.title.trim(),
    url: linkInput.url.trim(),
    icon: linkInput.icon?.trim() || "🔗",
    category: linkInput.category || "개발",
    isPinned: Boolean(linkInput.isPinned),
    clickCount,
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
    clickCount,
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
 * 링크 클릭 시 Firestore(경로: users/{uid}/links/{linkId})의 clickCount 필드를 원자적으로 1 증가시킵니다.
 * 비로그인 방문자 또는 로그인 사용자 누구나 대상 링크 소유자(uid)의 링크 클릭 카운트를 업데이트할 수 있습니다.
 */
export async function incrementLinkClickCount(
  linkId: string,
  uid?: string
): Promise<number> {
  const targetUid = uid?.trim() || auth.currentUser?.uid;
  if (!targetUid || !linkId) {
    return 0;
  }

  try {
    const docRef = getUserLinkDoc(targetUid, linkId);
    await updateDoc(docRef, {
      clickCount: increment(1),
    });
    return 1;
  } catch (error) {
    console.warn(
      "Firestore 링크 클릭 수(clickCount) 증가 처리 중 경고 (로컬에만 반영):",
      error
    );
    return 0;
  }
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
  const targetUid = uid?.trim();
  if (!targetUid) {
    return [];
  }
  const linksCol = getUserLinksCollection(targetUid);
  try {
    const q = query(linksCol, orderBy("createdAt", "desc"));
    const [orderedSnap, allSnap] = await Promise.all([
      getDocs(q),
      getDocs(linksCol),
    ]);
    const sourceDocs =
      allSnap.docs.length >= orderedSnap.docs.length
        ? allSnap.docs
        : orderedSnap.docs;
    const links = sourceDocs.map(mapDocToLinkItem);
    return sortLinksByCreatedAtDesc(links);
  } catch {
    const snapshot = await getDocs(linksCol);
    const links = snapshot.docs.map(mapDocToLinkItem);
    return sortLinksByCreatedAtDesc(links);
  }
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
