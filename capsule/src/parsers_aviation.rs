use serde::Deserialize;
use crate::geo::MapBounds;
use sha2::{Sha256, Digest};
use crate::ingest::pb;

#[derive(Debug, Deserialize)]
struct NotamData {
    pub lat: f64,
    pub lon: f64,
    pub restriction_type: String, // "NO_FLY_ZONE"
    pub radius_nm: f32,
}

pub fn parse_aviation_notams(json_data: &str, bounds: &MapBounds, current_tick: u64) -> Vec<pb::WorldHazardEvent> {
    let mut events = Vec::new();
    
    // Parses FAA / ICAO Notices to Airmen (NOTAMs)
    if let Ok(v) = serde_json::from_str::<Vec<NotamData>>(json_data) {
        for notam in v {
            if notam.restriction_type == "NO_FLY_ZONE" {
                if let Some((grid_x, grid_y)) = bounds.project_wgs84_to_grid(notam.lat, notam.lon) {
                    let mut hasher = Sha256::new();
                    hasher.update(format!("NOTAM|{}|{}|{}", grid_x, grid_y, current_tick));

                    events.push(pb::WorldHazardEvent {
                        event_hash: hex::encode(hasher.finalize()),
                        center_x: grid_x,
                        center_y: grid_y,
                        severity: 1.0, // Absolute block
                        radius: notam.radius_nm / 10.0, // Convert Nautical Miles to Grid Tiles
                        tick_applied: current_tick,
                        // We map this into Channel 11 (Airspace/Recon)
                        category: pb::HazardCategory::HazardCyberAttack as i32, 
                    });
                }
            }
        }
    }
    events
}