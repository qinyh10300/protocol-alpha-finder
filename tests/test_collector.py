import importlib.util,json,tempfile,unittest
from pathlib import Path
SPEC=importlib.util.spec_from_file_location('collector',Path(__file__).resolve().parents[1]/'scripts/collect_energy_rental.py')
m=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(m)
class CollectionTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.c=m.Collector(self.temp.name)
 def tearDown(self):self.c.db.close();self.temp.cleanup()
 def test_address_matches_known_mainnet_contract(self):
  self.assertEqual(m.address('c60a6f5c81431c97ed01b61698b6853557f3afd4'),m.CONTRACT)
 def test_repeated_transfer_rows_survive_and_rerun_is_idempotent(self):
  row={'transaction_id':'example','block_timestamp':10,'value':'1'}
  self.c.request=lambda *a,**k:{'data':[row,row],'meta':{}}
  self.c.scan('wallet/trc20','/unused',0,20)
  self.assertEqual(len(self.c.rows('wallet/trc20')),2)
  result=self.c.scan('wallet/trc20','/unused',0,20)
  self.assertEqual(len(self.c.rows('wallet/trc20')),2)
  self.assertEqual(result['new'],0)
 def test_failed_page_does_not_advance_checkpoint(self):
  replies=iter([{'data':[{'txID':'a','block_timestamp':10}],'meta':{'links':{'next':'https://api.trongrid.io/next'}}},RuntimeError('rate limit')])
  def request(*a,**k):
   item=next(replies)
   if isinstance(item,Exception):raise item
   return item
  self.c.request=request
  result=self.c.scan('wallet/transactions','/unused',0,20)
  self.assertEqual(result['status'],'partial')
  self.assertEqual(len(self.c.rows('wallet/transactions')),1)
  self.assertIsNone(self.c.db.execute('select * from checkpoints').fetchone())
 def test_completed_prefix_avoids_replaying_obsolete_partial_scan(self):
  self.c.db.execute('INSERT INTO checkpoints VALUES(?,?)',('wallet/transactions',15))
  self.c.db.execute('INSERT INTO coverage VALUES(?,?,?,?,?,?,?,?,?)',(self.c.run,'wallet/transactions',0,20,'partial',1,1,1,json.dumps({'next_url':'https://api.trongrid.io/next'})))
  def unexpected(*a,**k):raise AssertionError('Should use normal checkpoint overlap, not old cursor')
  self.c.request=unexpected
  self.c.resume_partial('wallet/transactions',10)
 def test_raw_log_verification_rejects_mismatched_reward(self):
  event={'transaction_id':'sample','block_number':1,'result':{'liquidator':'0x'+'11'*20,'renter':'0x'+'22'*20,'receiver':'0x'+'33'*20,'amount':'100','resourceType':'1','usageRental':'5','liquidateFee':'20','sendBack':'7'}}
  receipt={'id':'sample','blockNumber':1,'receipt':{'result':'SUCCESS'},'log':[{'address':'c60a6f5c81431c97ed01b61698b6853557f3afd4','topics':[m.LIQUIDATE_TOPIC]+['0'*24+x*20 for x in ['11','22','33']],'data':''.join(f'{x:064x}' for x in [100,1,5,20,7])}]}
  self.assertTrue(m.verify_event_receipt(event,receipt))
  event['result']['liquidateFee']='21'
  with self.assertRaises(ValueError):m.verify_event_receipt(event,receipt)
if __name__=='__main__':unittest.main()
