import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "../test-utils/testing-library-utils";
import userEvent from "@testing-library/user-event";

import { BrowserRouter as Router } from "react-router-dom";

import LoginPage from "./LoginPage";
import LanguageSelector from "../components/LanguageSelector";

import en from "../locale/languages/en.json";
import tr from "../locale/languages/tr.json";

import { setupServer } from "msw/node";
import { rest } from "msw";
import storage from "../state/storage";

let requestBody,
  acceptLanguageHeader,
  count = 0;
const server = setupServer(
  rest.post("/api/1.0/auth", (req, res, ctx) => {
    requestBody = req.body;
    count += 1;
    acceptLanguageHeader = req.headers.get("Accept-Language");

    return res(ctx.status(401), ctx.json({ message: "Incorrect credentials" }));
  })
);

beforeEach(() => {
  count = 0;
  server.resetHandlers();
});

beforeAll(() => server.listen());
afterAll(() => server.close());

function setup() {
  render(
    <Router>
      <LoginPage />
    </Router>
  );
}

describe("Login page", () => {
  describe("Layout", () => {
    it("has header", () => {
      setup();

      const header = screen.queryByRole("heading", { name: "Login" });
      expect(header).toBeInTheDocument();
    });

    it.each`
      labelText     | input
      ${"Email"}    | ${"user email"}
      ${"Password"} | ${"password"}
    `("has $input input", ({ labelText }) => {
      setup();
      expect(screen.getByLabelText(labelText)).toBeInTheDocument();
    });

    it.each`
      inputType     | inputRole     | labelText
      ${"password"} | ${"password"} | ${"Password"}
    `(
      "has $inputType type for $inputRole input",
      ({ inputType, labelText }) => {
        setup();

        expect(screen.getByLabelText(labelText).type).toBe(inputType);
      }
    );

    it("has Login button", () => {
      setup();

      const signUpButton = screen.queryByRole("button", { name: "Login" });
      expect(signUpButton).toBeInTheDocument();
    });

    it("disables the button initially", () => {
      setup();

      const signUpButton = screen.queryByRole("button", { name: "Login" });
      expect(signUpButton).toBeDisabled();
    });
  });

  describe("Interactions", () => {
    let loginButton, emailInput, passwordInput;
    function renderSetup(email = "user100@mail.com") {
      render(
        <Router>
          <LoginPage />
        </Router>
      );
      emailInput = screen.getByLabelText("Email");
      passwordInput = screen.getByLabelText("Password");
      loginButton = screen.queryByRole("button", { name: "Login" });

      userEvent.type(emailInput, email);
      userEvent.type(passwordInput, "P4ssword");
    }

    it("enables the button when email and password inputs are filled", () => {
      renderSetup();
      expect(loginButton).toBeEnabled();
    });

    it("displays spinner during api call", async () => {
      renderSetup();

      expect(
        screen.queryByRole("status", { hidden: true })
      ).not.toBeInTheDocument();

      userEvent.click(loginButton);
      const spinner = screen.getByRole("status", { hidden: true });
      expect(spinner);

      await waitForElementToBeRemoved(spinner);
    });

    it("sends email and password to backend after clickng the button", async () => {
      renderSetup();
      userEvent.click(loginButton);
      const spinner = screen.getByRole("status", { hidden: true });
      await waitForElementToBeRemoved(spinner);
      expect(requestBody).toEqual({
        email: "user100@mail.com",
        password: "P4ssword",
      });
    });

    it("disables button where there is an api call", async () => {
      renderSetup();
      userEvent.click(loginButton);
      userEvent.click(loginButton);

      const spinner = screen.getByRole("status", { hidden: true });
      await waitForElementToBeRemoved(spinner);
      expect(count).toBe(1);
    });

    it("displays authentication fail message", async () => {
      renderSetup();
      userEvent.click(loginButton);

      const errorMsg = await screen.findByText("Incorrect credentials");
      expect(errorMsg).toBeInTheDocument();
    });

    it("clears authentication error when email field is changed", async () => {
      renderSetup();
      userEvent.click(loginButton);
      const errorMsg = await screen.findByText("Incorrect credentials");

      userEvent.type(emailInput, "new@mail.com");
      expect(errorMsg).not.toBeInTheDocument();
    });

    it("clears authentication error when password field is changed", async () => {
      renderSetup();
      userEvent.click(loginButton);
      const errorMsg = await screen.findByText("Incorrect credentials");

      userEvent.type(passwordInput, "newP4ssword");
      expect(errorMsg).not.toBeInTheDocument();
    });

    it("stores id, username and image in storage", async () => {
      server.use(
        rest.post("/api/1.0/auth", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({ id: 5, username: "user5", image: null })
          );
        })
      );

      renderSetup("user5@mail.com");
      userEvent.click(loginButton);
      const spinner = screen.queryByRole("status", { hidden: true });
      await waitForElementToBeRemoved(spinner);
      const storedState = storage.getItem("auth");
      const authFields = Object.keys(storedState);
      expect(authFields.includes("id")).toBeTruthy();
      expect(authFields.includes("username")).toBeTruthy();
      expect(authFields.includes("image")).toBeTruthy();
    });
  });

  describe("i18n", () => {
    let turkishToggle, englishToggle, passwordInput, emailInput;
    function renderSetup() {
      render(
        <Router>
          <LoginPage />
          <LanguageSelector />
        </Router>
      );

      turkishToggle = screen.getByTitle("Turkish");
      englishToggle = screen.getByTitle("English");
      passwordInput = screen.getByLabelText(en.password);
      emailInput = screen.getByLabelText(en.email);
    }

    it("initially displays all text in English", () => {
      renderSetup();

      expect(
        screen.getByRole("heading", { name: en.login })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: en.login })
      ).toBeInTheDocument();

      expect(screen.getByLabelText(en.email)).toBeInTheDocument();
      expect(screen.getByLabelText(en.password)).toBeInTheDocument();
    });

    it("displays all text in Turkish after changing language", () => {
      renderSetup();

      userEvent.click(turkishToggle);

      expect(
        screen.getByRole("heading", { name: tr.login })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: tr.login })
      ).toBeInTheDocument();

      expect(screen.getByLabelText(tr.email)).toBeInTheDocument();
      expect(screen.getByLabelText(tr.password)).toBeInTheDocument();
    });

    it("sets accept language header to en for outgoing request", async () => {
      renderSetup();

      userEvent.type(emailInput, "user100@mail.com");
      userEvent.type(passwordInput, "P4ssword");
      userEvent.click(screen.getByRole("button", { name: en.login }));

      const spinner = screen.getByRole("status", { hidden: true });
      expect(spinner);

      await waitForElementToBeRemoved(spinner);
      expect(acceptLanguageHeader).toBe("en");
    });

    it("sets accept language header to tr for outgoing request", async () => {
      renderSetup();

      userEvent.type(emailInput, "user100@mail.com");
      userEvent.type(passwordInput, "P4ssword");
      userEvent.click(turkishToggle);
      userEvent.click(screen.getByRole("button", { name: tr.login }));

      const spinner = screen.getByRole("status", { hidden: true });
      expect(spinner);

      await waitForElementToBeRemoved(spinner);
      expect(acceptLanguageHeader).toBe("tr");
    });
  });
});
