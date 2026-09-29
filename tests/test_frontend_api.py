"""Contract tests for real-artifact normalization and evidence boundaries."""
import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from research_adapter import normalize, outcome_for, ARTIFACTS, ROOT


class AdapterTests(unittest.TestCase):
    def test_unproven_cannot_be_actionable(self):
        for state in ['UNCERTAIN', 'ACTIVE', 'EXPIRED']:
            result, reason = outcome_for({'mechanism_assessment': 'unproven', 'current_state': state})
            self.assertEqual(result, 'INSUFFICIENT_EVIDENCE')
            self.assertIn('advantage', reason)

    def test_supported_history_does_not_imply_current_actionability(self):
        result, reason = outcome_for({'mechanism_assessment': 'established', 'current_state': 'UNCERTAIN'})
        self.assertEqual(result, 'MONITOR')
        self.assertIn('not an ACTIVE', reason)

    def test_invalid_seed_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Unknown seed'):
            normalize(seed_id='../secrets')

    def test_missing_files_not_replaced_with_mock(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(FileNotFoundError):
                normalize(Path(tmp))

    def test_seed_only_run_has_pending_jobs(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            path = root / ARTIFACTS['seed']
            path.parent.mkdir(parents=True)
            path.write_text(json.dumps({'run': {'queried_at': '2026-09-29T12:00:00Z', 'requested_window': {'start_utc': '2026-07-01T00:00:00Z', 'end_utc': '2026-09-29T00:00:00Z'}}, 'coverage': [], 'wallets': [{'address': 'test-wallet', 'seed_ids': ['energy-rental-liquidation'], 'evidence': []}]}))
            data = normalize(root)
            self.assertEqual(data['run']['status'], 'paused')
            self.assertEqual(data['wallets'][0]['historyJob']['status'], 'queued')
            self.assertEqual(data['reports'], [])


@unittest.skipUnless((ROOT / 'data' / ARTIFACTS['discovery']).exists(), 'Local research artifacts not installed')
class LocalArtifactTests(unittest.TestCase):
    def test_real_handoff_counts_and_provenance(self):
        data = normalize()
        self.assertEqual([data['run'][k] for k in ['walletCount', 'candidateCount', 'reportCount', 'loadedTransactionCount']], [10, 5, 5, 52582])
        self.assertEqual(len({w['address'] for w in data['wallets']}), 10)
        self.assertEqual({c['id'] for c in data['candidates']}, {r['candidateId'] for r in data['reports']})
        self.assertEqual(sum(r['historicalExecutionCount'] for r in data['reports']), 10)
        self.assertTrue(all(r['rawCurrentState'] == 'UNCERTAIN' for r in data['reports']))
        self.assertEqual(sum(r['outcome'] == 'MONITOR' for r in data['reports']), 3)
        self.assertTrue(all(r['outcome'] != 'ACTIONABLE' for r in data['reports']))
        for report in data['reports']:
            self.assertTrue(report['missingEvidence'])
            self.assertTrue(report['lastCheckedAt'])
            self.assertTrue(any(e['type'] == 'transaction' for e in report['evidenceRefs']))

    def test_seed_filters_preserve_empty_usdd_and_candidate_joins(self):
        usdd = normalize(seed_id='usdd-keeper-auction')
        self.assertEqual(usdd['wallets'], [])
        self.assertTrue(next(s for s in usdd['seeds'] if s['id'] == 'usdd-keeper-auction')['gaps'])
        energy = normalize(seed_id='energy-rental-liquidation')
        self.assertEqual(len(energy['wallets']), 5)
        self.assertEqual(len(energy['reports']), 2)
        self.assertTrue(all(r['outcome'] == 'INSUFFICIENT_EVIDENCE' for r in energy['reports']))
        lending = normalize(seed_id='justlend-lending-liquidation')
        self.assertEqual(len(lending['wallets']), 5)
        self.assertEqual(len(lending['candidates']), 3)

    def test_stale_or_misattributed_validation_fails_visibly(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for key in ['seed', 'history', 'investigation', 'validation', 'discovery']:
                target = root / ARTIFACTS[key]
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes((ROOT / 'data' / ARTIFACTS[key]).read_bytes())
            target = root / ARTIFACTS['validation']
            validation = json.loads(target.read_text())
            bad = copy.deepcopy(validation)
            bad['candidate_results'][0]['wallet'] = 'wrong-wallet'
            target.write_text(json.dumps(bad))
            with self.assertRaisesRegex(ValueError, 'handoff mismatch'):
                normalize(root)
            target.write_text(json.dumps(validation))
            handoff = root / ARTIFACTS['investigation']
            handoff.write_text(handoff.read_text() + '\n')
            with self.assertRaisesRegex(ValueError, 'changed after validation'):
                normalize(root)


if __name__ == '__main__':
    unittest.main()
