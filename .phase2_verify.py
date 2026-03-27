import json, urllib.request
from backend.utils.knowledge_base import get_collection

BASE='http://127.0.0.1:8010'

def call(m,p,b=None):
    d=None if b is None else json.dumps(b).encode('utf-8')
    req=urllib.request.Request(BASE+p,data=d,headers={'Content-Type':'application/json'},method=m)
    with urllib.request.urlopen(req,timeout=60) as r:
        return json.loads(r.read().decode())

c=call('POST','/conversation/start',{'username':'phase2check'})
cid=c['conversation_id']
call('POST',f'/conversation/{cid}/message',{'content':'After password reset, one enterprise tenant still fails with SSO callback timeout and auth mismatch VX-447.'})
call('POST',f'/agent/conversation/{cid}/reply',{'content':'Clear credential cache, re-import VPN profile, and verify tenant callback mapping.'})
call('POST',f'/conversation/{cid}/message',{'content':'Tried that, still failing for one tenant only.'})
call('POST',f'/agent/conversation/{cid}/reply',{'content':'Rotate tenant auth secret and update callback endpoint to latest URL, then retry.'})
call('POST',f'/agent/conversation/{cid}/resolve')

col=get_collection()
s=col.get(ids=[f'summary_{cid}'])
ch=col.get(ids=[f'chunk_{cid}_1'])
print(json.dumps({'cid':cid,'summary_ids':s.get('ids',[]),'summary_type':(s.get('metadatas') or [{}])[0].get('type') if s.get('ids') else None,'chunk_ids':ch.get('ids',[]),'chunk_type':(ch.get('metadatas') or [{}])[0].get('type') if ch.get('ids') else None}, indent=2))
