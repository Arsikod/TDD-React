import { render, screen } from "@testing-library/react";
import AccountActivationPage from "./AccountActivationPage";
import { MemoryRouter, Routes, Route } from "react-router";

import { rest } from "msw";
import { setupServer } from "msw/node";

let counter = 0;
const server = setupServer(
  rest.post("/api/1.0/users/token/:token", (req, res, ctx) => {
    const { token } = req.params;

    if (token === "5678") {
      return res(ctx.status(400));
    }

    counter += 1;
    return res(ctx.status(200));
  })
);

beforeEach(() => {
  counter = 0;
  server.resetHandlers();
});
beforeAll(() => server.listen());
afterAll(() => server.close());

describe("Account activation page", () => {
  function renderSetup(token) {
    render(
      <MemoryRouter initialEntries={[`/activate/${token}`]}>
        <Routes>
          <Route path="/activate/:token" element={<AccountActivationPage />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("displays successfull message when token is valid", async () => {
    renderSetup("1234");

    const message = await screen.findByText("Account is activated");
    expect(message).toBeInTheDocument();
  });

  it("sends activation request to backend", async () => {
    renderSetup("1234");

    await screen.findByText("Account is activated");
    expect(counter).toBe(1);
  });

  it("displays activation failure message when token is invalid", async () => {
    renderSetup("5678");
    const message = await screen.findByText("Activation failed");
    expect(message).toBeInTheDocument();
  });

  it("displays spinner during activation api call", async () => {
    renderSetup("5678");
    const spinner = screen.queryByRole("status", { hidden: true });

    expect(spinner).toBeInTheDocument();
    await screen.findByText("Activation failed");
    expect(spinner).not.toBeInTheDocument();
  });
});
