use tauri::{Manager, WindowEvent};
use tauri_plugin_sql::{Migration, MigrationKind};

fn restore_main_window<R: tauri::Runtime>(app: &tauri::AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        if let Err(error) = window.show() {
            eprintln!("failed to show window: {error}");
        }

        if let Err(error) = window.unminimize() {
            eprintln!("failed to unminimize window: {error}");
        }

        if let Err(error) = window.set_focus() {
            eprintln!("failed to focus window: {error}");
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_learning_items",
            sql: "
            CREATE TABLE learning_items (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                kind TEXT NOT NULL CHECK (kind IN ('question', 'topic')),
                impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
                status TEXT NOT NULL CHECK (status IN ('open', 'investigating', 'resolved')),
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                resolved_at TEXT
            );
        ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "simplify_statuses_and_add_lesson_learned",
            sql: "
                CREATE TABLE learning_items_next (
                    id INTEGER PRIMARY KEY,
                    title TEXT NOT NULL,
                    kind TEXT NOT NULL CHECK (kind IN ('question', 'topic')),
                    impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
                    status TEXT NOT NULL CHECK (status IN ('open', 'resolved')),
                    lesson_learned TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    resolved_at TEXT
                );

                INSERT INTO learning_items_next
                    (id, title, kind, impact, status, lesson_learned, created_at, updated_at, resolved_at)
                SELECT
                    id,
                    title,
                    kind,
                    impact,
                    CASE WHEN status = 'resolved' THEN 'resolved' ELSE 'open' END,
                    NULL,
                    created_at,
                    updated_at,
                    CASE WHEN status = 'resolved' THEN resolved_at ELSE NULL END
                FROM learning_items;

                DROP TABLE learning_items;
                ALTER TABLE learning_items_next RENAME TO learning_items;
            ",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:learning-debt.db", migrations)
                .build(),
        )
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();

                if let Err(error) = window.hide() {
                    eprintln!("failed to hide window: {error}");
                }
            }
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            #[cfg(target_os = "macos")]
            if let tauri::RunEvent::Reopen { .. } = event {
                restore_main_window(app);
            }
        });
}
