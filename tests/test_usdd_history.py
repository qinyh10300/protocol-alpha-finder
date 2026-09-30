"""USDD discovery provenance and adversarial receipt consistency regressions."""
import copy
import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from export_demo_research import export
from research_adapter import ARTIFACTS, ROOT
from usdd_history import DEFAULT_EVIDENCE, EVIDENCE_NAME, SEED_ID, supplement_snapshot, verify_evidence


class UsddHistoryTests(unittest.TestCase):
    def setUp(self):
        self.evidence = json.loads(DEFAULT_EVIDENCE.read_text())
        self.published = json.loads((DEFAULT_EVIDENCE.parent / (SEED_ID + '.json')).read_text())
        self.original = copy.deepcopy(self.published['previousDiscovery'])
        self.original.update(wallets=[], candidates=[], reports=[], activity=[], skills=[], mode='demo', provenance='recorded')

    def test_real_samples_bind_two_senders_to_three_successful_actions(self):
        before = copy.deepcopy(self.evidence)
        records = verify_evidence(self.evidence)
        self.assertEqual(self.evidence, before)
        self.assertEqual([row['wallet'] for row in records], [
            'TFazVprtpsoFXzdbtaJwpcwDp8PrSThVFB',
            'TDNLgniuf5TeYwh5fyGMvoFfeVcmvgWmcy',
            'TFazVprtpsoFXzdbtaJwpcwDp8PrSThVFB',
        ])
        self.assertEqual([(row['role'], row['ilk'], row['auctionId']) for row in records], [
            ('liquidation_trigger', 'TRX-A', 2), ('liquidation_trigger', 'STRX-A', 9), ('auction_purchase', 'TRX-A', 2),
        ])
        # Reward recipients, vault owners and callback contracts are not wallets.
        for row in records:
            self.assertNotEqual(row['wallet'], row['vault'])
            self.assertNotEqual(row['wallet'], row['arguments'].get('keeperRewardRecipient'))

    def test_hash_mismatch_rejected(self):
        self.evidence['transactions'][0]['transaction']['raw_data_hex'] += '00'
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            verify_evidence(self.evidence)

    def test_changed_json_sender_rejected_even_when_original_raw_hash_matches(self):
        self.evidence['transactions'][0]['transaction']['raw_data']['contract'][0]['parameter']['value']['owner_address'] = 'TDNLgniuf5TeYwh5fyGMvoFfeVcmvgWmcy'
        with self.assertRaisesRegex(ValueError, 'raw sender mismatch'):
            verify_evidence(self.evidence)

    def test_failed_receipt_and_misattributed_receipt_rejected(self):
        for field, value, message in [('result', 'REVERT', 'receipt was not successful'), ('id', '00' * 32, 'receipt transaction id mismatch')]:
            with self.subTest(field=field):
                evidence = copy.deepcopy(self.evidence)
                receipt = evidence['transactions'][0]['receipt']
                if field == 'result':
                    receipt['receipt'][field] = value
                else:
                    receipt[field] = value
                with self.assertRaisesRegex(ValueError, message):
                    verify_evidence(evidence)

    def test_wrong_event_recipient_auction_contract_and_ilk_rejected(self):
        # These mutations retain the real tx hash and successful receipt result.
        changes = [
            (0, 3, 'topics', 3, '00' * 12 + '11' * 20, 'Kick recipient mismatch'),
            (0, 3, 'topics', 1, '00' * 31 + '03', 'auction mismatch'),
            (0, 3, 'address', None, 'TCwYKcDj8c5Te9hjj3UokcxhpY6skFoXnG', 'event contract mismatch'),
            (0, 4, 'topics', 1, 'STRX-A'.encode().hex().ljust(64, '0'), 'ilk or urn mismatch'),
            (0, 4, 'topics', 2, '00' * 12 + '11' * 20, 'ilk or urn mismatch'),
            (2, 26, 'topics', 1, '00' * 31 + '03', 'Take auction mismatch'),
            (2, 26, 'topics', 2, '00' * 12 + '11' * 20, 'no matching verified auction'),
            (2, 24, 'topics', 1, 'STRX-A'.encode().hex().ljust(64, '0'), 'Digs ilk mismatch'),
        ]
        for sample, log, field, index, value, message in changes:
            with self.subTest(sample=sample, log=log, field=field, index=index):
                evidence = copy.deepcopy(self.evidence)
                changed = evidence['transactions'][sample]['receipt']['log'][log]
                if index is None:
                    changed[field] = value
                else:
                    changed[field][index] = value
                with self.assertRaisesRegex(ValueError, message):
                    verify_evidence(evidence)

    def test_unknown_call_method_rejected_after_hash_is_recomputed(self):
        sample = self.evidence['transactions'][0]
        tx = sample['transaction']
        call = tx['raw_data']['contract'][0]['parameter']['value']
        old, new = call['data'], '12345678' + call['data'][8:]
        tx['raw_data_hex'] = tx['raw_data_hex'].replace(old, new)
        call['data'] = new
        tx['txID'] = hashlib.sha256(bytes.fromhex(tx['raw_data_hex'])).hexdigest()
        sample['receipt']['id'] = tx['txID']
        with self.assertRaisesRegex(ValueError, 'Dog method mismatch'):
            verify_evidence(self.evidence)

    def test_supplement_has_no_invented_wallet_history_or_candidates(self):
        result = supplement_snapshot(self.original)
        self.assertEqual(result, self.published)
        self.assertEqual([result['run'][key] for key in ['walletCount', 'candidateCount', 'reportCount', 'loadedTransactionCount']], [2, 0, 0, 0])
        self.assertEqual(result['candidates'], [])
        self.assertEqual(result['reports'], [])
        self.assertEqual(result['run']['status'], 'completed')
        for wallet in result['wallets']:
            self.assertEqual(wallet['candidateIds'], [])
            self.assertEqual(wallet['historyJob'], {'status': 'queued'})
            self.assertEqual(wallet['analysisJob'], {'status': 'queued'})
            self.assertEqual(wallet['alphaSearchJob'], {'status': 'queued'})
            self.assertEqual({ref['type'] for ref in wallet['evidenceRefs']}, {'transaction', 'contract', 'document'})
        self.assertEqual([skill['id'] for skill in result['skills']], ['alpha-seed-wallets'])
        self.assertEqual(result['skills'][0]['completedAt'], self.evidence['verifiedAt'])
        self.assertEqual(result['window'], {'from': '2026-04-29T18:01:39+00:00', 'to': '2026-06-11T18:35:48+00:00'})
        self.assertEqual(result['previousDiscovery'], self.published['previousDiscovery'])
        self.assertEqual(result['previousDiscovery']['run']['walletCount'], 0)
        self.assertTrue(result['previousDiscovery']['window']['from'].startswith('2026-07-01'))
        self.assertFalse(result['discoveryScope']['fullWalletHistoriesLoaded'])
        self.assertFalse(result['discoveryScope']['exhaustive'])
        self.assertEqual(result['sourceArtifacts'][0]['sha256'], hashlib.sha256(DEFAULT_EVIDENCE.read_bytes()).hexdigest())

    def test_missing_evidence_other_seeds_and_future_research_are_preserved(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertIs(supplement_snapshot(self.original, Path(tmp) / 'absent.json'), self.original)
        future = copy.deepcopy(self.original)
        future['wallets'] = [{'address': 'future-collected-wallet', 'historyJob': {'status': 'completed', 'txCount': 100}}]
        future['run']['walletCount'] = 1
        self.assertIs(supplement_snapshot(future), future)
        other = copy.deepcopy(self.original)
        other['run']['seedId'] = 'energy-rental-liquidation'
        self.assertIs(supplement_snapshot(other), other)

    def test_public_bundle_contains_no_local_paths_or_request_headers(self):
        serialized = DEFAULT_EVIDENCE.read_text()
        for private_marker in ['/tmp/', '/Users/', 'headers', 'API_KEY', 'Authorization']:
            self.assertNotIn(private_marker, serialized)

    @unittest.skipUnless((ROOT / 'data' / ARTIFACTS['discovery']).exists(), 'Local research artifacts not installed')
    def test_export_is_repeatable_and_leaves_other_seed_exports_unchanged(self):
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp)
            export(ROOT / 'data', output)
            first = {item.name: item.read_bytes() for item in output.iterdir()}
            export(ROOT / 'data', output)
            self.assertEqual(first, {item.name: item.read_bytes() for item in output.iterdir()})
            for seed_id in ['energy-rental-liquidation', 'justlend-lending-liquidation']:
                self.assertEqual(first[seed_id + '.json'], (DEFAULT_EVIDENCE.parent / (seed_id + '.json')).read_bytes())
            self.assertEqual(first[EVIDENCE_NAME], DEFAULT_EVIDENCE.read_bytes())
            self.assertEqual(json.loads(first[SEED_ID + '.json']), self.published)


if __name__ == '__main__':
    unittest.main()
