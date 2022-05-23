import userEvent from "@testing-library/user-event";
import storage from "../state/storage";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "../test-utils/testing-library-utils";
import { BrowserRouter as Router } from "react-router-dom";

import ProfileCard from "./ProfileCard";

import { rest } from "msw";
import { setupServer } from "msw/node";

let apiCallCount, id, requestBody, header;
const server = setupServer(
  rest.put("/api/1.0/users/:id", (req, res, ctx) => {
    apiCallCount += 1;
    id = req.params.id;
    requestBody = req.body;
    header = req.headers.get("Authorization");

    return res(ctx.status(200));
  }),

  rest.delete("/api/1.0/users/:id", (req, res, ctx) => {
    id = req.params.id;
    header = req.headers.get("Authorization");
    return res(ctx.status(200));
  })
);

beforeEach(() => {
  id = undefined;
  apiCallCount = 0;
  server.resetHandlers();
});
beforeAll(() => server.listen());
afterAll(() => server.close());

describe("Profile Card", () => {
  function setup(user = { id: 5, username: "user5" }) {
    storage.setItem("auth", {
      id: 5,
      username: "user5",
      header: "auth header value",
    });

    render(
      <Router>
        <ProfileCard user={user} />
      </Router>
    );
  }

  let saveButton;
  function setupInEditMode() {
    setup();

    userEvent.click(screen.getByRole("button", { name: "Edit" }));
    saveButton = screen.getByRole("button", { name: "Save" });
  }

  it("displays edit button when logged in user is shown on card", () => {
    setup();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("does not display edit button for another user", () => {
    setup({ id: 2, username: "user2" });
    expect(
      screen.queryByRole("button", { name: "Edit" })
    ).not.toBeInTheDocument();
  });

  it("displays input for username after clicking edit", () => {
    setup();
    expect(
      screen.queryByLabelText("Change your username")
    ).not.toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.queryByLabelText("Change your username")).toBeInTheDocument();
  });

  it("displays save and cancel buttons in edit mode", () => {
    setup();
    userEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("hides Edit button and username header in edit mode", () => {
    setup();
    userEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(
      screen.queryByRole("heading", { name: "user5" })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Edit" })
    ).not.toBeInTheDocument();
  });

  it("has the current username in input", () => {
    setup();
    userEvent.click(screen.getByRole("button", { name: "Edit" }));
    const input = screen.queryByLabelText("Change your username");
    expect(input).toHaveValue("user5");
  });

  it("displays spinner during api call", async () => {
    setupInEditMode();
    userEvent.click(saveButton);

    const spinner = screen.getByRole("status", { hidden: true });
    await waitForElementToBeRemoved(spinner);
  });

  it("disables spinner button spinner during api call", async () => {
    setupInEditMode();
    userEvent.click(saveButton);
    userEvent.click(saveButton);

    const spinner = screen.getByRole("status", { hidden: true });

    await waitForElementToBeRemoved(spinner);
    expect(apiCallCount).toBe(1);
  });

  it("sends request to the endpoint having logged in user id", async () => {
    setupInEditMode();
    userEvent.click(saveButton);
    const spinner = screen.getByRole("status", { hidden: true });
    await waitForElementToBeRemoved(spinner);
    expect(id).toBe("5");
  });

  it("sends request with body having updated username", async () => {
    setupInEditMode();

    const input = screen.getByLabelText("Change your username");
    userEvent.clear(input);
    userEvent.type(input, "user5-updated");

    userEvent.click(saveButton);
    const spinner = screen.getByRole("status", { hidden: true });

    await waitForElementToBeRemoved(spinner);
    expect(requestBody).toEqual({ username: "user5-updated" });
  });

  it("sends request with authorization header", async () => {
    setupInEditMode();
    userEvent.click(saveButton);
    const spinner = screen.getByRole("status", { hidden: true });
    await waitForElementToBeRemoved(spinner);

    expect(header).toBe("auth header value");
  });

  it("sends request with body having current user name even if user was not updated", async () => {
    setupInEditMode();
    userEvent.click(saveButton);
    const spinner = screen.getByRole("status", { hidden: true });
    await waitForElementToBeRemoved(spinner);
    expect(requestBody).toEqual({ username: "user5" });
  });

  it("hides edit layout after successful update", async () => {
    setupInEditMode();
    userEvent.click(saveButton);
    const editButton = await screen.findByRole("button", { name: "Edit" });
    expect(editButton).toBeInTheDocument();
  });

  it("updates username in profile card after successful update", async () => {
    setupInEditMode();
    const editInput = screen.getByLabelText("Change your username");
    userEvent.clear(editInput);
    userEvent.type(editInput, "new-username");
    userEvent.click(saveButton);

    const newUserName = await screen.findByRole("heading", {
      name: "new-username",
    });
    expect(newUserName).toBeInTheDocument();
  });

  it("displays last updated name in input in edit mode after successful username update", async () => {
    setupInEditMode();
    let editInput = screen.getByLabelText("Change your username");
    userEvent.clear(editInput);
    userEvent.type(editInput, "new-username");
    userEvent.click(saveButton);

    const editButton = await screen.findByRole("button", { name: "Edit" });
    userEvent.click(editButton);

    editInput = screen.getByLabelText("Change your username");
    expect(editInput).toHaveValue("new-username");
  });

  it("hides edit layout after clicking cancel", async () => {
    setupInEditMode();
    userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    const editButton = await screen.findByRole("button", { name: "Edit" });
    expect(editButton).toBeInTheDocument();
  });

  it("displays original username after username is changed in edit mode but cancelled", async () => {
    setupInEditMode();
    let editInput = screen.getByLabelText("Change your username");
    userEvent.clear(editInput);
    userEvent.type(editInput, "new-username");

    userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    const header = screen.getByRole("heading", { name: "user5" });
    expect(header).toBeInTheDocument();
  });

  it("displays last updated username after clicking cancel in second edit", async () => {
    setupInEditMode();
    let editInput = screen.getByLabelText("Change your username");
    userEvent.clear(editInput);
    userEvent.type(editInput, "new-username");
    userEvent.click(saveButton);

    const editButton = await screen.findByRole("button", { name: "Edit" });
    userEvent.click(editButton);

    userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    const header = screen.getByRole("heading", { name: "new-username" });
    expect(header).toBeInTheDocument();
  });

  it("displays delete button when logged in user is shown on card", () => {
    setup();
    expect(
      screen.getByRole("button", { name: "Delete my account" })
    ).toBeInTheDocument();
  });

  it("does not display delete button for another user", () => {
    setup({ id: 2, username: "user2" });
    expect(
      screen.queryByRole("button", { name: "Delete my account" })
    ).not.toBeInTheDocument();
  });

  it("displays modal after clicking delete button", () => {
    setup();
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();

    const deleteButton = screen.queryByRole("button", {
      name: "Delete my account",
    });
    userEvent.click(deleteButton);

    const modal = screen.queryByTestId("modal");

    expect(modal).toBeInTheDocument();
  });

  it("displays confirmation question with cancel and confirm buttons", () => {
    setup();

    const deleteButton = screen.queryByRole("button", {
      name: "Delete my account",
    });
    userEvent.click(deleteButton);

    expect(
      screen.queryByText("Are you sure you want to delete your account?")
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Cancel" })
    ).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "Yes" })).toBeInTheDocument();
  });

  it("removes modal after clicking cancel", () => {
    setup();
    const deleteButton = screen.queryByRole("button", {
      name: "Delete my account",
    });
    userEvent.click(deleteButton);
    userEvent.click(screen.queryByRole("button", { name: "Cancel" }));

    const modal = screen.queryByTestId("modal");

    expect(modal).not.toBeInTheDocument();
  });

  it("displays spinner while delete api call in progress", async () => {
    setup();
    const deleteButton = screen.queryByRole("button", {
      name: "Delete my account",
    });

    userEvent.click(deleteButton);

    expect(
      screen.queryByRole("status", { hidden: true })
    ).not.toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: "Yes" }));

    const spinner = screen.getByRole("status", { hidden: true });
    await waitForElementToBeRemoved(spinner);
  });

  it("sends logged in user id and authorization header in delete api call", async () => {
    setup();
    const deleteButton = screen.queryByRole("button", {
      name: "Delete my account",
    });

    userEvent.click(deleteButton);
    userEvent.click(screen.getByRole("button", { name: "Yes" }));

    const spinner = screen.getByRole("status", { hidden: true });
    await waitForElementToBeRemoved(spinner);

    expect(header).toBe("auth header value");
    expect(id).toBe("5");
  });
});
