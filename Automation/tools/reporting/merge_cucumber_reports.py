from pathlib import Path
import json
import sys


def scenario_status_counts(paths: list[Path]) -> dict[str, int]:
    counts = {"passed": 0, "failed": 0, "skipped": 0}
    for path in paths:
        payload = json.loads(path.read_text(encoding="utf-8"))
        for feature in payload:
            for scenario in feature.get("elements", []):
                statuses = [step.get("result", {}).get("status") for step in scenario.get("steps", [])]
                if any(status == "failed" for status in statuses):
                    counts["failed"] += 1
                elif any(status == "skipped" for status in statuses):
                    counts["skipped"] += 1
                else:
                    counts["passed"] += 1
    return counts


def main() -> int:
    report_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("automation-bdd/target/reports/cucumber")
    report_files = sorted(report_dir.glob("*.json"))
    if not report_files:
        print(f"No cucumber json reports found under {report_dir}")
        return 1
    counts = scenario_status_counts(report_files)
    output = report_dir / "summary.json"
    output.write_text(json.dumps(counts, indent=2), encoding="utf-8")
    print(f"Summary generated: {output}")
    print(json.dumps(counts, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
