import json,sys,collections,statistics as st
key=json.load(open(sys.argv[1])); scores=json.load(open(sys.argv[2]))
rows=[]
for s in scores:
    name=key[s['shot']].replace('.png','')
    if name.startswith('G--mockup'):
        _,_,app,moment,*_=name.split('--'); src='mockup'; model=''
        moment='compose' if moment=='ready' else 'result'
    else:
        app,moment,model,seed=name.split('--'); src='produced'
    rows.append((src,app,moment,model,name,s['designed'],s['job']))
for r in sorted(rows): print(f"{r[0]:9}{r[1]:8}{r[2]:8}{r[3]:17}{r[5]:>3}{r[6]:>3}   {r[4]}")
print()
for moment in ['compose','result']:
  for src in ['mockup','produced']:
    sel=[r for r in rows if r[0]==src and r[2]==moment]
    print(f"{moment:8}{src:9} n={len(sel):2} designed={st.mean(r[5] for r in sel):.2f} job={st.mean(r[6] for r in sel):.2f}")
  for app in ['invoice','trip','slides']:
    sel=[r for r in rows if r[0]=='produced' and r[2]==moment and r[1]==app]
    best=max(sel,key=lambda r:r[5]+r[6])
    print(f"   {app:8} mean designed={st.mean(r[5] for r in sel):.2f} job={st.mean(r[6] for r in sel):.2f} | best {best[5]}/{best[6]} {best[3]}")
  for model in sorted({r[3] for r in rows if r[0]=='produced'}):
    sel=[r for r in rows if r[0]=='produced' and r[2]==moment and r[3]==model]
    print(f"   {model:17} designed={st.mean(r[5] for r in sel):.2f} job={st.mean(r[6] for r in sel):.2f}")
