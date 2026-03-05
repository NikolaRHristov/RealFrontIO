use serde::Deserialize;
use crate::geo::MapBounds;
use sha2::{Sha256, Digest};
use crate::ingest::pb;

#[derive(Debug, Deserialize)]
struct UsgsFeature {
    properties: UsgsProperties,
    geometry: UsgsGeometry,
}

#[derive(Debug, Deserialize)]
struct UsgsProperties {
    mag: f32, // Magnitude
    place: String,
    time: u64, // Unix Epoch MS
}

#[derive(Debug, Deserialize)]
struct UsgsGeometry {
    coordinates: Vec<f64>, // [longitude, latitude, depth]
}

#[derive(Debug, Deserialize)]
struct UsgsResponse {
    features: Vec<UsgsFeature>,
}

pub fn parse_usgs_earthquakes(json_data: &str, bounds: &MapBounds, current_tick: u64) -> Vec<pb::WorldHazardEvent> {
    let mut events = Vec::new();
    
    let response: UsgsResponse = match serde_json::from_str(json_data) {
        Ok(v) => v,
        Err(_) => return events,
    };

    for feature in response.features {
        // Only trigger game-altering mechanics for severe earthquakes (Magnitude 5.5+)
        if feature.properties.mag >= 5.5 {
            let lon = feature.geometry.coordinates[0];
            let lat = feature.geometry.coordinates[1];

            if let Some((grid_x, grid_y)) = bounds.project_wgs84_to_grid(lat, lon) {
                // Magnitude scale is exponential. 
                // A 6.0 is severe, an 8.0 is cataclysmic. We normalize this to a 0.0-1.0 scalar.
                let normalized_severity = ((feature.properties.mag - 5.0) / 4.0).clamp(0.1, 1.0);
                
                // Blast radius increases exponentially with magnitude
                let radius = normalized_severity * 20.0;

                let mut hasher = Sha256::new();
                hasher.update(format!("QUAKE|{}|{}|{}", grid_x, grid_y, feature.properties.time));

                events.push(pb::WorldHazardEvent {
                    event_hash: hex::encode(hasher.finalize()),
                    center_x: grid_x,
                    center_y: grid_y,
                    severity: normalized_severity,
                    radius,
                    tick_applied: current_tick,
                    category: pb::HazardCategory::HazardEarthquake as i32,
                });
            }
        }
    }
    events
}