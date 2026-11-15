"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinkItem, ProfileData, UserProfile } from "@/types";
import { DEFAULT_PROFILE_DATA } from "@/data";
import {
  fetchUserLinks,
  addLinkToFirestore,
  updateLinkInFirestore,
  deleteLinkFromFirestore,
  incrementLinkClickCount,
  mergeFirestoreLinks,
  fetchUserProfileFromFirestore,
  fetchUserByUsername,
  normalizeUsernameParam,
  updateUserProfileInFirestore,
  getEmailUsername,
  UpdateUserProfileInput,
} from "@/lib/links";
import { auth } from "@/lib/firebase";
import { useAuthStore, useProfileStore } from "@/store";

export const queryKeys = {
  userLinks: (uid: string) => ["users", uid, "links"] as const,
  userProfile: (uid: string) => ["users", uid, "profile"] as const,
  userByUsername: (username: string) =>
    ["users", "by-username", normalizeUsernameParam(username).toLowerCase()] as const,
};

function resolveUid(uid?: string | null): string {
  return uid?.trim() || auth.currentUser?.uid || "";
}

/**
 * 사용자의 개인화 링크 목록을 단발성으로 조회하는 TanStack Query 훅 (실시간 리스너 없음)
 */
export function useUserLinksQuery(uid?: string | null) {
  const targetUid = resolveUid(uid);

  return useQuery<LinkItem[]>({
    queryKey: queryKeys.userLinks(targetUid),
    queryFn: () => fetchUserLinks(targetUid),
    enabled: Boolean(targetUid),
  });
}

/**
 * 사용자의 프로필 정보를 단발성으로 조회하는 TanStack Query 훅 (실시간 리스너 없음)
 */
export function useUserProfileQuery(
  uid?: string | null,
  fallbackUser?: UserProfile | null
) {
  const targetUid = resolveUid(uid);

  return useQuery<UserProfile | null>({
    queryKey: queryKeys.userProfile(targetUid),
    queryFn: () =>
      fetchUserProfileFromFirestore(targetUid, fallbackUser ?? undefined),
    enabled: Boolean(targetUid),
    initialData: fallbackUser ?? undefined,
  });
}

/**
 * username으로 사용자를 검색하는 TanStack Query 훅
 */
export function useUserByUsernameQuery(
  username?: string | null,
  initialUser?: UserProfile | null
) {
  const normalizedUsername = normalizeUsernameParam(username);

  return useQuery<UserProfile | null>({
    queryKey: queryKeys.userByUsername(normalizedUsername),
    queryFn: () => fetchUserByUsername(normalizedUsername),
    enabled: Boolean(normalizedUsername),
    initialData: initialUser ?? undefined,
    retry: false,
  });
}

/**
 * 새 링크를 추가하고 링크 목록 쿼리 캐시를 갱신하는 Mutation 훅
 */
export function useAddLinkMutation(uid?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkInput: Omit<LinkItem, "id"> & { id?: string }) =>
      addLinkToFirestore(linkInput, uid),
    onSuccess: async (savedLink) => {
      const targetUid = resolveUid(uid);
      if (!targetUid) return;

      queryClient.setQueryData<LinkItem[]>(
        queryKeys.userLinks(targetUid),
        (oldLinks = []) => mergeFirestoreLinks([savedLink], oldLinks)
      );

      await queryClient.invalidateQueries({
        queryKey: queryKeys.userLinks(targetUid),
      });
    },
  });
}

export interface UpdateLinkMutationVariables {
  linkId: string;
  linkInput: Omit<LinkItem, "id"> & { id?: string };
}

/**
 * 기존 링크를 수정하고 링크 목록 쿼리 캐시를 갱신하는 Mutation 훅
 */
