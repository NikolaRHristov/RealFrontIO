use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::geo::MapBounds;

#[derive(Debug, Deserialize)]
pub struct CableLandingStation {
    pub name: String,
    pub lat: f64,
    pub lon: f64,
}

pub struct InfrastructureMatrix {
    /// Maps grid coordinates (x, y) to landing station data
    pub cable_landing_sites: HashMap<(u32, u32), String>,
}

impl InfrastructureMatrix {
    pub fn new() -> Self {
        Self {
            cable_landing_sites: HashMap::new(),
        }
    }

    /// Ingests Telegeography's Submarine Cable GeoJSON
    pub fn load_landing_stations(&mut self, json_data: &str, bounds: &MapBounds) {
        // Simulating the parse of the Telegeography JSON structure
        if let Ok(v) = serde_json::from_str::<serde_json::Value>(json_data) {
            if let Some(features) = v.get("features").and_then(|f| f.as_array()) {
                for feature in features {
                    if let Some(geometry) = feature.get("geometry") {
                        if geometry.get("type").and_then(|t| t.as_str()) == Some("Point") {
                            if let Some(coords) = geometry.get("coordinates").and_then(|c| c.as_array()) {
                                if let (Some(lon), Some(lat)) = (coords[0].as_f64(), coords[1].as_f64()) {
                                    if let Some((x, y)) = bounds.project_wgs84_to_grid(lat, lon) {
                                        let name = feature.get("properties")
                                            .and_then(|p| p.get("name"))
                                            .and_then(|n| n.as_str())
                                            .unwrap_or("Unknown Node");
                                            
                                        self.cable_landing_sites.insert((x, y), name.to_string());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /// Allows the Capsule to evaluate if a bomb hit a critical node
    pub fn check_strike_impact(&self, x: u32, y: u32, radius: u32) -> Option<String> {
        // Check grid around explosion radius for a landing station
        for dy in -(radius as i32)..=(radius as i32) {
            for dx in -(radius as i32)..=(radius as i32) {
                let tx = (x as i32 + dx) as u32;
                let ty = (y as i32 + dy) as u32;
                if let Some(name) = self.cable_landing_sites.get(&(tx, ty)) {
                    return Some(name.clone());
                }
            }
        }
        None
    }
}