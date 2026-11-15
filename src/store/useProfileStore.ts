import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ProfileData, LinkItem } from "@/types";
import { DEFAULT_PROFILE_DATA } from "@/data";

export interface ProfileState {
  profile: ProfileData;
  updateProfile: (data: Partial<ProfileData>) => void;
  setLinks: (links: LinkItem[]) => void;
  addLink: (link: Omit<LinkItem, "id"> & { id?: string }) => void;
  updateLink: (id: string, updated: Partial<LinkItem>) => void;
  incrementClickCount: (id: string) => void;
  removeLink: (id: string) => void;
  resetToDefault: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE_DATA,
      updateProfile: (data) =>
        set((state) => ({
          profile: { ...state.profile, ...data },
        })),
      setLinks: (links) =>
        set((state) => ({
          profile: { ...state.profile, links },
        })),
      addLink: (newLink) =>
        set((state) => {
          const linkWithId: LinkItem = {
            ...newLink,
            id: newLink.id || `link-${Date.now()}`,
            createdAt: newLink.createdAt || new Date().toISOString(),
            clickCount:
              typeof newLink.clickCount === "number" ? newLink.clickCount : 0,
          };
          return {
            profile: {
              ...state.profile,
              links: [linkWithId, ...state.profile.links],
            },
          };
        }),
      updateLink: (id, updated) =>
        set((state) => ({
          profile: {
            ...state.profile,
            links: state.profile.links.map((link) =>
              link.id === id ? { ...link, ...updated } : link
            ),
          },
        })),
      incrementClickCount: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            links: state.profile.links.map((link) =>
              link.id === id
                ? { ...link, clickCount: (link.clickCount || 0) + 1 }
                : link
            ),
          },
        })),
      removeLink: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            links: state.profile.links.filter((link) => link.id !== id),
          },
        })),
      resetToDefault: () =>
        set({
          profile: DEFAULT_PROFILE_DATA,
        }),
    }),
    {
      name: "mylink_profile_data",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
