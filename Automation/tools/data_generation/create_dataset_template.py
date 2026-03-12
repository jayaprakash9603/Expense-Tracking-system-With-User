from pathlib import Path
import csv
import sys


HEADERS = ["scenario", "username", "password", "expected_error", "datasetId", "iteration"]


def main() -> int:
    if len(sys.argv) < 3:
        print("Usage: python create_dataset_template.py <env> <feature>")
        return 1
    env_name = sys.argv[1].strip().lower()
    feature = sys.argv[2].strip().lower()
    output = Path("test-suites/src/main/resources/testdata") / env_name / feature / "dataset-template.csv"
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(HEADERS)
        writer.writerow(["*", "", "", "", "default", "0"])
    print(f"Dataset template generated: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
