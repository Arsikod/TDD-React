import { render } from "@testing-library/react";
import AuthContextProvider from "../context/AuthContextProvider";

const renderWithContext = (ui, options) => {
  render(ui, { wrapper: AuthContextProvider, ...options });
};

//re-export everything (ex: screen) from rtl
export * from "@testing-library/react";

//override render
export { renderWithContext as render };
