import hashlib,json,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from verify_energy_rental import restore_permission
class PermissionIntegrityTests(unittest.TestCase):
 def test_reconstruction_equals_independent_node_response(self):
  samples=json.loads((Path(__file__).parent/'fixtures/permission-samples.json').read_text())
  for sample in samples:
   with self.subTest(txid=sample['txid']):
    restored=restore_permission(sample['indexed_raw_hex'],sample['permission_id'])
    self.assertEqual(restored,sample['node_raw_hex'])
    self.assertEqual(hashlib.sha256(bytes.fromhex(restored)).hexdigest(),sample['txid'])
    self.assertIsNone(restore_permission(sample['node_raw_hex'],2))
if __name__=='__main__':unittest.main()
