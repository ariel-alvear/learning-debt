import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { LearningItem } from "./db";

const dbMocks = vi.hoisted(() => ({
  deleteLearningItem: vi.fn(),
  insertLearningItem: vi.fn(),
  loadLearningItems: vi.fn(),
  resolveLearningItem: vi.fn(),
}));

vi.mock("./db", () => {
  return {
    deleteLearningItem: dbMocks.deleteLearningItem,
    insertLearningItem: dbMocks.insertLearningItem,
    loadLearningItems: dbMocks.loadLearningItems,
    resolveLearningItem: dbMocks.resolveLearningItem,
  };
});

const openItem: LearningItem = {
  id: 1,
  title: "OAuth access tokens",
  kind: "question",
  impact: 4,
  status: "open",
  lesson_learned: null,
  created_at: "2026-06-23T12:00:00.000Z",
  updated_at: "2026-06-23T12:00:00.000Z",
  resolved_at: null,
};

const resolvedItem: LearningItem = {
  id: 2,
  title: "React effects",
  kind: "topic",
  impact: 3,
  status: "resolved",
  lesson_learned:
    "Effects synchronize React state with external systems after rendering.",
  created_at: "2026-06-22T12:00:00.000Z",
  updated_at: "2026-06-23T13:00:00.000Z",
  resolved_at: "2026-06-23T13:00:00.000Z",
};

function renderApp(items: LearningItem[] = []) {
  dbMocks.loadLearningItems.mockResolvedValue(items);

  return render(<App />);
}

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the capture form", async () => {
    renderApp();

    expect(await screen.findByLabelText("Learning Debt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Question" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Topic" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Capture Debt" })).toBeInTheDocument();
  });

  it("lets the user enter a learning debt title", async () => {
    const user = userEvent.setup();
    renderApp();

    const input = await screen.findByLabelText("Learning Debt");
    await user.type(input, "Understand SQLite migrations");

    expect(input).toHaveValue("Understand SQLite migrations");
  });

  it("lets the user switch between Question and Topic", async () => {
    const user = userEvent.setup();
    renderApp();

    const question = await screen.findByRole("button", { name: "Question" });
    const topic = screen.getByRole("button", { name: "Topic" });

    expect(question).toHaveAttribute("aria-pressed", "true");

    await user.click(topic);

    expect(topic).toHaveAttribute("aria-pressed", "true");
    expect(question).toHaveAttribute("aria-pressed", "false");
  });

  it("lets the user select learning impact", async () => {
    const user = userEvent.setup();
    renderApp();

    const impactFive = await screen.findByRole("button", {
      name: "Set learning impact to 5",
    });

    await user.click(impactFive);

    expect(impactFive).toHaveAttribute("aria-pressed", "true");
  });

  it("captures debt with title, kind, impact, and open status", async () => {
    const user = userEvent.setup();
    const savedItem: LearningItem = {
      ...openItem,
      id: 10,
      title: "Understand JWT claims",
      kind: "topic",
      impact: 5,
      status: "open",
    };

    dbMocks.insertLearningItem.mockResolvedValue(savedItem);
    renderApp();

    await user.type(await screen.findByLabelText("Learning Debt"), savedItem.title);
    await user.click(screen.getByRole("button", { name: "Topic" }));
    await user.click(screen.getByRole("button", { name: "Set learning impact to 5" }));
    await user.click(screen.getByRole("button", { name: "Capture Debt" }));

    expect(dbMocks.insertLearningItem).toHaveBeenCalledWith({
      title: savedItem.title,
      kind: "topic",
      impact: 5,
    });
    expect(await screen.findByText(savedItem.title)).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("renders open and resolved debt sections", async () => {
    renderApp([openItem, resolvedItem]);

    const openSection = await screen.findByRole("heading", {
      name: "Open Debt (1)",
    });
    const resolvedSection = screen.getByRole("heading", {
      name: "Resolved Debt (1)",
    });

    expect(openSection).toBeInTheDocument();
    expect(resolvedSection).toBeInTheDocument();
    expect(screen.getByText(openItem.title)).toBeInTheDocument();
    expect(screen.getByText(resolvedItem.title)).toBeInTheDocument();
  });

  it("shows a lesson learned preview for resolved items", async () => {
    renderApp([resolvedItem]);

    expect(
      await screen.findByText(
        `"${resolvedItem.lesson_learned}"`,
      ),
    ).toBeInTheDocument();
  });

  it("requires a non-empty lesson before resolving an item", async () => {
    const user = userEvent.setup();
    renderApp([openItem]);

    await screen.findByText(openItem.title);
    await user.click(screen.getAllByRole("button", { name: /OAuth access tokens/i })[0]);
    await user.click(screen.getByRole("button", { name: "Resolve Debt" }));

    const dialog = screen.getByRole("dialog");
    const resolveButton = within(dialog).getByRole("button", {
      name: "Resolve Debt",
    });

    expect(resolveButton).toBeDisabled();
    expect(dbMocks.resolveLearningItem).not.toHaveBeenCalled();

    await user.type(
      screen.getByPlaceholderText("Summarize what you learned in one idea."),
      "Access tokens represent authorization, not identity.",
    );

    expect(resolveButton).toBeEnabled();
  });
});
