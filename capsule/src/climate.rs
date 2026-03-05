use serde::Deserialize;
use crate::geo::MapBounds;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
pub struct WeatherData {
    pub lat: f64,
    pub lon: f64,
    pub precipitation_mm: f32, // Rainfall / Snowfall density
    pub temperature_c: f32,    // Celsius
}

pub struct ClimateMatrix {
    /// Maps grid coordinates to (Precipitation, Temperature)
    pub climate_grid: HashMap<(u32, u32), (f32, f32)>,
}

impl ClimateMatrix {
    pub fn new() -> Self {
        Self {
            climate_grid: HashMap::new(),
        }
    }

    /// Ingests live Open-Meteo or NOAA Precipitation/Temp data
    pub fn update_weather(&mut self, json_data: &str, bounds: &MapBounds) {
        self.climate_grid.clear();

        if let Ok(v) = serde_json::from_str::<Vec<WeatherData>>(json_data) {
            for data in v {
                if let Some((x, y)) = bounds.project_wgs84_to_grid(data.lat, data.lon) {
                    
                    // Weather systems are massive (hundreds of km wide)
                    let storm_radius = 20; 
                    
                    for dy in -storm_radius..=storm_radius {
                        for dx in -storm_radius..=storm_radius {
                            let distance = ((dx*dx + dy*dy) as f32).sqrt();
                            if distance <= storm_radius as f32 {
                                let tx = (x as i32 + dx) as u32;
                                let ty = (y as i32 + dy) as u32;
                                
                                // Precipitation fades at the edges of the storm system
                                let intensity = 1.0 - (distance / storm_radius as f32);
                                let current_precip = data.precipitation_mm * intensity;

                                // We average temperatures, but sum precipitation
                                let cell = self.climate_grid.entry((tx, ty)).or_insert((0.0, data.temperature_c));
                                cell.0 += current_precip;
                                cell.1 = (cell.1 + data.temperature_c) / 2.0; 
                            }
                        }
                    }
                }
            }
        }
    }

    /// Allows the capsule to write these values into the 16-Channel array
    /// Channel 12 = Precipitation (0.0 to 1.0 scalar)
    /// Channel 13 = Extreme Cold (1.0 = Freezing, 0.0 = Normal/Hot)
    pub fn get_climate_scalars(&self, x: u32, y: u32) -> (f32, f32) {
        if let Some((precip, temp)) = self.climate_grid.get(&(x, y)) {
            // Normalize: 50mm/hr is torrential flooding (1.0)
            let precip_scalar = (*precip / 50.0).clamp(0.0, 1.0);
            
            // Normalize Cold: -30C is max freezing (1.0), 0C is (0.0)
            let cold_scalar = if *temp < 0.0 {
                (temp.abs() / 30.0).clamp(0.0, 1.0)
            } else {
                0.0
            };

            return (precip_scalar, cold_scalar);
        }
        (0.0, 0.0) // Clear, temperate skies
    }
}