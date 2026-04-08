import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactElement } from "react";

/**
 * Custom render that wraps components in any providers needed for testing.
 * Extend the Wrapper here when you add providers (e.g. ThemeProvider).
 */
function Wrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}

// Re-export everything from RTL + override render
export * from "@testing-library/react";
export { customRender as render };
