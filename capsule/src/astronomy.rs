use chrono::{DateTime, Utc, Datelike, Timelike};
use std::f64::consts::PI;

pub struct AstronomyEngine;

impl AstronomyEngine {
    /// Calculates the Solar Zenith angle for a specific WGS84 coordinate at a given UTC time.
    /// If the angle is > 90 degrees, that coordinate is experiencing nighttime.
    pub fn calculate_solar_zenith(lat: f64, lon: f64, current_time: DateTime<Utc>) -> f64 {
        // Day of year (1-365)
        let day_of_year = current_time.ordinal() as f64;
        
        // Fractional year in radians
        let fractional_year = (2.0 * PI / 365.25) * (day_of_year - 1.0 + ((current_time.hour() as f64 - 12.0) / 24.0));
        
        // Equation of time (in minutes)
        let eq_time = 229.18 * (
            0.000075 + 
            0.001868 * fractional_year.cos() - 
            0.032077 * fractional_year.sin() - 
            0.014615 * (2.0 * fractional_year).cos() - 
            0.040849 * (2.0 * fractional_year).sin()
        );

        // Solar declination angle (in radians)
        let declination = 0.006918 - 
            0.399912 * fractional_year.cos() + 
            0.070257 * fractional_year.sin() - 
            0.006758 * (2.0 * fractional_year).cos() + 
            0.000907 * (2.0 * fractional_year).sin() - 
            0.002697 * (3.0 * fractional_year).cos() + 
            0.00148 * (3.0 * fractional_year).sin();

        // Time offset in minutes
        let time_offset = eq_time + (4.0 * lon);
        
        // True solar time in minutes
        let current_minutes = (current_time.hour() as f64 * 60.0) + current_time.minute() as f64 + (current_time.second() as f64 / 60.0);
        let true_solar_time = (current_minutes + time_offset) % 1440.0;
        
        // Solar hour angle in degrees
        let hour_angle = (true_solar_time / 4.0) - 180.0;
        let hour_angle_rad = hour_angle * (PI / 180.0);
        let lat_rad = lat * (PI / 180.0);

        // Cosine of the solar zenith angle
        let cos_zenith = (lat_rad.sin() * declination.sin()) + 
                         (lat_rad.cos() * declination.cos() * hour_angle_rad.cos());

        // Return zenith angle in degrees
        cos_zenith.acos() * (180.0 / PI)
    }

    /// Converts a solar zenith angle into a 0.0 (Pitch Black) to 1.0 (High Noon) scalar
    pub fn calculate_illumination_scalar(zenith_degrees: f64) -> f32 {
        if zenith_degrees > 96.0 {
            // Civil Twilight / Night
            return 0.0;
        } else if zenith_degrees < 84.0 {
            // Full Daylight
            return 1.0;
        } else {
            // Twilight gradient (84.0 to 96.0 degrees)
            return ((96.0 - zenith_degrees) / 12.0) as f32;
        }
    }
}