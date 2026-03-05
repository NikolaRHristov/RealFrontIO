// capsule/src/entity_extractor.rs
//
// Maps geopolitical keywords in news headlines to WGS84 centroids.
// The centroid is then projected onto the game grid via MapBounds.

struct CountryEntry {
    lat: f64,
    lon: f64,
    keywords: &'static [&'static str],
}

static COUNTRY_TABLE: &[CountryEntry] = &[
    CountryEntry { lat: 49.0, lon:  31.0, keywords: &["ukraine", "ukrainian", "kyiv", "zelensky"] },
    CountryEntry { lat: 61.5, lon:  90.0, keywords: &["russia", "russian", "kremlin", "moscow", "putin"] },
    CountryEntry { lat: 31.5, lon:  34.8, keywords: &["israel", "israeli", "idf", "tel aviv", "netanyahu"] },
    CountryEntry { lat: 31.9, lon:  35.2, keywords: &["gaza", "palestinian", "hamas", "rafah", "west bank"] },
    CountryEntry { lat: 32.4, lon:  53.7, keywords: &["iran", "iranian", "irgc", "tehran", "khamenei"] },
    CountryEntry { lat: 35.9, lon: 104.2, keywords: &["china", "chinese", "beijing", "pla", "xi jinping"] },
    CountryEntry { lat: 37.1, lon: -95.7, keywords: &["united states", "america", "american", "pentagon"] },
    CountryEntry { lat: 34.8, lon:  38.9, keywords: &["syria", "syrian", "damascus", "aleppo"] },
    CountryEntry { lat: 15.6, lon:  48.5, keywords: &["yemen", "yemeni", "houthi", "houthis", "sanaa"] },
    CountryEntry { lat: 33.9, lon:  35.5, keywords: &["lebanon", "lebanese", "beirut", "hezbollah"] },
    CountryEntry { lat: 33.2, lon:  43.7, keywords: &["iraq", "iraqi", "baghdad"] },
    CountryEntry { lat: 33.9, lon:  67.7, keywords: &["afghanistan", "afghan", "kabul", "taliban"] },
    CountryEntry { lat: 40.3, lon: 127.5, keywords: &["north korea", "dprk", "pyongyang"] },
    CountryEntry { lat: 19.2, lon:  96.7, keywords: &["myanmar", "burma", "yangon"] },
    CountryEntry { lat: 12.9, lon:  30.2, keywords: &["sudan", "sudanese", "khartoum", "rsf"] },
    CountryEntry { lat:  9.1, lon:  40.5, keywords: &["ethiopia", "ethiopian", "tigray"] },
    CountryEntry { lat:  5.2, lon:  46.2, keywords: &["somalia", "somali", "mogadishu", "al-shabaab"] },
    CountryEntry { lat: 26.3, lon:  17.2, keywords: &["libya", "libyan", "tripoli"] },
    CountryEntry { lat: 53.7, lon:  27.9, keywords: &["belarus", "belarusian", "minsk", "lukashenko"] },
    CountryEntry { lat: -4.0, lon:  21.8, keywords: &["congo", "drc", "kinshasa", "m23"] },
    CountryEntry { lat: 38.9, lon:  35.2, keywords: &["turkey", "turkish", "ankara", "erdogan"] },
    CountryEntry { lat: 23.6, lon: 120.9, keywords: &["taiwan", "taiwanese", "taipei"] },
    CountryEntry { lat: 55.4, lon:  -3.4, keywords: &["britain", "british", "london", "uk"] },
    CountryEntry { lat: 46.2, lon:   2.2, keywords: &["france", "french", "paris"] },
    CountryEntry { lat: 51.2, lon:  10.5, keywords: &["germany", "german", "berlin"] },
];

/// Returns the WGS84 centroid of the first matching country keyword.
pub fn extract_centroid(text: &str) -> Option<(f64, f64)> {
    let lower = text.to_lowercase();
    for entry in COUNTRY_TABLE {
        for &kw in entry.keywords {
            if lower.contains(kw) {
                return Some((entry.lat, entry.lon));
            }
        }
    }
    None
}

/// Returns a 0.0–1.0 severity hint based on crisis keyword matching.
/// Maps to the game's channel 10 (Combat Zone) and channel 7 (Civil Unrest).
pub fn extract_severity_hint(text: &str) -> f32 {
    let lower = text.to_lowercase();

    const CRITICAL: &[&str] = &[
        "invasion", "nuclear", "icbm", "missile strike", "airstrike",
        "war declared", "bombing campaign", "offensive launched",
    ];
    const HIGH: &[&str] = &[
        "battle", "conflict", "military operation", "attack", "explosion",
        "troops deployed", "combat", "artillery",
    ];
    const MEDIUM: &[&str] = &[
        "protest", "unrest", "riot", "sanction", "blockade",
        "casualt", "clashes", "coup",
    ];

    if CRITICAL.iter().any(|&kw| lower.contains(kw)) { return 0.9; }
    if HIGH.iter().any(|&kw| lower.contains(kw))     { return 0.65; }
    if MEDIUM.iter().any(|&kw| lower.contains(kw))   { return 0.40; }
    0.15
}
