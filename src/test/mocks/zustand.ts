import { act } from "@testing-library/react";
import type { StoreApi } from "zustand";

/**
 * Resets a Zustand store to its initial state between tests.
 *
 * Usage:
 *   import { useMyStore } from "@/store/slices/mySlice";
 *   import { resetStore } from "@/test/mocks/zustand";
 *
 *   afterEach(() => {
 *     resetStore(useMyStore);
 *   });
 */
export function resetStore<T>(store: StoreApi<T>): void {
  const initialState = store.getInitialState();
  act(() => {
    store.setState(initialState, true);
  });
}
