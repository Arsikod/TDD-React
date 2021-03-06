import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

import React from "react";
import { MemoryRouter, Routes, Route } from "react-router";

import en from "./locale/languages/en.json";

import { rest } from "msw";
import { setupServer } from "msw/node";
import storage from "./state/storage";

const page1 = {
  content: [
    {
      id: 1,
      username: "user-in-list",
      email: "user-in-list@mail.com",
      image: null,
    },
  ],
  page: 0,
  size: 0,
  totalPages: 0,
};

let logoutCount = 0;
let header;
const server = setupServer(
  rest.get("/api/1.0/users", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(page1));
  }),

  rest.post("/api/1.0/users/token/:token", (req, res, ctx) => {
    return res(ctx.status(200));
  }),

  rest.get("/api/1.0/users/:id", (req, res, ctx) => {
    header = req.headers.get("Authorization");
    const id = parseInt(req.params.id);

    if (id === 1) {
      return res(
        ctx.json({
          id: 1,
          username: "user-in-list",
          email: "user-in-list@mail.com",
          image: null,
        })
      );
    }
    return res(
      ctx.json({
        id: id,
        username: `user${id}`,
        email: `user${id}@mail.com`,
        image: null,
      })
    );
  }),

  rest.post("/api/1.0/auth", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: 5, username: "user5" }));
  }),

  rest.post("/api/1.0/logout", (req, res, ctx) => {
    logoutCount += 1;
    return res(ctx.status(200));
  }),

  rest.delete("/api/1.0/users/:id", (req, res, ctx) => {
    return res(ctx.status(200));
  })
);

beforeEach(() => {
  logoutCount = 0;
  server.resetHandlers();
});
beforeAll(() => server.listen());
afterAll(() => server.close());

