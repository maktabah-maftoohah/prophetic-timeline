import re
from pathlib import Path

def test_project():
    root = Path(__file__).resolve().parent.parent
    
    # 1. Essential documentation and infrastructure files
    assert (root / "index.html").exists(), "index.html missing"
    assert (root / "mahmoud-pasha.html").exists(), "mahmoud-pasha.html missing"
    assert (root / "manifest.webmanifest").exists(), "manifest.webmanifest missing"
    assert (root / "sw.js").exists(), "sw.js missing"
    assert (root / "robots.txt").exists(), "robots.txt missing"
    assert (root / "sitemap.xml").exists(), "sitemap.xml missing"
    assert (root / "AGENTS.md").exists(), "AGENTS.md missing"
    assert (root / "README.md").exists(), "README.md missing"
    assert (root / "LICENSE").exists(), "LICENSE missing"
    assert (root / ".nojekyll").exists(), ".nojekyll missing"
    assert (root / "data" / "events.json").exists(), "data/events.json missing"

    # 2. Key CSS and JS modules
    assert (root / "css" / "main.css").exists(), "css/main.css missing"
    assert (root / "css" / "profile.css").exists(), "css/profile.css missing"
    assert (root / "css" / "timeline.css").exists(), "css/timeline.css missing"
    assert (root / "css" / "calendar.css").exists(), "css/calendar.css missing"
    assert (root / "css" / "visualizers.css").exists(), "css/visualizers.css missing"
    assert (root / "js" / "app.js").exists(), "js/app.js missing"
    assert (root / "js" / "profile.js").exists(), "js/profile.js missing"

    # 3. Verify all assets declared in sw.js ASSETS_TO_CACHE exist on disk
    sw_path = root / "sw.js"
    with open(sw_path, "r", encoding="utf-8") as f:
        sw_content = f.read()

    cache_match = re.search(r"ASSETS_TO_CACHE\s*=\s*\[(.*?)\];", sw_content, re.DOTALL)
    assert cache_match, "ASSETS_TO_CACHE array not found in sw.js"
    entries = re.findall(r'["\'](\./[^"\']*)["\']', cache_match.group(1))
    for entry in entries:
        clean_entry = entry.lstrip("./")
        if clean_entry == "":
            continue
        file_path = root / clean_entry
        assert file_path.exists(), f"Service worker asset missing from disk: {entry}"

    print("Project structure verification PASSED for prophetic-timeline.")

if __name__ == "__main__":
    test_project()