export function useUpdateLinkMutation(uid?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, linkInput }: UpdateLinkMutationVariables) => {
      const [savedLink] = await Promise.all([
        updateLinkInFirestore(linkId, linkInput, uid),
        new Promise((resolve) => setTimeout(resolve, 250)),
      ]);
      return savedLink;
    },
    onSuccess: async (savedLink) => {
      const targetUid = resolveUid(uid);
      if (!targetUid) return;

      queryClient.setQueryData<LinkItem[]>(
        queryKeys.userLinks(targetUid),
        (oldLinks = []) => {
          const exists = oldLinks.some((item) => item.id === savedLink.id);
          if (exists) {
            return oldLinks.map((item) =>
              item.id === savedLink.id ? savedLink : item
            );
          }
          return [savedLink, ...oldLinks];
        }
      );

      await queryClient.invalidateQueries({
        queryKey: queryKeys.userLinks(targetUid),
      });
    },
  });
}

/**
 * 링크를 삭제하고 링크 목록 쿼리 캐시를 갱신하는 Mutation 훅
 */
export function useDeleteLinkMutation(uid?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      await Promise.all([
        deleteLinkFromFirestore(linkId, uid),
        new Promise((resolve) => setTimeout(resolve, 250)),
      ]);
      return linkId;
    },
    onSuccess: async (deletedId) => {
      const targetUid = resolveUid(uid);
      if (!targetUid) return;

      queryClient.setQueryData<LinkItem[]>(
        queryKeys.userLinks(targetUid),
        (oldLinks = []) => oldLinks.filter((item) => item.id !== deletedId)
      );

      await queryClient.invalidateQueries({
        queryKey: queryKeys.userLinks(targetUid),
      });
    },
  });
}

/**
 * 링크 클릭 수를 증가시키고 TanStack Query 캐시에 즉각 낙관적 반영하는 Mutation 훅
 */
export function useIncrementClickMutation(uid?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      const targetUid = resolveUid(uid);
      return incrementLinkClickCount(linkId, targetUid);
    },
    onMutate: async (linkId: string) => {
      const targetUid = resolveUid(uid);
      if (!targetUid) return;

      await queryClient.cancelQueries({
        queryKey: queryKeys.userLinks(targetUid),
      });

      const previousLinks = queryClient.getQueryData<LinkItem[]>(
        queryKeys.userLinks(targetUid)
      );

      queryClient.setQueryData<LinkItem[]>(
        queryKeys.userLinks(targetUid),
        (oldLinks = []) =>
          oldLinks.map((item) =>
            item.id === linkId
              ? { ...item, clickCount: (item.clickCount || 0) + 1 }
              : item
          )
      );

      return { previousLinks, targetUid };
    },
    onError: (_err, _linkId, context) => {
      if (context?.targetUid && context?.previousLinks) {
        queryClient.setQueryData(
          queryKeys.userLinks(context.targetUid),
          context.previousLinks
        );
      }
    },
  });
}

export interface OptimisticProfileContext {
  targetUid: string;
  previousQueryProfile: UserProfile | null | undefined;
  previousAuthUser: UserProfile | null;
  previousLocalProfile: ProfileData;
}

/**
 * 사용자 프로필 정보를 낙관적 업데이트(Optimistic Update)로 즉시 반영하고
 * 실패 시 이전 상태로 롤백하는 Mutation 훅
 */
