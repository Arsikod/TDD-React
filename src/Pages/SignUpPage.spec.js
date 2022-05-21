import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import en from "../locale/languages/en.json";
import tr from "../locale/languages/tr.json";

import SignupPage from "./SignupPage";
import LanguageSelector from "../components/LanguageSelector";

import { setupServer } from "msw/node";
import { rest } from "msw";

let requestBody;
let counter = 0;
let acceptLanguageHeader;
const server = setupServer(
  rest.post("/api/1.0/users", (req, res, ctx) => {
    requestBody = req.body;
    counter += 1;
    acceptLanguageHeader = req.headers.get("Accept-Language");
    return res(ctx.status(200));
  })
);

beforeEach(() => {
  counter = 0;
  server.resetHandlers();
});
beforeAll(() => server.listen());
afterAll(() => server.close());

describe("Sign Up Page", () => {
  describe("Layout", () => {
    it("has header", () => {
      render(<SignupPage />);

      const header = screen.queryByRole("heading", { name: "Sign Up" });
      expect(header).toBeInTheDocument();
    });

    it.each`
      labelText            | input
      ${"User name"}       | ${"user name"}
      ${"Email"}           | ${"user email"}
      ${"Password"}        | ${"password"}
      ${"Password Repeat"} | ${"password repeat"}
    `("has $input input", ({ labelText }) => {
      render(<SignupPage />);
      expect(screen.getByLabelText(labelText)).toBeInTheDocument();
    });

    it.each`
      inputType     | inputRole            | labelText
      ${"password"} | ${"password"}        | ${"Password"}
      ${"password"} | ${"password repeat"} | ${"Password Repeat"}
    `(
      "has $inputType type for $inputRole input",
      ({ inputType, labelText }) => {
        render(<SignupPage />);

        expect(screen.getByLabelText(labelText).type).toBe(inputType);
      }
    );

    it("has Sign Up button", () => {
      render(<SignupPage />);

      const signUpButton = screen.queryByRole("button", { name: "Sign Up" });
      expect(signUpButton).toBeInTheDocument();
    });

    it("disables the button initially", () => {
      render(<SignupPage />);

      const signUpButton = screen.queryByRole("button", { name: "Sign Up" });
      expect(signUpButton).toBeDisabled();
    });
  });

  describe("Interactions", () => {
    let signUpButton,
      userNameInput,
      emailInput,
      passwordInput,
      passwordRepeatInput;

    const renderSetup = () => {
      render(<SignupPage />);

      userNameInput = screen.getByLabelText("User name");
      emailInput = screen.getByLabelText("Email");
      passwordInput = screen.getByLabelText("Password");
      passwordRepeatInput = screen.getByLabelText("Password Repeat");

      userEvent.type(userNameInput, "username");
      userEvent.type(emailInput, "email@email.com");
      userEvent.type(passwordInput, "password");
      userEvent.type(passwordRepeatInput, "password");

      signUpButton = screen.queryByRole("button", { name: "Sign Up" });
    };

    it("enables the button when password and confirm password fields have the same value", () => {
      renderSetup();
      expect(signUpButton).toBeEnabled();
    });

    it("sends username, email and password to backend after clicking the button", async () => {
      renderSetup();

      userEvent.click(signUpButton);

      await screen.findByText(
        "Please check your email to activate your account"
      );

      expect(requestBody).toEqual({
        username: "username",
        email: "email@email.com",
        password: "password",
      });
    });

    it("disables button when there is an ongoing api call", async () => {
      renderSetup();

      userEvent.click(signUpButton);
      userEvent.click(signUpButton);

      await screen.findByText(
        "Please check your email to activate your account"
      );

      expect(counter).toBe(1);
    });

    it("displays button spinner after clicking submit", () => {
      renderSetup();
      expect(
        screen.queryByRole("status", { hidden: true })
      ).not.toBeInTheDocument();

      userEvent.click(signUpButton);
      expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    });

    it("displays account activation notification after successful sign up request", async () => {
      renderSetup();
      const message = "Please check your email to activate your account";
      expect(screen.queryByText(message)).not.toBeInTheDocument();
      userEvent.click(signUpButton);

      const text = await screen.findByText(message);

      expect(text).toBeInTheDocument();
    });

    it("hides sign up form after successful sign up request", async () => {
      renderSetup();
      const form = screen.getByTestId("form-sign-up");
      userEvent.click(signUpButton);

      await waitForElementToBeRemoved(form);
    });

    function generateValidationError(field, message) {
      return rest.post("/api/1.0/users", (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            validationErrors: { [field]: message },
          })
        );
      });
    }

    it("hides spinner and enables button after response received", async () => {
      const errorText = "Username cannot be null";

      server.use(generateValidationError("username", errorText));

      renderSetup();
      userEvent.click(signUpButton);

      await screen.findByText(errorText);
      expect(
        screen.queryByRole("status", { hidden: true })
      ).not.toBeInTheDocument();
      expect(signUpButton).toBeEnabled();
    });

    it.each`
      field         | message
      ${"username"} | ${"Username cannot be null"}
      ${"email"}    | ${"Email cannot be null"}
      ${"password"} | ${"Password cannot be null"}
    `("displays $message for $field", async ({ field, message }) => {
      server.use(generateValidationError(field, message));

      renderSetup();
      userEvent.click(signUpButton);

      const validationError = await screen.findByText(message);
      expect(validationError).toBeInTheDocument();
    });

    it("displays mismatch message for password repeat input", () => {
      renderSetup();
      userEvent.type(passwordInput, "Password");
      userEvent.type(passwordRepeatInput, "AnotherPassword");

      expect(screen.queryByText("Password mismatch")).toBeInTheDocument();
    });

    it.each`
      field         | message                      | label
      ${"username"} | ${"Username cannot be null"} | ${"User name"}
      ${"email"}    | ${"E-mail cannot be null"}   | ${"Email"}
      ${"password"} | ${"Password cannot be null"} | ${"Password"}
    `(
      "clears validation error after  $field is updated",
      async ({ field, message, label }) => {
        server.use(generateValidationError(field, message));

        renderSetup();
        userEvent.click(signUpButton);

        const validationError = await screen.findByText(message);

        userEvent.type(screen.getByLabelText(label), "updated");
        expect(validationError).not.toBeInTheDocument();
      }
    );
  });

  describe("Internationalization", () => {
    let turkishToggle,
      englishToggle,
      passwordInput,
      passwordRepeatInput,
      userNameInput,
      emailInput;
    function renderSetup() {
      render(
        <>
          <SignupPage />
          <LanguageSelector />
        </>
      );

      turkishToggle = screen.getByTitle("Turkish");
      englishToggle = screen.getByTitle("English");
      passwordInput = screen.getByLabelText(en.password);
      passwordRepeatInput = screen.getByLabelText(en.passwordRepeat);
      userNameInput = screen.getByLabelText(en.username);
      emailInput = screen.getByLabelText(en.email);
    }

    it("initially displays all text in English", () => {
      renderSetup();

      expect(
        screen.getByRole("heading", { name: en.signUp })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: en.signUp })
      ).toBeInTheDocument();

      expect(screen.getByLabelText(en.username)).toBeInTheDocument();
      expect(screen.getByLabelText(en.email)).toBeInTheDocument();
      expect(screen.getByLabelText(en.password)).toBeInTheDocument();
      expect(screen.getByLabelText(en.passwordRepeat)).toBeInTheDocument();
    });

    it("displays all text in Turkish after changing language", () => {
      renderSetup();

      userEvent.click(turkishToggle);

      expect(
        screen.getByRole("heading", { name: tr.signUp })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: tr.signUp })
      ).toBeInTheDocument();

      expect(screen.getByLabelText(tr.username)).toBeInTheDocument();
      expect(screen.getByLabelText(tr.email)).toBeInTheDocument();
      expect(screen.getByLabelText(tr.password)).toBeInTheDocument();
      expect(screen.getByLabelText(tr.passwordRepeat)).toBeInTheDocument();
    });

    it("displays all text in English after changing to English language", () => {
      renderSetup();

      userEvent.click(englishToggle);

      expect(
        screen.getByRole("heading", { name: en.signUp })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: en.signUp })
      ).toBeInTheDocument();

      expect(screen.getByLabelText(en.username)).toBeInTheDocument();
      expect(screen.getByLabelText(en.email)).toBeInTheDocument();
      expect(screen.getByLabelText(en.password)).toBeInTheDocument();
      expect(screen.getByLabelText(en.passwordRepeat)).toBeInTheDocument();
    });

    it("displays password missmatch validation message in turkish", () => {
      renderSetup();

      userEvent.click(turkishToggle);

      userEvent.type(passwordInput, "P4ss");
      userEvent.type(passwordRepeat, "P4ss123");

      const validationMessageInTurkish = screen.queryByText(
        tr.passwordMissmatchValidation
      );

      expect(validationMessageInTurkish).toBeInTheDocument();
    });

    it('sends accept language header as "en" for outgoing request', async () => {
      renderSetup();

      userEvent.type(passwordInput, "P4ssword");
      userEvent.type(passwordRepeatInput, "P4ssword");

      const button = screen.getByRole("button", { name: en.signUp });
      const form = screen.queryByTestId("form-sign-up");
      userEvent.click(button);

      await waitForElementToBeRemoved(form);

      expect(acceptLanguageHeader).toBe("en");
    });

    it('sends accept language header as "tr" for outgoing request after selecting Turkish language', async () => {
      renderSetup();

      userEvent.type(passwordInput, "P4ssword");
      userEvent.type(passwordRepeatInput, "P4ssword");

      const button = screen.getByRole("button", { name: en.signUp });
      userEvent.click(turkishToggle);

      const form = screen.queryByTestId("form-sign-up");
      userEvent.click(button);

      await waitForElementToBeRemoved(form);

      expect(acceptLanguageHeader).toBe("tr");
    });
  });
});
