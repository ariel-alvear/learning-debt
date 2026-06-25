import { FormEvent, useEffect, useState } from "react";
import {
  deleteLearningItem,
  insertLearningItem,
  ItemKind,
  LearningItem,
  loadLearningItems,
  resolveLearningItem,
} from "./db";

export default function App() {
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [kind, setKind] = useState<ItemKind>("question");
  const [learningImpact, setLearningImpact] = useState(3);
  const [items, setItems] = useState<LearningItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [lessonLearned, setLessonLearned] = useState("");
  const [resolveError, setResolveError] = useState("");
  const [itemPendingDelete, setItemPendingDelete] =
    useState<LearningItem | null>(null);

  const selectedItem =
    items.find((item) => item.id === selectedItemId) ?? null;
  const openItems = items
    .filter((item) => item.status === "open")
    .sort((first, second) => compareDatesDesc(first.created_at, second.created_at));
  const resolvedItems = items
    .filter((item) => item.status === "resolved")
    .sort((first, second) =>
      compareDatesDesc(first.resolved_at ?? "", second.resolved_at ?? ""),
    );

  useEffect(() => {
    loadLearningItems()
      .then(setItems)
      .catch((error) => console.error("Failed to load learning items", error));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitleError("Add a learning debt before capturing.");
      return;
    }

    try {
      const savedItem = await insertLearningItem({
        title: trimmedTitle,
        kind,
        impact: learningImpact,
      });

      setItems((currentItems) => [savedItem, ...currentItems]);
      setTitle("");
      setTitleError("");
      setKind("question");
      setLearningImpact(3);
    } catch (error) {
      console.error("Failed to save learning item", error);
    }
  }

  async function handleResolve(item: LearningItem) {
    const trimmedLesson = lessonLearned.trim();

    if (!trimmedLesson) {
      return;
    }

    try {
      const updates = await resolveLearningItem(item.id, trimmedLesson);

      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, ...updates }
            : currentItem,
        ),
      );
      closeDetail();
    } catch (error) {
      console.error("Failed to resolve learning item", error);
      setResolveError("Could not save. Please try again.");
    }
  }

  function closeDetail() {
    setSelectedItemId(null);
    setIsResolving(false);
    setLessonLearned("");
    setResolveError("");
  }

  async function handleDelete() {
    if (!itemPendingDelete) {
      return;
    }

    try {
      await deleteLearningItem(itemPendingDelete.id);
      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== itemPendingDelete.id),
      );

      if (selectedItemId === itemPendingDelete.id) {
        closeDetail();
      }

      setItemPendingDelete(null);
    } catch (error) {
      console.error("Failed to delete learning item", error);
    }
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function renderImpact(value: number) {
    return (
      <span className="impact-dots" aria-label={`impact ${value} of 5`}>
        {"●".repeat(value)}
        {"○".repeat(5 - value)}
      </span>
    );
  }

  function renderStatus(status: LearningItem["status"]) {
    return (
      <span className={`status-badge ${status}`}>
        <span aria-hidden="true">{status === "resolved" ? "✓" : "○"}</span>
        {status === "resolved" ? "Resolved" : "Open"}
      </span>
    );
  }

  function compareDatesDesc(first: string, second: string) {
    return new Date(second).getTime() - new Date(first).getTime();
  }

  function getLessonPreview(lesson: string | null) {
    if (!lesson) {
      return "";
    }

    const compactLesson = lesson.replace(/\s+/g, " ").trim();

    if (compactLesson.length <= 100) {
      return compactLesson;
    }

    return `${compactLesson.slice(0, 100).trimEnd()}…`;
  }

  function renderItemRow(item: LearningItem) {
    const lessonPreview =
      item.status === "resolved" ? getLessonPreview(item.lesson_learned) : "";

    return (
      <li key={item.id}>
        <div className="item-card">
          <button
            className="item-row"
            onClick={() => setSelectedItemId(item.id)}
            type="button"
          >
            <span className="item-title">{item.title}</span>
            <span className="item-meta">
              <small>{item.kind}</small>
              {renderImpact(item.impact)}
              {renderStatus(item.status)}
            </span>
            {lessonPreview ? (
              <span className="lesson-preview">"{lessonPreview}"</span>
            ) : null}
          </button>
          <button
            aria-label={`Delete ${item.title}`}
            className="delete-item-button"
            onClick={() => setItemPendingDelete(item)}
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="14"
              viewBox="0 0 24 24"
              width="14"
            >
              <path
                d="M3 6h18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <path
                d="M8 6V4h8v2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M6 6l1 14h10l1-14"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M10 11v5M14 11v5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
      </li>
    );
  }

  return (
    <main className="app-shell">
      <header>
        <h1>📚 Learning Debt</h1>
        <p>Capture unanswered questions before you forget them.</p>
      </header>

      <form className="capture-form" onSubmit={handleSubmit}>
        <input
          aria-label="Learning Debt"
          aria-describedby={titleError ? "title-error" : undefined}
          aria-invalid={titleError ? "true" : "false"}
          className="debt-input"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setTitleError("");
          }}
          placeholder="What do you want to understand better?"
        />
        {titleError ? (
          <p className="form-error" id="title-error">
            {titleError}
          </p>
        ) : null}

        <fieldset className="kind-selector">
          <legend>Kind</legend>
          <div className="segment-group" aria-label="Kind">
            <button
              aria-pressed={kind === "question"}
              className={kind === "question" ? "segment active" : "segment"}
              onClick={() => setKind("question")}
              type="button"
            >
              Question
            </button>
            <button
              aria-pressed={kind === "topic"}
              className={kind === "topic" ? "segment active" : "segment"}
              onClick={() => setKind("topic")}
              type="button"
            >
              Topic
            </button>
          </div>
        </fieldset>

        <fieldset className="impact-rating">
          <legend>Learning Impact</legend>
          <div className="impact-control">
            <span>Low ←</span>
            <div className="rating-buttons" aria-label="Learning Impact">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  aria-label={`Set learning impact to ${value}`}
                  aria-pressed={learningImpact === value}
                  className="rating-dot"
                  key={value}
                  onClick={() => setLearningImpact(value)}
                  type="button"
                >
                  {value <= learningImpact ? "●" : "○"}
                </button>
              ))}
            </div>
            <span>→ High</span>
          </div>
        </fieldset>

        <button type="submit">Capture Debt</button>
      </form>

      <section className="debt-section" aria-labelledby="open-heading">
        <h2 id="open-heading">
          Open Debt <span>({openItems.length})</span>
        </h2>
        {openItems.length === 0 ? (
          <p>No open learning debt.</p>
        ) : (
          <ul>{openItems.map(renderItemRow)}</ul>
        )}
      </section>

      <section className="debt-section" aria-labelledby="resolved-heading">
        <h2 id="resolved-heading">
          Resolved Debt <span>({resolvedItems.length})</span>
        </h2>
        {resolvedItems.length === 0 ? (
          <p>No resolved learning debt yet.</p>
        ) : (
          <ul>{resolvedItems.map(renderItemRow)}</ul>
        )}
      </section>

      {selectedItem ? (
        <div
          aria-labelledby="detail-title"
          aria-modal="true"
          className="detail-backdrop"
          role="dialog"
        >
          <section className="detail-panel">
            <div className="detail-header">
              <h2 id="detail-title">{selectedItem.title}</h2>
              <button
                aria-label="Close detail"
                className="close-button"
                onClick={closeDetail}
                type="button"
              >
                ×
              </button>
            </div>

            <dl className="detail-list">
              <div>
                <dt>Kind</dt>
                <dd>{selectedItem.kind}</dd>
              </div>
              <div>
                <dt>Learning Impact</dt>
                <dd>{renderImpact(selectedItem.impact)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{renderStatus(selectedItem.status)}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(selectedItem.created_at)}</dd>
              </div>
              {selectedItem.status === "resolved" &&
              selectedItem.lesson_learned ? (
                <div>
                  <dt>Lesson Learned</dt>
                  <dd>{selectedItem.lesson_learned}</dd>
                </div>
              ) : null}
            </dl>

            {selectedItem.status === "open" ? (
              <div className="resolve-section">
                {isResolving ? (
                  <label>
                    Lesson Learned
                    <textarea
                      value={lessonLearned}
                      onChange={(event) => {
                        setLessonLearned(event.target.value);
                        setResolveError("");
                      }}
                      placeholder="Summarize what you learned in one idea."
                      rows={3}
                    />
                  </label>
                ) : null}

                {resolveError ? (
                  <p className="error-message">{resolveError}</p>
                ) : null}

                <button
                  disabled={isResolving && !lessonLearned.trim()}
                  onClick={() =>
                    isResolving
                      ? handleResolve(selectedItem)
                      : setIsResolving(true)
                  }
                  type="button"
                >
                  Resolve Debt
                </button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {itemPendingDelete ? (
        <div
          aria-labelledby="delete-title"
          aria-modal="true"
          className="detail-backdrop"
          role="dialog"
        >
          <section className="confirm-panel">
            <h2 id="delete-title">Delete Learning Debt?</h2>
            <p>This action cannot be undone.</p>
            <div className="confirm-actions">
              <button
                className="secondary-button"
                onClick={() => setItemPendingDelete(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="danger-button"
                onClick={handleDelete}
                type="button"
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
