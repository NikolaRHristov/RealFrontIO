// capsule/src/parsers_news.rs
//
// RSS 2.0 / Atom feed parser for geopolitical news feeds.
// Produces WorldHazardEvents for channels 7 (Civil Unrest) and 10 (Combat Zone).
//
// Severity pipeline:
//   base_severity = extract_severity_hint(title + description)
//   final_severity = (base_severity * credibility_weight).clamp(0.0, 1.0)
//
// Events below 0.25 final_severity are dropped to avoid noise.

use quick_xml::Reader;
use quick_xml::events::Event;
use sha2::{Sha256, Digest};
use crate::geo::MapBounds;
use crate::ingest::pb;
use crate::entity_extractor::{extract_centroid, extract_severity_hint};
use crate::source_tier::get_source_tier;

pub fn parse_rss_feed(
    xml_data: &str,
    source_domain: &str,
    bounds: &MapBounds,
    current_tick: u64,
) -> Vec<pb::WorldHazardEvent> {
    let mut events = Vec::new();
    let tier = get_source_tier(source_domain);

    let mut reader = Reader::from_str(xml_data);
    reader.config_mut().trim_text(true);

    let mut in_item  = false;
    let mut capture: Option<&'static str> = None; // "title" | "desc"
    let mut title_buf = String::new();
    let mut desc_buf  = String::new();
    let mut buf = Vec::new();

    loop {
        buf.clear();
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(ref e)) => {
                let name = std::str::from_utf8(e.name().as_ref())
                    .unwrap_or("").to_lowercase();
                match name.as_str() {
                    "item" | "entry" => {
                        in_item = true;
                        title_buf.clear();
                        desc_buf.clear();
                    }
                    "title" if in_item => capture = Some("title"),
                    "description" | "summary" | "content" if in_item => capture = Some("desc"),
                    _ => {}
                }
            }
            Ok(Event::Text(ref e)) => {
                if in_item {
                    if let Ok(text) = e.unescape() {
                        match capture {
                            Some("title") => title_buf.push_str(&text),
                            Some("desc")  => desc_buf.push_str(&text),
                            _ => {}
                        }
                    }
                }
            }
            Ok(Event::CData(ref e)) => {
                if in_item {
                    if let Ok(text) = std::str::from_utf8(e.as_ref()) {
                        match capture {
                            Some("title") => title_buf.push_str(text),
                            Some("desc")  => desc_buf.push_str(text),
                            _ => {}
                        }
                    }
                }
            }
            Ok(Event::End(ref e)) => {
                let name = std::str::from_utf8(e.name().as_ref())
                    .unwrap_or("").to_lowercase();
                match name.as_str() {
                    "title" | "description" | "summary" | "content" => capture = None,
                    "item" | "entry" if in_item => {
                        in_item = false;
                        let combined = format!("{} {}", title_buf.trim(), desc_buf.trim());

                        if let Some((lat, lon)) = extract_centroid(&combined) {
                            if let Some((grid_x, grid_y)) = bounds.project_wgs84_to_grid(lat, lon) {
                                let base_sev  = extract_severity_hint(&combined);
                                let severity  = (base_sev * tier.credibility_weight).clamp(0.0, 1.0);

                                if severity >= 0.25 {
                                    let mut hasher = Sha256::new();
                                    hasher.update(format!(
                                        "NEWS|{}|{}|{}|{}",
                                        source_domain,
                                        title_buf.trim(),
                                        grid_x,
                                        grid_y
                                    ));

                                    // High-severity → Combat Zone (ch 10)
                                    // Low-severity  → Civil Unrest proxy (ch 7, via HazardUnknown)
                                    let category = if base_sev >= 0.65 {
                                        pb::HazardCategory::HazardGeopoliticalConflict as i32
                                    } else {
                                        pb::HazardCategory::HazardUnknown as i32
                                    };

                                    events.push(pb::WorldHazardEvent {
                                        event_hash: hex::encode(hasher.finalize()),
                                        center_x: grid_x,
                                        center_y: grid_y,
                                        severity,
                                        radius: severity * 8.0,
                                        tick_applied: current_tick,
                                        category,
                                    });
                                }
                            }
                        }
                    }
                    _ => {}
                }
            }
            Ok(Event::Eof) | Err(_) => break,
            _ => {}
        }
    }

    events
}
