# Data Layout

Place environment-specific Excel datasets under:

- `testdata/local/<feature>/*.xlsx`
- `testdata/qa/<feature>/*.xlsx`
- `testdata/stage/<feature>/*.xlsx`
- `testdata/prod/<feature>/*.xlsx`

Workbook schema requirements:

- First row must contain headers.
- `scenario` is mandatory and must match Cucumber scenario name or `*`.
- Optional columns can be consumed by step definitions (`username`, `password`, `expected_error`, and domain-specific fields).

Template workbooks should be stored in `templates/`.
