import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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
    // 리스너를 먼저 등록해야 PASSWORD_RECOVERY 등 초기 이벤트를 놓치지 않음
    supabase.auth.onAuthStateChange((event, session) => {
      set({
        session,
        user: session?.user ?? null,
        initialized: true,
      });
      if (event === 'PASSWORD_RECOVERY') {
        set({ passwordRecovery: true });
      }
      // 로컬 개발 전용 자동 로그인. 프로덕션 빌드에서는 DEV가 false라 통째로 제거됨
      if (import.meta.env.DEV && event === 'INITIAL_SESSION' && !session) {
        const email = import.meta.env.VITE_DEV_LOGIN_EMAIL;
        const password = import.meta.env.VITE_DEV_LOGIN_PASSWORD;
        // 콜백 안에서 supabase 호출을 바로 await하면 교착될 수 있어 다음 틱으로 미룸
        if (email && password) setTimeout(() => supabase.auth.signInWithPassword({ email, password }), 0);
      }
    });
  },

  signUp: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
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
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    set({ loading: false });
    return { error: error?.message ?? null };
  },

  resetPassword: async (email) => {
    set({ loading: true });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password/update`,
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
