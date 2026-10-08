import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  passwordRecovery: boolean;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,
  passwordRecovery: false,

  initialize: async () => {
    supabase.auth.onAuthStateChange((event, session) => {
      set({
        session,
        user: session?.user ?? null,
        initialized: true,
      });
      if (event === "PASSWORD_RECOVERY") {
        set({ passwordRecovery: true });
      }
      // 로컬 개발 전용 자동 로그인. 릴리스 빌드에서는 __DEV__가 false라 통째로 제거됨
      if (__DEV__ && event === "INITIAL_SESSION" && !session) {
        const email = process.env.EXPO_PUBLIC_DEV_LOGIN_EMAIL;
        const password = process.env.EXPO_PUBLIC_DEV_LOGIN_PASSWORD;
        // 콜백 안에서 supabase 호출을 바로 await하면 교착될 수 있어 다음 틱으로 미룸
        if (email && password) setTimeout(() => supabase.auth.signInWithPassword({ email, password }), 0);
      }
    });
  },

  signUp: async (email, password) => {
    set({ loading: true });
    const redirectUrl = Linking.createURL("/");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    set({ loading: false });
    return { error: error?.message ?? null };
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  resendVerification: async (email) => {
    set({ loading: true });
    const redirectUrl = Linking.createURL("/");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectUrl },
    });
    set({ loading: false });
    return { error: error?.message ?? null };
  },

  resetPassword: async (email) => {
    set({ loading: true });
    const redirectUrl = Linking.createURL("/reset-password/update");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    set({ loading: false });
    return { error: error?.message ?? null };
  },

  updatePassword: async (password) => {
    set({ loading: true });
    const { error } = await supabase.auth.updateUser({ password });
    set({ loading: false, passwordRecovery: false });
    return { error: error?.message ?? null };
  },
}));
