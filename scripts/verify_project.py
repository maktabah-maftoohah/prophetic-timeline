import os
from pathlib import Path

def test_project():
    root = Path(__file__).resolve().parent.parent
    assert (root / "index.html").exists(), "index.html missing"
    assert (root / "mahmoud-pasha.html").exists(), "mahmoud-pasha.html missing"
    assert (root / "css" / "profile.css").exists(), "css/profile.css missing"
    assert (root / "js" / "profile.js").exists(), "js/profile.js missing"
    assert (root / "assets" / "mahmoud-pasha.jpg").exists(), "assets/mahmoud-pasha.jpg missing"
    assert (root / "AGENTS.md").exists(), "AGENTS.md missing"
    assert (root / ".nojekyll").exists(), ".nojekyll missing"
    print("Project structure verification PASSED for prophetic-timeline.")

if __name__ == "__main__":
    test_project()
