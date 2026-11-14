import { create } from "zustand";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  buildUserProfileFromAuth,
  syncUserProfileToFirestore,
} from "@/lib/links";
import { UserProfile } from "@/types";

export interface AuthState {
  user: UserProfile | null;
  isAuthLoading: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  authError: string | null;
  initAuthListener: () => () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

let unsubscribeAuth: (() => void) | null = null;
let subscriberCount = 0;

function formatAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "구글 로그인 창이 닫혀 로그인이 취소되었습니다. 다시 시도해주세요.";
    case "auth/popup-blocked":
      return "브라우저에서 로그인 팝업이 차단되었습니다. 팝업 차단을 해제한 뒤 다시 시도해주세요.";
    case "auth/network-request-failed":
      return "네트워크 연결이 불안정합니다. 인터넷 연결을 확인 후 다시 시도해주세요.";
    case "auth/unauthorized-domain":
      return "현재 접속 도메인이 Firebase 인증 승인 도메인에 등록되어 있지 않습니다.";
    default:
      return error instanceof Error
        ? `로그인 처리 중 오류가 발생했습니다: ${error.message}`
        : "구글 로그인 중 알 수 없는 오류가 발생했습니다. 다시 시도해주세요.";
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthLoading: true,
  isLoggingIn: false,
  isLoggingOut: false,
  authError: null,

  initAuthListener: () => {
    if (typeof window === "undefined") {
      return () => {};
    }

    subscriberCount += 1;

    if (!unsubscribeAuth) {
      unsubscribeAuth = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          if (firebaseUser) {
            const immediateProfile = buildUserProfileFromAuth(firebaseUser);
            set({
              user: immediateProfile,
              isAuthLoading: false,
              authError: null,
            });

            const syncedProfile =
              await syncUserProfileToFirestore(firebaseUser);
            // 동기화 도중 로그아웃되지 않았을 때만 반영
            if (auth.currentUser?.uid === firebaseUser.uid) {
              set({
                user: syncedProfile,
                isAuthLoading: false,
              });
            }
          } else {
            set({
              user: null,
              isAuthLoading: false,
            });
          }
        },
        (error) => {
          console.error("Firebase 인증 상태 감지 오류:", error);
          set({
            user: null,
            isAuthLoading: false,
            authError: "인증 상태를 확인하는 중 오류가 발생했습니다.",
          });
        }
      );
    }

    return () => {
      subscriberCount = Math.max(0, subscriberCount - 1);
      if (subscriberCount === 0 && unsubscribeAuth) {
        unsubscribeAuth();
        unsubscribeAuth = null;
      }
    };
  },

  loginWithGoogle: async () => {
    set({ isLoggingIn: true, authError: null });
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const immediateProfile = buildUserProfileFromAuth(result.user);
        set({
          user: immediateProfile,
          isAuthLoading: false,
        });

        const syncedProfile = await syncUserProfileToFirestore(result.user);
        set({
          user: syncedProfile,
          isAuthLoading: false,
          authError: null,
        });
      }
    } catch (error) {
      console.error("Google 소셜 로그인 실패:", error);
      set({
        authError: formatAuthErrorMessage(error),
      });
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    set({ isLoggingOut: true, authError: null });
    try {
      await signOut(auth);
      set({
        user: null,
        authError: null,
      });
    } catch (error) {
      console.error("로그아웃 실패:", error);
      set({
        authError: "로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      set({ isLoggingOut: false });
    }
  },

  clearAuthError: () => set({ authError: null }),
}));
