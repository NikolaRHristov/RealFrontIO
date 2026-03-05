use serde::Deserialize;
use crate::geo::MapBounds;
use sha2::{Sha256, Digest};
use crate::ingest::pb;

// --- GDACS HYDROLOGICAL THREATS (Floods & Inundations) ---
#[derive(Debug, Deserialize)]
struct GdacsFlood {
    pub lat: f64,
    pub lon: f64,
    pub severity: f32, // GDACS Flood Severity (1.0 to 3.0)
}

pub fn parse_gdacs_floods(json_data: &str, bounds: &MapBounds, current_tick: u64) -> Vec<pb::WorldHazardEvent> {
    let mut events = Vec::new();
    
    if let Ok(v) = serde_json::from_str::<Vec<GdacsFlood>>(json_data) {
        for flood in v {
            if let Some((grid_x, grid_y)) = bounds.project_wgs84_to_grid(flood.lat, flood.lon) {
                
                // Normalize GDACS severity to a 0.0 - 1.0 scalar
                let normalized_severity = (flood.severity / 3.0).clamp(0.1, 1.0);
                
                let mut hasher = Sha256::new();
                hasher.update(format!("FLOOD|{}|{}|{}", grid_x, grid_y, current_tick));

                events.push(pb::WorldHazardEvent {
                    event_hash: hex::encode(hasher.finalize()),
                    center_x: grid_x,
                    center_y: grid_y,
                    severity: normalized_severity,
                    radius: normalized_severity * 20.0, // Floods pool over massive geographic regions
                    tick_applied: current_tick,
                    // We map this directly into Channel 12 (Precipitation/Water)
                    category: pb::HazardCategory::HazardUnknown as i32, 
                });
            }
        }
    }
    events
}