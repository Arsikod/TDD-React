import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { BrowserRouter } from "react-router-dom";

import UserList from "./UserList";
import en from "../locale/languages/en.json";
import tr from "../locale/languages/tr.json";
import LanguageSelector from "./LanguageSelector";

const users = [
  { id: 1, username: "user1", email: "user1@mail.com", image: null },
  { id: 2, username: "user2", email: "user2@mail.com", image: null },
  { id: 3, username: "user3", email: "user3@mail.com", image: null },
  { id: 4, username: "user4", email: "user4@mail.com", image: null },
  { id: 5, username: "user5", email: "user5@mail.com", image: null },
  { id: 6, username: "user6", email: "user6@mail.com", image: null },
  { id: 7, username: "user7", email: "user7@mail.com", image: null },
];

const getPage = (page, size) => {
  let start = page * size;
  let end = start + size;
  let totalPages = Math.ceil(users.length / size);

  return {
    content: users.slice(start, end),
    page,
    size,
    totalPages,
  };
};

const server = setupServer(
  rest.get("/api/1.0/users", (req, res, ctx) => {
    let page = parseInt(req.url.searchParams.get("page"));
    let size = parseInt(req.url.searchParams.get("size"));

    if (isNaN(page)) {
      page = 0;
    }

    if (isNaN(size)) {
      size = 5;
    }
    return res(ctx.status(200), ctx.json(getPage(page, size)));
  })
);

beforeEach(() => {
  server.resetHandlers();
});
beforeAll(() => server.listen());
afterAll(() => server.close());

const setup = () => {
  render(
    <BrowserRouter>
      <UserList />
      <LanguageSelector />
    </BrowserRouter>
  );
};

describe("User List", () => {
  describe("interactions", () => {
    it("displays three users in list", async () => {
      setup();
      const users = await screen.findAllByText(/user/);
      expect(users.length).toBe(3);
    });

    it("displays next page link", async () => {
      setup();

      await screen.findByText("user1");
      expect(screen.queryByText("next >")).toBeInTheDocument();
    });

    it("displays next page after clicking next", async () => {
      setup();
      await screen.findByText("user1");
      const nextPageLink = screen.queryByText("next >");
      userEvent.click(nextPageLink);
      const firstUserOnPage2 = await screen.findByText("user4");
      expect(firstUserOnPage2).toBeInTheDocument();
    });

    it("hides next page link at last page", async () => {
      setup();
      await screen.findByText("user1");

      userEvent.click(screen.queryByText("next >"));
      await screen.findByText("user4");

      userEvent.click(screen.queryByText("next >"));
      await screen.findByText("user7");

      expect(screen.queryByText("next >")).not.toBeInTheDocument();
    });

    it("does not display the previous page link in first page", async () => {
      setup();
      await screen.findByText("user1");
      const prevPageLink = screen.queryByText("< previous");

      expect(prevPageLink).not.toBeInTheDocument();
    });

    it("displays prev page link on second page", async () => {
      setup();
      await screen.findByText("user1");
      userEvent.click(screen.queryByText("next >"));
      await screen.findByText("user4");
      expect(screen.queryByText("< previous")).toBeInTheDocument();
    });

    it("displays previous page after clicking prev page link", async () => {
      setup();
      await screen.findByText("user1");
      userEvent.click(screen.queryByText("next >"));
      await screen.findByText("user4");
      userEvent.click(screen.queryByText("< previous"));

      const firstUserOnFirstPage = await screen.findByText("user1");
      expect(firstUserOnFirstPage).toBeInTheDocument();
    });

    it("displays spinner during the api call is in progress", async () => {
      setup();
      const spinner = screen.getByRole("status", { hidden: true });

      await screen.findByText("user1");
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe("i18n", () => {
    beforeEach(() => {
      server.use(
        rest.get("/api/1.0/users", (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(getPage(1, 3)));
        })
      );
    });

    it("initially displays header and navigation links in english", async () => {
      setup();
      await screen.findByText("user4");

      expect(screen.getByText(en.users)).toBeInTheDocument();
      expect(screen.getByText(en.nextPage)).toBeInTheDocument();
      expect(screen.getByText(en.previousPage)).toBeInTheDocument();
    });

    it("displays header and nav links in turkish after selecting the language", async () => {
      setup();
      await screen.findByText("user4");
      userEvent.click(screen.getByTitle("Turkish"));

      expect(screen.getByText(tr.users)).toBeInTheDocument();
      expect(screen.getByText(tr.nextPage)).toBeInTheDocument();
      expect(screen.getByText(tr.previousPage)).toBeInTheDocument();
    });
  });
});
