use serde::Deserialize;
use crate::geo::MapBounds;
use sha2::{Sha256, Digest};
use crate::ingest::pb;

// --- IAEA NUCLEAR EVENT ALERTS ---
// Refactoring the worldmonitor IAEA RSS feed parser
#[derive(Debug, Deserialize)]
struct IaeaAlert {
    pub lat: f64,
    pub lon: f64,
    pub incident_level: u8, // INES Scale 1 to 7 (7 is Chernobyl/Fukushima)
}

pub fn parse_iaea_alerts(json_data: &str, bounds: &MapBounds, current_tick: u64) -> Vec<pb::WorldHazardEvent> {
    let mut events = Vec::new();
    
    if let Ok(v) = serde_json::from_str::<Vec<IaeaAlert>>(json_data) {
        for alert in v {
            if alert.incident_level >= 4 { // Only Level 4+ (Accident with local consequences)
                if let Some((grid_x, grid_y)) = bounds.project_wgs84_to_grid(alert.lat, alert.lon) {
                    let severity = (alert.incident_level as f32 / 7.0).clamp(0.1, 1.0);
                    
                    let mut hasher = Sha256::new();
                    hasher.update(format!("IAEA|{}|{}|{}", grid_x, grid_y, current_tick));

                    events.push(pb::WorldHazardEvent {
                        event_hash: hex::encode(hasher.finalize()),
                        center_x: grid_x,
                        center_y: grid_y,
                        severity,
                        radius: severity * 15.0, // Radiation spread
                        tick_applied: current_tick,
                        category: pb::HazardCategory::HazardRadiation as i32, // Triggers CBRN logic
                    });
                }
            }
        }
    }
    events
}