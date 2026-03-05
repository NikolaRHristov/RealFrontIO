use serde::Deserialize;
use crate::ingest::pb;
use chrono::{Utc, Datelike};

/// Simulates the real-world lunar phase based on the current UTC date.
/// 0.0 = New Moon (Pitch Black), 1.0 = Full Moon (Bright Night)
pub fn calculate_lunar_illumination(current_tick: u64) -> Option<pb::WorldHazardEvent> {
    let now = Utc::now();
    
    // A highly simplified lunar phase calculation (29.53 days per cycle)
    // Known new moon: Jan 6, 2000. 
    let known_new_moon = chrono::NaiveDate::from_ymd_opt(2000, 1, 6).unwrap().and_hms_opt(0, 0, 0).unwrap();
    let diff = now.naive_utc().signed_duration_since(known_new_moon);
    
    let cycle_length = 29.53058867; // Days
    let days_since_new = diff.num_days() as f64 + (diff.num_seconds() as f64 / 86400.0);
    let phase = (days_since_new % cycle_length) / cycle_length;
    
    // Illumination curve (Sine wave where 0.5 phase = Full Moon = 1.0)
    let illumination = (phase * std::f64::consts::PI * 2.0).cos() * -0.5 + 0.5;

    Some(pb::WorldHazardEvent {
        event_hash: format!("LUNAR_{}", current_tick),
        center_x: 0,
        center_y: 0,
        severity: illumination as f32, // Passed as a global scalar
        radius: 0.0,
        tick_applied: current_tick,
        category: pb::HazardCategory::HazardUnknown as i32, 
    })
}