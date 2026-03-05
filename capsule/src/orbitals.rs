use serde::Deserialize;
use crate::geo::MapBounds;
use std::collections::HashMap;

// Using a simplified TLE to Geocentric translation stub.
// In production, we'd use the `sgp4` crate to calculate precise ground-tracks.
#[derive(Debug, Deserialize)]
pub struct SatellitePosition {
    pub norad_id: u32,
    pub name: String,
    pub lat: f64,
    pub lon: f64,
    pub altitude_km: f32,
}

pub struct OrbitalMatrix {
    /// Tracks GPS coverage strength per grid coordinate
    pub gps_coverage_grid: HashMap<(u32, u32), f32>,
}

impl OrbitalMatrix {
    pub fn new() -> Self {
        Self {
            gps_coverage_grid: HashMap::new(),
        }
    }

    /// Ingests live Celestrak / Space-Track position data
    pub fn update_satellite_positions(&mut self, json_data: &str, bounds: &MapBounds) {
        self.gps_coverage_grid.clear(); // Clear previous orbital frame

        if let Ok(v) = serde_json::from_str::<Vec<SatellitePosition>>(json_data) {
            for sat in v {
                // We only care about navigational constellations (GPS, GLONASS, Galileo)
                if sat.name.contains("NAVSTAR") || sat.name.contains("GLONASS") {
                    if let Some((x, y)) = bounds.project_wgs84_to_grid(sat.lat, sat.lon) {
                        
                        // A MEO (Medium Earth Orbit) GPS satellite covers a massive footprint.
                        // We project a radius of coverage onto our 2D grid.
                        let footprint_radius = 50; // Grid tiles
                        
                        for dy in -footprint_radius..=footprint_radius {
                            for dx in -footprint_radius..=footprint_radius {
                                let distance = ((dx*dx + dy*dy) as f32).sqrt();
                                if distance <= footprint_radius as f32 {
                                    let tx = (x as i32 + dx) as u32;
                                    let ty = (y as i32 + dy) as u32;
                                    
                                    // Add coverage strength (peaks directly beneath the satellite)
                                    let signal_strength = 1.0 - (distance / footprint_radius as f32);
                                    let cell = self.gps_coverage_grid.entry((tx, ty)).or_insert(0.0);
                                    *cell = (*cell + signal_strength).clamp(0.0, 1.0); // Max coverage is 1.0
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /// Extrapolates signal coverage for a specific coordinate
    pub fn get_coverage_at(&self, x: u32, y: u32) -> f32 {
        *self.gps_coverage_grid.get(&(x, y)).unwrap_or(&0.1) // Default 10% coverage (poor signal)
    }
}