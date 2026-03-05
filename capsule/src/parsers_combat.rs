// capsule/src/parsers_combat.rs
use serde::Deserialize;
use sha2::{Sha256, Digest};
use crate::geo::MapBounds;
use crate::ingest::pb;

// --- ACLED (Armed Conflict Location Data) ---
#[derive(Debug, Deserialize)]
struct AcledEvent {
    latitude: String,
    longitude: String,
    event_type: String, // e.g., "Explosions/Remote violence", "Battles"
    fatalities: String,
}

#[derive(Debug, Deserialize)]
struct AcledResponse {
    data: Vec<AcledEvent>,
}

pub fn parse_acled_conflicts(json_data: &str, bounds: &MapBounds, current_tick: u64) -> Vec<pb::WorldHazardEvent> {
    let mut events = Vec::new();
    
    let response: AcledResponse = match serde_json::from_str(json_data) {
        Ok(v) => v,
        Err(_) => return events,
    };

    for record in response.data {
        let lat: f64 = record.latitude.parse().unwrap_or(0.0);
        let lon: f64 = record.longitude.parse().unwrap_or(0.0);
        let fatalities: f32 = record.fatalities.parse().unwrap_or(0.0);

        // Filter out minor events. Only trigger game states for major skirmishes.
        if fatalities > 5.0 || record.event_type.contains("Explosions") {
            if let Some((grid_x, grid_y)) = bounds.project_wgs84_to_grid(lat, lon) {
                let severity = (fatalities / 100.0).clamp(0.2, 1.0);
                
                let mut hasher = Sha256::new();
                hasher.update(format!("ACLED|{}|{}|{}", grid_x, grid_y, current_tick));
                
                events.push(pb::WorldHazardEvent {
                    event_hash: hex::encode(hasher.finalize()),
                    center_x: grid_x,
                    center_y: grid_y,
                    severity,
                    radius: severity * 5.0, // Blast/Conflict radius
                    tick_applied: current_tick,
                    category: pb::HazardCategory::HazardGeopoliticalConflict as i32,
                });
            }
        }
    }
    events
}

// --- OPENSKY NETWORK (Air Traffic / Recon) ---
pub fn parse_opensky_recon(json_data: &str, bounds: &MapBounds, current_tick: u64) -> Vec<pb::WorldHazardEvent> {
    let mut events = Vec::new();
    
    // OpenSky returns a massive array of arrays. We deserialize manually.
    let parsed: serde_json::Value = match serde_json::from_str(json_data) {
        Ok(v) => v,
        Err(_) => return events,
    };

    if let Some(states) = parsed.get("states").and_then(|s| s.as_array()) {
        for state in states {
            // Index 6 = Longitude, Index 5 = Latitude, Index 8 = is_on_ground
            if let (Some(lon), Some(lat), Some(on_ground)) = (
                state.get(5).and_then(|v| v.as_f64()),
                state.get(6).and_then(|v| v.as_f64()),
                state.get(8).and_then(|v| v.as_bool()),
            ) {
                // If it's flying, it provides recon data
                if !on_ground {
                    if let Some((grid_x, grid_y)) = bounds.project_wgs84_to_grid(lat, lon) {
                        let mut hasher = Sha256::new();
                        hasher.update(format!("SKY|{}|{}|{}", grid_x, grid_y, current_tick));

                        events.push(pb::WorldHazardEvent {
                            event_hash: hex::encode(hasher.finalize()),
                            center_x: grid_x,
                            center_y: grid_y,
                            severity: 1.0, 
                            radius: 15.0, // 15 tile line-of-sight clearing
                            tick_applied: current_tick,
                            // Repurposing a category for RECON
                            category: pb::HazardCategory::HazardUnknown as i32, 
                        });
                    }
                }
            }
        }
    }
    events
}