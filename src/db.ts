import Database from "@tauri-apps/plugin-sql";

export type ItemKind = "question" | "topic";
export type ItemStatus = "open" | "resolved";

export type LearningItem = {
  id: number;
  title: string;
  kind: ItemKind;
  impact: number;
  status: ItemStatus;
  lesson_learned: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

const DATABASE_URL = "sqlite:learning-debt.db";

let databasePromise: Promise<Database> | null = null;

function getDatabase() {
  databasePromise ??= Database.load(DATABASE_URL);
  return databasePromise;
}

export async function loadLearningItems() {
  const db = await getDatabase();

  return db.select<LearningItem[]>(
    `SELECT id, title, kind, impact, status, lesson_learned, created_at, updated_at, resolved_at
     FROM learning_items
     ORDER BY created_at DESC`,
  );
}

export async function insertLearningItem(input: {
  title: string;
  kind: ItemKind;
  impact: number;
}) {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const result = await db.execute(
    `INSERT INTO learning_items
       (title, kind, impact, status, lesson_learned, created_at, updated_at, resolved_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [input.title, input.kind, input.impact, "open", null, now, now, null],
  );

  return {
    id: Number(result.lastInsertId),
    title: input.title,
    kind: input.kind,
    impact: input.impact,
    status: "open" as const,
    lesson_learned: null,
    created_at: now,
    updated_at: now,
    resolved_at: null,
  };
}

export async function resolveLearningItem(
  id: number,
  lessonLearned: string,
) {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE learning_items
     SET status = ?, lesson_learned = ?, updated_at = ?, resolved_at = ?
     WHERE id = ?`,
    ["resolved", lessonLearned, now, now, id],
  );

  return {
    status: "resolved" as const,
    lesson_learned: lessonLearned,
    updated_at: now,
    resolved_at: now,
  };
}

export async function deleteLearningItem(id: number) {
  const db = await getDatabase();

  await db.execute("DELETE FROM learning_items WHERE id = ?", [id]);
}
