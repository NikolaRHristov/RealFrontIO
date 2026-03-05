# Update capsule/Cargo.toml with SQLite support
# sqlx = { version = "0.7", features = ["runtime-tokio-rustls", "sqlite"] }

use sqlx::{sqlite::SqlitePool, Row};
use crate::ingest::pb::WorldHazardEvent;

pub struct TelemetryDatabase {
    pool: SqlitePool,
}

impl TelemetryDatabase {
    pub async fn new(db_url: &str) -> Self {
        let pool = SqlitePool::connect(db_url).await.expect("Failed to connect to SQLite telemetry DB");
        
        // Ensure the immutable event ledger exists
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS hazard_events (
                event_hash TEXT PRIMARY KEY,
                center_x INTEGER,
                center_y INTEGER,
                severity REAL,
                radius REAL,
                category INTEGER,
                unix_timestamp_ms INTEGER
            )"
        )
        .execute(&pool)
        .await
        .unwrap();

        Self { pool }
    }

    /// Logs live events into the ledger for future historical playback
    pub async fn log_event(&self, event: &WorldHazardEvent, timestamp_ms: u64) {
        sqlx::query(
            "INSERT OR IGNORE INTO hazard_events 
            (event_hash, center_x, center_y, severity, radius, category, unix_timestamp_ms) 
            VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&event.event_hash)
        .bind(event.center_x)
        .bind(event.center_y)
        .bind(event.severity)
        .bind(event.radius)
        .bind(event.category)
        .bind(timestamp_ms as i64)
        .execute(&pool)
        .await
        .unwrap();
    }

    /// Fetches a window of historical events for time-travel mode
    pub async fn fetch_historical_window(&self, start_ms: u64, end_ms: u64) -> Vec<WorldHazardEvent> {
        let rows = sqlx::query(
            "SELECT * FROM hazard_events WHERE unix_timestamp_ms >= ? AND unix_timestamp_ms <= ? ORDER BY unix_timestamp_ms ASC"
        )
        .bind(start_ms as i64)
        .bind(end_ms as i64)
        .fetch_all(&self.pool)
        .await
        .unwrap();

        let mut events = Vec::new();
        for row in rows {
            events.push(WorldHazardEvent {
                event_hash: row.get("event_hash"),
                center_x: row.get::<i64, _>("center_x") as u32,
                center_y: row.get::<i64, _>("center_y") as u32,
                severity: row.get("severity"),
                radius: row.get("radius"),
                category: row.get::<i32, _>("category"),
                tick_applied: 0, // Assigned by the TypeScript engine during playback
            });
        }
        events
    }
}