use axum::{
    routing::{post, get},
    Router, Json, extract::State,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::broadcast;
use crate::ingest::pb::{WorldHazardEvent, HazardCategory, TickEventBatch};
use crate::geo::MapBounds;
use sha2::{Sha256, Digest};

#[derive(Deserialize)]
pub struct SyntheticStrikeRequest {
    pub lat: f64,
    pub lon: f64,
    pub severity: f32, // 0.0 to 1.0
    pub hazard_type: String, // e.g., "CYBER", "SEISMIC", "ECONOMIC"
}

#[derive(Serialize)]
pub struct StrikeResponse {
    pub success: bool,
    pub injected_hash: String,
    pub grid_x: u32,
    pub grid_y: u32,
}

pub struct AdminState {
    pub tx: broadcast::Sender<TickEventBatch>,
    pub bounds: Arc<MapBounds>,
}

pub async fn start_admin_server(state: Arc<AdminState>) {
    let app = Router::new()
        .route("/api/v1/deep-state/strike", post(inject_synthetic_event))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:50052").await.unwrap();
    println!("[DEEP STATE] Admin API listening on port 50052");
    axum::serve(listener, app).await.unwrap();
}

async fn inject_synthetic_event(
    State(state): State<Arc<AdminState>>,
    Json(payload): Json<SyntheticStrikeRequest>,
) -> Json<StrikeResponse> {
    
    if let Some((grid_x, grid_y)) = state.bounds.project_wgs84_to_grid(payload.lat, payload.lon) {
        
        let category = match payload.hazard_type.as_str() {
            "CYBER" => HazardCategory::HazardCyberAttack,
            "SEISMIC" => HazardCategory::HazardEarthquake,
            "ECONOMIC" => HazardCategory::HazardEconomicSanction,
            "WILDFIRE" => HazardCategory::HazardWildfire,
            _ => HazardCategory::HazardUnknown,
        };

        let mut hasher = Sha256::new();
        hasher.update(format!("SYNTHETIC|{}|{}|{}", grid_x, grid_y, std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis()));
        let event_hash = hex::encode(hasher.finalize());

        let synthetic_event = WorldHazardEvent {
            event_hash: event_hash.clone(),
            center_x: grid_x,
            center_y: grid_y,
            severity: payload.severity,
            radius: payload.severity * 50.0, // Massive radius for admin strikes
            tick_applied: 0, 
            category: category as i32,
        };

        // Instantly inject the synthetic event into the live gRPC stream
        let _ = state.tx.send(TickEventBatch {
            game_tick: 0, // Ignored by client adapter
            events: vec![synthetic_event],
        });

        return Json(StrikeResponse {
            success: true,
            injected_hash: event_hash,
            grid_x,
            grid_y,
        });
    }

    Json(StrikeResponse { success: false, injected_hash: "".to_string(), grid_x: 0, grid_y: 0 })
}