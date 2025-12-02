import { vi } from "vitest";

/**
 * Mock Supabase client for testing
 */
export const createMockSupabaseClient = () => {
  const mockSelect = vi.fn().mockReturnThis();
  const mockFrom = vi.fn().mockReturnValue({
    select: mockSelect,
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  });

  return {
    from: mockFrom,
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
    removeChannel: vi.fn(),
  };
};

export const mockSupabaseResponse = <T>(data: T | null, error: any = null) => ({
  data,
  error,
  count: null,
  status: error ? 400 : 200,
  statusText: error ? "Bad Request" : "OK",
});