export function useUpdateProfileMutation(uid?: string) {
  const queryClient = useQueryClient();

  return useMutation<
    UserProfile,
    Error,
    UpdateUserProfileInput,
    OptimisticProfileContext
  >({
    mutationFn: (input: UpdateUserProfileInput) =>
      updateUserProfileInFirestore(input, uid),

    // 1. 낙관적 업데이트 (서버 응답 전 UI 및 캐시 즉시 갱신)
    onMutate: async (newProfileInput) => {
      const targetUid = resolveUid(uid);

      if (targetUid) {
        await queryClient.cancelQueries({
          queryKey: queryKeys.userProfile(targetUid),
        });
      }

      // 실패 시 복구를 위한 이전 상태 스냅샷 저장
      const previousQueryProfile = targetUid
        ? queryClient.getQueryData<UserProfile | null>(
            queryKeys.userProfile(targetUid)
          )
        : undefined;
      const previousAuthUser = useAuthStore.getState().user;
      const previousLocalProfile = useProfileStore.getState().profile;

      const baseUser = previousQueryProfile || previousAuthUser;
      const resolvedEmail = baseUser?.email || auth.currentUser?.email || "";
      const resolvedUsername = getEmailUsername(
        resolvedEmail,
        baseUser?.username
      );
      // 표시 이름은 수정 불가이므로 기존 값을 그대로 유지
      const lockedDisplayName =
        baseUser?.displayName ||
        previousLocalProfile.name ||
        DEFAULT_PROFILE_DATA.name;
      const nextBadge =
        newProfileInput.badge.trim() || DEFAULT_PROFILE_DATA.badge;
      const nextBio = newProfileInput.bio.trim() || DEFAULT_PROFILE_DATA.bio;
      const nextPhotoURL =
        newProfileInput.photoURL?.trim() ||
        baseUser?.photoURL ||
        previousLocalProfile.avatarUrl ||
        DEFAULT_PROFILE_DATA.avatarUrl;

      if (targetUid) {
        const optimisticProfile: UserProfile = {
          uid: targetUid,
          username: resolvedUsername,
          displayName: lockedDisplayName,
          googleDisplayName:
            baseUser?.googleDisplayName ||
            auth.currentUser?.displayName ||
            resolvedUsername,
          email: resolvedEmail,
          photoURL: nextPhotoURL,
          badge: nextBadge,
          bio: nextBio,
          lastLoginAt: baseUser?.lastLoginAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // TanStack Query 캐시 즉시 업데이트
        queryClient.setQueryData<UserProfile | null>(
          queryKeys.userProfile(targetUid),
          optimisticProfile
        );

        // 전역 Auth 스토어 즉시 업데이트
        useAuthStore.getState().updateUserProfile(optimisticProfile);
      }

      // 로컬 프로필 스토어 즉시 업데이트
      useProfileStore.getState().updateProfile({
        name: lockedDisplayName,
        badge: nextBadge,
        bio: nextBio,
        avatarUrl: nextPhotoURL,
      });

      return {
        targetUid,
        previousQueryProfile,
        previousAuthUser,
        previousLocalProfile,
      };
    },

    // 2. 에러 발생 시 스냅샷으로 롤백(원상복구)
    onError: (_error, _newProfileInput, context) => {
      if (!context) return;

      if (context.targetUid && context.previousQueryProfile !== undefined) {
        queryClient.setQueryData(
          queryKeys.userProfile(context.targetUid),
          context.previousQueryProfile
        );
      }

      if (context.previousAuthUser) {
        useAuthStore.getState().updateUserProfile(context.previousAuthUser);
      }

      if (context.previousLocalProfile) {
        useProfileStore.getState().updateProfile(context.previousLocalProfile);
      }
    },

    // 3. 성공 시 서버 확정 데이터로 동기화
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(
        queryKeys.userProfile(updatedProfile.uid),
        updatedProfile
      );
      if (updatedProfile.username) {
        queryClient.setQueryData(
          queryKeys.userByUsername(updatedProfile.username),
          updatedProfile
        );
      }
      useAuthStore.getState().updateUserProfile(updatedProfile);
      useProfileStore.getState().updateProfile({
        name: updatedProfile.displayName,
        badge: updatedProfile.badge || DEFAULT_PROFILE_DATA.badge,
        bio: updatedProfile.bio || DEFAULT_PROFILE_DATA.bio,
        avatarUrl: updatedProfile.photoURL,
      });
    },

    // 4. 완료 후 서버 상태와 최종 정합성 보장
    onSettled: (data, _error, _variables, context) => {
      if (context?.targetUid) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.userProfile(context.targetUid),
        });
      }
      if (data?.username) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.userByUsername(data.username),
        });
      }
    },
  });
}
