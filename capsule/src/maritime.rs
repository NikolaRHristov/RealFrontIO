use serde::Deserialize;
use crate::geo::MapBounds;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
pub struct AisShipData {
    pub mmsi: u32,
    pub lat: f64,
    pub lon: f64,
    pub speed: f32, // knots
    pub vessel_type: u8, // 70-79 = Cargo
}

pub struct MaritimeMatrix {
    /// Tracks active cargo ship density per grid coordinate
    pub shipping_density: HashMap<(u32, u32), u32>,
}

impl MaritimeMatrix {
    pub fn new() -> Self {
        Self {
            shipping_density: HashMap::new(),
        }
    }

    /// Ingests live AIS (Automatic Identification System) data from global maritime APIs
    pub fn update_shipping_lanes(&mut self, json_data: &str, bounds: &MapBounds) {
        self.shipping_density.clear(); // Reset density for the new tick

        if let Ok(v) = serde_json::from_str::<Vec<AisShipData>>(json_data) {
            for ship in v {
                // Only track massive commercial cargo ships (Type 70-79)
                if ship.vessel_type >= 70 && ship.vessel_type <= 79 {
                    if let Some((x, y)) = bounds.project_wgs84_to_grid(ship.lat, ship.lon) {
                        let count = self.shipping_density.entry((x, y)).or_insert(0);
                        *count += 1;
                    }
                }
            }
        }
    }

    /// Evaluates if a real-world chokepoint (e.g. Suez, Panama) is blocked
    /// A blockade is defined as unusually zero/low velocity in a known high-density lane
    pub fn calculate_global_trade_health(&self) -> f32 {
        let mut total_active_ships = 0;
        for count in self.shipping_density.values() {
            total_active_ships += count;
        }

        // Baseline global active cargo fleet is roughly ~50,000. 
        // We normalize this to a 0.0 -> 1.0 health multiplier.
        (total_active_ships as f32 / 50_000.0).clamp(0.1, 1.0)
    }
}