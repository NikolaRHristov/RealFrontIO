use serde::Deserialize;
use crate::geo::MapBounds;
use sha2::{Sha256, Digest};
use crate::ingest::pb;

// --- NOAA SPACE WEATHER (Geomagnetic Storms / EMP) ---
#[derive(Debug, Deserialize)]
struct NoaaKpIndex {
    pub time_tag: String,
    pub kp: f32, // Planetary K-index (0 to 9)
}

pub fn parse_space_weather(json_data: &str, current_tick: u64) -> Option<pb::WorldHazardEvent> {
    // Space weather affects the entire planet, but is stronger near the poles.
    // We will emit a global event if Kp >= 7 (G3 to G5 Strong/Extreme storms).
    if let Ok(v) = serde_json::from_str::<Vec<NoaaKpIndex>>(json_data) {
        if let Some(latest) = v.last() {
            if latest.kp >= 7.0 {
                let severity = (latest.kp / 9.0).clamp(0.0, 1.0);
                
                let mut hasher = Sha256::new();
                hasher.update(format!("SPACE_WEATHER|{}", current_tick));
                
                return Some(pb::WorldHazardEvent {
                    event_hash: hex::encode(hasher.finalize()),
                    center_x: 0, // Handled as a global multiplier by the engine
                    center_y: 0,
                    severity,
                    radius: 99999.0, // Global reach
                    tick_applied: current_tick,
                    category: pb::HazardCategory::HazardCyberAttack as i32, // Reusing cyber for EMP logic
                });
            }
        }
    }
    None
}

// --- WHO DISEASE OUTBREAKS (Biological Hazards) ---
#[derive(Debug, Deserialize)]
struct DiseaseOutbreak {
    pub lat: f64,
    pub lon: f64,
    pub disease_name: String,
    pub cases: u32,
}

pub fn parse_biological_hazards(json_data: &str, bounds: &MapBounds, current_tick: u64) -> Vec<pb::WorldHazardEvent> {
    let mut events = Vec::new();
    
    if let Ok(v) = serde_json::from_str::<Vec<DiseaseOutbreak>>(json_data) {
        for outbreak in v {
            if outbreak.cases > 100 {
                if let Some((grid_x, grid_y)) = bounds.project_wgs84_to_grid(outbreak.lat, outbreak.lon) {
                    let severity = (outbreak.cases as f32 / 10000.0).clamp(0.1, 1.0);
                    
                    let mut hasher = Sha256::new();
                    hasher.update(format!("BIO|{}|{}|{}", grid_x, grid_y, current_tick));

                    events.push(pb::WorldHazardEvent {
                        event_hash: hex::encode(hasher.finalize()),
                        center_x: grid_x,
                        center_y: grid_y,
                        severity,
                        radius: severity * 30.0, // Pandemics spread wide
                        tick_applied: current_tick,
                        // Custom category handled by BioManager
                        category: pb::HazardCategory::HazardUnknown as i32, 
                    });
                }
            }
        }
    }
    events
}