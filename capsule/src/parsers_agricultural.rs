use serde::Deserialize;
use crate::geo::MapBounds;
use sha2::{Sha256, Digest};
use crate::ingest::pb;

// --- FAO AGRICULTURAL THREATS (Droughts & Locust Swarms) ---
#[derive(Debug, Deserialize)]
struct AgriculturalThreat {
    pub lat: f64,
    pub lon: f64,
    pub threat_type: String, // "DROUGHT" or "LOCUST"
    pub intensity: f32, // 0.0 to 1.0
}

pub fn parse_agricultural_threats(json_data: &str, bounds: &MapBounds, current_tick: u64) -> Vec<pb::WorldHazardEvent> {
    let mut events = Vec::new();
    
    if let Ok(v) = serde_json::from_str::<Vec<AgriculturalThreat>>(json_data) {
        for threat in v {
            if let Some((grid_x, grid_y)) = bounds.project_wgs84_to_grid(threat.lat, threat.lon) {
                
                // Both Drought and Locusts destroy crops, leading to starvation.
                // We map this into Channel 7 (Civil Unrest/Starvation) or as a new synthetic event.
                
                let mut hasher = Sha256::new();
                hasher.update(format!("AGRI|{}|{}|{}", grid_x, grid_y, current_tick));

                events.push(pb::WorldHazardEvent {
                    event_hash: hex::encode(hasher.finalize()),
                    center_x: grid_x,
                    center_y: grid_y,
                    severity: threat.intensity,
                    radius: threat.intensity * 25.0, // Famine spreads over large regions
                    tick_applied: current_tick,
                    category: pb::HazardCategory::HazardEconomicSanction as i32, // Mapped to economic destruction
                });
            }
        }
    }
    events
}