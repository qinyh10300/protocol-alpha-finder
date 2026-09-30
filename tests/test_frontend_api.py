"""Contract tests for real-artifact normalization and evidence boundaries."""
import copy
from http.client import HTTPConnection
from http.server import ThreadingHTTPServer
import json
import sys
import tempfile
import threading
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from research_adapter import normalize, outcome_for, ARTIFACTS, ROOT
import serve_research


class ReplayPlanHttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), serve_research.Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=5)

    def get_json(self, path):
        connection = HTTPConnection(*self.server.server_address, timeout=5)
        try:
            connection.request('GET', path)
            response = connection.getresponse()
            return response.status, dict(response.getheaders()), json.loads(response.read())
        finally:
            connection.close()

    def test_get_usdd_replay_plan_returns_exact_public_plan(self):
        status, headers, plan = self.get_json('/api/replay-plans/usdd-keeper-auction')
        self.assertEqual(status, 200)
        self.assertEqual(headers['Content-Type'], 'application/json; charset=utf-8')
        self.assertEqual(headers['Cache-Control'], 'no-store')
        self.assertEqual(plan, {
            'schemaVersion': 1,
            'seedId': 'usdd-keeper-auction',
            'kind': 'illustrative_progress',
            'durationSeconds': 17,
            'walletStaggerSeconds': 0.7,
            'stages': [
                {'job': 'historyJob', 'start': 1, 'end': 4},
                {'job': 'analysisJob', 'start': 4, 'end': 6},
                {'job': 'alphaSearchJob', 'start': 6, 'end': 9},
            ],
            'note': 'USDD replay · Stage progress is illustrative. Wallets and transaction evidence are recorded.',
        })
        self.assertEqual(plan, json.loads((ROOT / serve_research.REPLAY_PLANS['usdd-keeper-auction']).read_text()))

    def test_replay_plan_reads_current_public_source_without_a_build(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / serve_research.REPLAY_PLANS['usdd-keeper-auction']
            source.parent.mkdir(parents=True)
            built = root / 'dist/replay/usdd-keeper-auction.json'
            built.parent.mkdir(parents=True)
            built.write_text(json.dumps({'note': 'stale built plan'}))
            with patch.object(serve_research, 'ROOT', root):
                for note in ['first saved plan', 'updated saved plan']:
                    source.write_text(json.dumps({'note': note}))
                    status, _, plan = self.get_json('/api/replay-plans/usdd-keeper-auction')
                    self.assertEqual(status, 200)
                    self.assertEqual(plan, {'note': note})

    def test_unknown_replay_plans_and_traversal_return_not_found(self):
        for path in [
            '/api/replay-plans',
            '/api/replay-plans/',
            '/api/replay-plans/unknown',
            '/api/replay-plans/energy-rental-liquidation',
            '/api/replay-plans/usdd-keeper-auction/extra',
            '/api/replay-plans/usdd-keeper-auction/',
            '/api/replay-plans/../research/usdd-keeper-auction.json',
            '/api/replay-plans/%2e%2e%2fresearch%2fusdd-keeper-auction.json',
            '/api/replay-plans/%252e%252e%252fresearch%252fusdd-keeper-auction.json',
        ]:
            with self.subTest(path=path):
                status, _, response = self.get_json(path)
                self.assertEqual(status, 404)
                self.assertIn('error', response)

    def test_replay_plan_does_not_mutate_published_research(self):
        source = ROOT / 'frontend/public/research/usdd-keeper-auction.json'
        before = source.read_bytes()
        self.assertEqual(self.get_json('/api/replay-plans/usdd-keeper-auction')[0], 200)
        self.assertEqual(source.read_bytes(), before)
        research = json.loads(before)
        self.assertEqual(research['run']['loadedTransactionCount'], 0)
        self.assertEqual(research['candidates'], [])
        self.assertEqual(research['reports'], [])
        for wallet in research['wallets']:
            for job in ['historyJob', 'analysisJob', 'alphaSearchJob']:
                self.assertEqual(wallet[job]['status'], 'queued')
            self.assertNotIn('txCount', wallet['historyJob'])

    @unittest.skipUnless((ROOT / 'data' / ARTIFACTS['discovery']).exists(), 'Local research artifacts not installed')
    def test_replay_plan_does_not_change_original_archive_response(self):
        endpoint = '/api/research-runs/local-usdd-keeper-auction/snapshot'
        status, _, before = self.get_json(endpoint)
        self.assertEqual(status, 200)
        self.assertEqual(self.get_json('/api/replay-plans/usdd-keeper-auction')[0], 200)
        status, _, after = self.get_json(endpoint)
        self.assertEqual(status, 200)
        self.assertEqual(after, before)
        self.assertEqual(after['wallets'], [])
        self.assertEqual(after['candidates'], [])
        self.assertEqual(after['reports'], [])


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
