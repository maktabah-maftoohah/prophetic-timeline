import json
import math
from pathlib import Path

HIJRAH_EPOCH_JDN = 1948439
MAWLID_JDN = 1929725

WEEKDAYS = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"]

def julian_to_jdn(y, m, d):
    if m <= 2:
        y -= 1
        m += 12
    return math.floor(365.25 * (y + 4716)) + math.floor(30.6001 * (m + 1)) + d - 1524

def jdn_to_hijri(jdn):
    l = jdn - HIJRAH_EPOCH_JDN + 10632
    n = math.floor((l - 1) / 10631)
    lAdj = l - 10631 * n + 354
    j = (math.floor((10985 - lAdj) / 5316)) * (math.floor((50 * lAdj) / 17719)) + \
        (math.floor(lAdj / 5670)) * (math.floor((43 * lAdj) / 15238))
    lFinal = lAdj - (math.floor((30 - j) / 15)) * (math.floor((17719 * j) / 50)) - \
             (math.floor(j / 16)) * (math.floor((15238 * j) / 43)) + 29
    month = math.floor((24 * lFinal) / 709)
    day = lFinal - math.floor((709 * month) / 24)
    year = 30 * n + j - 30
    is_bh = year <= 0
    display_year = abs(year) + 1 if is_bh else year
    year_type = "BH" if is_bh else "AH"
    return display_year, month, day, year_type

def test_data():
    root = Path(__file__).resolve().parent.parent
    events_path = root / "data" / "events.json"
    
    assert events_path.exists(), "events.json not found"
    with open(events_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    events = data["events"]
    assert len(events) >= 25, f"Expected at least 25 events, found {len(events)}"

    for ev in events:
        eid = ev["id"]
        # Required keys
        for key in ["id", "category", "granularity", "date", "title", "narrative"]:
            assert key in ev, f"Event {eid} missing key {key}"
        
        # Languages check
        for l in ["ms", "en", "ar"]:
            assert l in ev["title"], f"Event {eid} missing title for {l}"
            assert f"summary_{l}" in ev["narrative"], f"Event {eid} missing summary for {l}"
            
        jdn = ev.get("date", {}).get("jdn")
        if jdn:
            # Weekday check
            computed_wk = WEEKDAYS[(jdn + 1) % 7]
            rec_wk = ev["date"].get("weekday")
            if rec_wk:
                assert rec_wk == computed_wk, f"Event {eid}: recorded weekday '{rec_wk}' != computed '{computed_wk}'"
                
            # Mawlid interval check
            astro = ev.get("astronomical_meta") or {}
            rec_diff = astro.get("day_count_from_mawlid")
            if rec_diff is not None:
                assert rec_diff == (jdn - MAWLID_JDN), f"Event {eid}: recorded day_count_from_mawlid {rec_diff} != computed {jdn - MAWLID_JDN}"

    print("Data integrity verification PASSED.")

if __name__ == "__main__":
    test_data()