function setup(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe("Routing", () => {
  it.each`
    path               | pageTestId
    ${"/"}             | ${"home-page"}
    ${"/signup"}       | ${"signup-page"}
    ${"/login"}        | ${"login-page"}
    ${"/user/1"}       | ${"user-page"}
    ${"/user/2"}       | ${"user-page"}
    ${"/activate/123"} | ${"activation-page"}
    ${"/activate/456"} | ${"activation-page"}
  `("displays $pageTestId when path is $path", ({ path, pageTestId }) => {
    setup(path);
    const page = screen.getByTestId(pageTestId);
    expect(page).toBeInTheDocument();
  });

  it.each`
    path               | pageTestId
    ${"/"}             | ${"signup-page"}
    ${"/"}             | ${"login-page"}
    ${"/"}             | ${"user-page"}
    ${"/"}             | ${"activation-page"}
    ${"/signup"}       | ${"home-page"}
    ${"/signup"}       | ${"login-page"}
    ${"/signup"}       | ${"user-page"}
    ${"/signup"}       | ${"activation-page"}
    ${"/login"}        | ${"home-page"}
    ${"/login"}        | ${"signup-page"}
    ${"/login"}        | ${"user-page"}
    ${"/login"}        | ${"activation-page"}
    ${"/user/1"}       | ${"home-page"}
    ${"/user/1"}       | ${"signup-page"}
    ${"/user/1"}       | ${"login-page"}
    ${"/user/1"}       | ${"activation-page"}
    ${"/activate/123"} | ${"home-page"}
    ${"/activate/123"} | ${"signup-page"}
    ${"/activate/123"} | ${"login-page"}
    ${"/activate/123"} | ${"user-page"}
  `("does not display $pageTestId at $path route", ({ path, pageTestId }) => {
    setup(path);

    const page = screen.queryByTestId(pageTestId);
    expect(page).not.toBeInTheDocument();
  });

  it.each`
    targetPage
    ${"Home"}
    ${"Sign Up"}
    ${"Login"}
  `("has link to $targetPage on NavBar", ({ targetPage }) => {
    setup("/");
    const link = screen.getByRole("link", { name: targetPage });
    expect(link).toBeInTheDocument();
  });

  it.each`
    initialPath  | clickingTo   | visiblePage
    ${"/"}       | ${"Sign Up"} | ${"signup-page"}
    ${"/signup"} | ${"Home"}    | ${"home-page"}
    ${"/signup"} | ${"Login"}   | ${"login-page"}
  `(
    "displays $visiblePage after clicking $clickingTo link",
    ({ initialPath, clickingTo, visiblePage }) => {
      setup(initialPath);
      const link = screen.getByRole("link", { name: clickingTo });

      userEvent.click(link);

      const page = screen.getByTestId(visiblePage);

      expect(page).toBeInTheDocument();
    }
  );

  it("displays Home page when clicking on brand logo", () => {
    setup("/login");
    const logo = screen.queryByAltText("logo");
    userEvent.click(logo);

    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  it("navigates to userpage when clicking on user", async () => {
    setup("/");
    const user = await screen.findByText("user-in-list");
    userEvent.click(user);

    const page = await screen.findByTestId("user-page");
    expect(page).toBeInTheDocument();
  });
});

describe("Login", () => {
  const setupLoggedIn = () => {
    setup("/login");
    userEvent.type(screen.getByLabelText(en.email), "user5@mail.com");
    userEvent.type(screen.getByLabelText(en.password), "P4ssword");
    userEvent.click(screen.getByRole("button", { name: en.login }));
  };

  it("redirects to homepage after successful login", async () => {
    setupLoggedIn();

    const page = await screen.findByTestId("home-page");
    expect(page).toBeInTheDocument();
  });

  it("hides login and signup from navbar after successful login", async () => {
    setupLoggedIn();
    await screen.findByTestId("home-page");

    const loginLink = screen.queryByRole("link", { name: en.login });
    const signupLink = screen.queryByRole("link", { name: en.signUp });

    expect(loginLink).not.toBeInTheDocument();
    expect(signupLink).not.toBeInTheDocument();
  });

  it("displays My profile link on navbar after successfull login", async () => {
    setup("/login");
    expect(
      screen.queryByRole("link", { name: "My profile" })
    ).not.toBeInTheDocument();

    userEvent.type(screen.getByLabelText(en.email), "user5@m ail.com");
    userEvent.type(screen.getByLabelText(en.password), "P4ssword");
    userEvent.click(screen.getByRole("button", { name: en.login }));
    await screen.findByTestId("home-page");

    const myProfileLink = screen.queryByRole("link", { name: "My profile" });
    expect(myProfileLink).toBeInTheDocument();
  });

  it("displays user page with logged in user id in url after clicking My profile link", async () => {
    setupLoggedIn();
    await screen.findByTestId("home-page");
    const myProfileLink = screen.queryByRole("link", { name: "My profile" });
    userEvent.click(myProfileLink);

    await screen.findByTestId("user-page");
    await screen.findByText("user5");
  });

  it("stores loggedIn state in local storage", async () => {
    setupLoggedIn();
    await screen.findByTestId("home-page");
    const state = storage.getItem("auth");
    expect(state.isLoggedIn).toBeTruthy();
  });

  it("displays layout of logged in state", () => {
    storage.setItem("auth", { isLoggedIn: true });
    setup("/");

    const myProfileLink = screen.queryByRole("link", { name: "My profile" });
    expect(myProfileLink).toBeInTheDocument();
  });

  it("refreshes userpage from another user to logged in user after clicking my profile", async () => {
    storage.setItem("auth", { id: 5, username: "user5", isLoggedIn: true });
    setup("/");
    const user = await screen.findByText("user-in-list");
    userEvent.click(user);

    await screen.findByRole("heading", { name: "user-in-list" });

    const myProfileLink = screen.queryByRole("link", { name: "My profile" });
    userEvent.click(myProfileLink);

    const user5 = await screen.findByRole("heading", { name: "user5" });
    expect(user5).toBeInTheDocument();
  });
});

describe("Logout", () => {
  let logoutLink;
  function setupLoggedIn() {
    storage.setItem("auth", {
      id: 5,
      username: "user5",
      isLoggedIn: true,
      header: "auth header value",
    });
    setup("/");

    logoutLink = screen.queryByRole("link", {
      name: "Logout",
    });
  }

  it("displays Logout link on navbar after successful login", () => {
    setupLoggedIn();
    expect(logoutLink).toBeInTheDocument();
  });

  it("displays login and sign up on navbar after clicking logout", async () => {
    setupLoggedIn();
    userEvent.click(logoutLink);
    const loginLink = await screen.findByRole("link", {
      name: "Login",
    });

    expect(loginLink).toBeInTheDocument();
  });

  it("sends logout request to backend after clicking logout", async () => {
    setupLoggedIn();

    userEvent.click(logoutLink);
    await screen.findByRole("link", {
      name: "Login",
    });

    expect(logoutCount).toBe(1);
  });

  it("removes auth header from requests after user logged out", async () => {
    setupLoggedIn();
    userEvent.click(logoutLink);

    await screen.findByRole("link", { name: "Login" });
    const user = screen.queryByText("user-in-list");
    userEvent.click(user);

    await screen.findByRole("heading", {
      name: "user-in-list",
    });

    expect(header).toBeFalsy();
  });
});

describe("Delete user", () => {
  let deleteButton;
  async function setupLoggedInUserPage() {
    storage.setItem("auth", {
      id: 5,
      username: "user5",
      isLoggedIn: true,
      header: "auth header value",
    });
    setup("/user/5");

    deleteButton = await screen.findByRole("button", {
      name: "Delete my account",
    });
  }

  it("redirects to homepage after deleting user", async () => {
    await setupLoggedInUserPage();
    userEvent.click(deleteButton);
    userEvent.click(
      screen.queryByRole("button", {
        name: "Yes",
      })
    );

    await screen.findByTestId("home-page");
  });

  it("displays login and signup on navbar after deleting user", async () => {
    await setupLoggedInUserPage();
    userEvent.click(deleteButton);
    userEvent.click(
      screen.queryByRole("button", {
        name: "Yes",
      })
    );

    await screen.findByRole("link", { name: "Login" });
  });
});
