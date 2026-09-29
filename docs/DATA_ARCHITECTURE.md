# Database and research data

**English** · [简体中文](DATA_ARCHITECTURE.zh-CN.md) · [Research pipeline](ARCHITECTURE.md)

The project stores collected chain evidence in SQLite and files. Skills save their findings as JSON handoffs; the adapter turns those records into the research workspace and Alpha reports.

![Database and research data](images/data-architecture-en.svg)

## Collection storage

Each collection directory can contain a `research.sqlite3` database with three tables:

| Table | Primary key | Stored data |
| --- | --- | --- |
| `items` | `stream, item_id` | Timestamp, JSON payload, first and last collection run |
| `coverage` | `run, stream, start_ms, end_ms` | Pagination status, pages, rows, new rows, JSON detail |
| `checkpoints` | `stream` | Last completed scan boundary, `through_ms` |

`items` also has an index on `(stream, timestamp)`. Shared stream and run values connect the records logically; the schema declares no foreign keys. A checkpoint advances only after a complete scan. The diagram follows the current collector schema; older archives may still have the former `(run, stream)` coverage key.

Original responses live in `runs/<run>/*.json.gz`, with request metadata, timestamps, and hashes. Receipts and contract information are saved under `evidence/` and `contracts/`.

## Research records

These are JSON files, with links checked by the adapter:

| Record | Artifact | Key relationship |
| --- | --- | --- |
| Strategy wallets | `strategy-wallets.json` | `address`, seed IDs, execution evidence |
| Alpha candidates | `validation-handoff.json` | `candidate_id`, `originating_wallet`, source transactions |
| Validation | `validation-results.json` | Candidate ID, mechanism assessment, current state |
| Research run | `research-record.json` | Run provenance, findings, stopping reason, next checks |

The adapter reads these artifacts rather than querying SQLite. It checks candidate IDs, wallet addresses, source transaction sets, and the handoff hash when supplied. It then assembles a snapshot containing seeds, wallets, candidates, reports, and activity. A report can record an uncertain result or missing evidence.

## Sources and regeneration

[Collector schema](../scripts/collect_energy_rental.py) · [Research adapter](../scripts/research_adapter.py) · [Frontend data types](../frontend/src/types.ts)

```bash
python3 docs/diagrams/render_data_architecture.py
```

The script produces English and Chinese SVGs and Mermaid source files using Python's standard library.
