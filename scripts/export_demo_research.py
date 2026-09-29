"""Publish normalized JustLend/USDD evidence for the static demo, without raw API dumps.

Usage: python3 scripts/export_demo_research.py --data-root /path/to/data
The frontend build consumes the checked-in exports; it never needs local data/.
"""
import argparse
import hashlib
import json
from pathlib import Path

from research_adapter import ARTIFACTS, ROOT, normalize

SEEDS = ('justlend-lending-liquidation', 'usdd-keeper-auction')
NOTE = 'Recorded research replay · Saved Skill evidence; see the recorded window and report check times. Playback timing is simulated; no new on-chain search is performed.'


def omit_nulls(value):
    if isinstance(value, dict):
        return {key: omit_nulls(item) for key, item in value.items() if item is not None}
    if isinstance(value, list):
        return [omit_nulls(item) for item in value]
    return value


def export(root, output):
    output.mkdir(parents=True, exist_ok=True)
    for seed_id in SEEDS:
        snapshot = normalize(root, seed_id)
        source = f'./research/{seed_id}.json'
        snapshot['mode'] = 'demo'
        snapshot['provenance'] = 'recorded'
        snapshot['note'] = NOTE
        snapshot['seeds'] = [s for s in snapshot['seeds'] if s['id'] == seed_id]
        snapshot['sourceArtifacts'] = [
            {'path': ARTIFACTS[key], 'sha256': hashlib.sha256((root / ARTIFACTS[key]).read_bytes()).hexdigest()}
            for key in ('seed', 'history', 'investigation', 'validation', 'discovery')
            if (root / ARTIFACTS[key]).exists()
        ]
        for report in snapshot['reports']:
            report['provenance'] = 'recorded'
            report['evidenceRefs'] = [e for e in report['evidenceRefs'] if not e.get('url', '').startswith('/api/')]
            report['evidenceRefs'].append({'type': 'document', 'title': 'Published Skill snapshot', 'url': source})
        for event in snapshot['activity']:
            event['sourceUrl'] = source
            if event['eventType'] == 'seed_scan':
                event['message'] = snapshot['seeds'][0]['coverage']
        # Orchestration summaries refer to the original three-seed run. Present
        # only this seed's evidence and avoid attributing other seeds' work to it.
        snapshot['activity'] = [e for e in snapshot['activity'] if e['eventType'] != 'research_completed']
        snapshot['skills'] = [s for s in snapshot['skills'] if s['id'] != 'protocol-alpha-discovery']
        summaries = {
            'alpha-seed-wallets': snapshot['seeds'][0]['coverage'],
            'wallet-alpha-investigation': f"{len(snapshot['wallets'])} histories · {snapshot['run']['loadedTransactionCount']:,} primary transactions · {len(snapshot['candidates'])} candidates",
            'protocol-alpha-validation': f"{len(snapshot['reports'])} saved assessments · mechanism, history, current state and execution conditions",
        }
        if not snapshot['wallets']:
            snapshot['skills'] = [s for s in snapshot['skills'] if s['id'] == 'alpha-seed-wallets']
        for skill in snapshot['skills']:
            skill['summary'] = summaries[skill['id']]
            skill['sourceUrl'] = f"https://github.com/qinyh10300/protocol-alpha-finder/blob/main/skills/{skill['id']}/SKILL.md"
            skill['artifactUrl'] = source
        (output / f'{seed_id}.json').write_text(json.dumps(omit_nulls(snapshot), ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-root', type=Path, default=ROOT / 'data')
    parser.add_argument('--output', type=Path, default=ROOT / 'frontend/public/research')
    args = parser.parse_args()
    export(args.data_root, args.output)
