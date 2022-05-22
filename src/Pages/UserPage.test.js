import {
  getByRole,
  render,
  screen,
  waitFor,
} from "../test-utils/testing-library-utils";
import { MemoryRouter, Routes, Route } from "react-router";

import { rest } from "msw";
import { setupServer } from "msw/node";
import UserPage from "./UserPage";

const server = setupServer();

beforeEach(() => {
  server.resetHandlers();
});
beforeAll(() => server.listen());
afterAll(() => server.close());

function renderSetup(id) {
  render(
    <MemoryRouter initialEntries={[`/user/${id}`]}>
      <Routes>
        <Route path="/user/:id" element={<UserPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("User page", () => {
  beforeEach(() => {
    server.use(
      rest.get("/api/1.0/users/:id", (req, res, ctx) => {
        if (req.params.id === "1") {
          return res(
            ctx.json({
              id: 1,
              username: "user1",
              email: "user1@mail.com",
              image: null,
            })
          );
        } else {
          return res(ctx.status(404), ctx.json({ message: "User not found" }));
        }
      })
    );
  });

  it("displays user name on page when user is found", async () => {
    renderSetup(1);
    await waitFor(() => {
      expect(screen.queryByText("user1")).toBeInTheDocument();
    });
  });

  it("displays spinner while api call is in progress", async () => {
    renderSetup(1);

    const spinner = screen.getByRole("status", { hidden: true });

    await screen.findByText("user1");
    expect(spinner).not.toBeInTheDocument();
  });

  it("displays error message received from backend when the user is not found", async () => {
    renderSetup(100);

    await waitFor(() => {
      expect(screen.queryByText("User not found")).toBeInTheDocument();
    });
  });
});
