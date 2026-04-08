import { vi } from "vitest";

/**
 * Creates a mock Supabase client for unit testing query functions.
 *
 * Usage in tests:
 *   import { createMockSupabaseClient } from "@/test/mocks/supabase";
 *
 *   const { client, mockFrom } = createMockSupabaseClient();
 *   // Mock the LAST method in the chain — that's what returns data.
 *   // e.g. for from("profiles").select("*").eq("id", userId).single():
 *   mockFrom.single.mockResolvedValueOnce({ data: { id: "1" }, error: null });
 */
export function createMockSupabaseClient() {
  const mockFrom = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
  };

  const client = {
    from: vi.fn(() => mockFrom),
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    rpc: vi.fn(),
  };

  return { client, mockFrom };
}

/**
 * Creates a mock Supabase response — success case.
 */
export function mockSupabaseSuccess<T>(data: T) {
  return { data, error: null };
}

/**
 * Creates a mock Supabase response — error case.
 */
export function mockSupabaseError(message: string, code?: string) {
  return {
    data: null,
    error: { message, code: code ?? "UNKNOWN", details: "", hint: "" },
  };
}
