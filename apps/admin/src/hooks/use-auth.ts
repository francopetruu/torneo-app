import { useAuth } from "@/contexts/auth-context";

/**
 * Hook to access authentication state and methods
 * @returns Auth context with user, session, loading state, and auth methods
 */
export function useAuthHook() {
  return useAuth();
}
