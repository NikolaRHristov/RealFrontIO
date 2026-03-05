use serde::Deserialize;
use crate::geo::MapBounds;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
pub struct WindData {
    pub lat: f64,
    pub lon: f64,
    pub u_component: f32, // East-West wind velocity (m/s)
    pub v_component: f32, // North-South wind velocity (m/s)
}

pub struct MeteorologicalMatrix {
    /// Maps grid coordinates (x, y) to a (u, v) wind vector
    pub wind_grid: HashMap<(u32, u32), (f32, f32)>,
}

impl MeteorologicalMatrix {
    pub fn new() -> Self {
        Self {
            wind_grid: HashMap::new(),
        }
    }

    /// Parses NOAA / GFS (Global Forecast System) GRIB2 data converted to JSON
    pub fn load_wind_vectors(&mut self, json_data: &str, bounds: &MapBounds) {
        if let Ok(v) = serde_json::from_str::<Vec<WindData>>(json_data) {
            for record in v {
                if let Some((x, y)) = bounds.project_wgs84_to_grid(record.lat, record.lon) {
                    self.wind_grid.insert((x, y), (record.u_component, record.v_component));
                }
            }
        }
    }

    /// Extrapolates the wind vector for a specific coordinate (nearest neighbor)
    pub fn get_vector_at(&self, x: u32, y: u32) -> (f32, f32) {
        // Simple 2D bounding box search for closest wind station
        for radius in 0..5 {
            for dy in -radius..=radius {
                for dx in -radius..=radius {
                    let tx = (x as i32 + dx) as u32;
                    let ty = (y as i32 + dy) as u32;
                    if let Some(vector) = self.wind_grid.get(&(tx, ty)) {
                        return *vector;
                    }
                }
            }
        }
        (0.0, 0.0) // Dead air
    }
}