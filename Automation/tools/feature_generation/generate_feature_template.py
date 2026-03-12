from pathlib import Path
import sys


def build_content(domain: str, scenario: str) -> str:
    return (
        f"@{domain}\n"
        f"Feature: {domain.capitalize()} automated flow\n\n"
        f"  @regression\n"
        f"  Scenario: {scenario}\n"
        f"    Given \"{domain}\" domain automation skeleton is ready\n"
        f"    Then \"{domain}\" domain placeholders are wired\n"
    )


def main() -> int:
    if len(sys.argv) < 3:
        print("Usage: python generate_feature_template.py <domain> <scenario-name>")
        return 1
    domain = sys.argv[1].strip().lower()
    scenario = " ".join(sys.argv[2:]).strip()
    output = Path("test-suites/src/main/resources/features") / domain / f"{domain}_template.feature"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(build_content(domain, scenario), encoding="utf-8")
    print(f"Feature template generated: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
