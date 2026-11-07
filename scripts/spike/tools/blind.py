# usage: python3 blind.py <outdir> <key.json> <seed> path...  -> copies shots under shuffled neutral names, writes the key
import sys, json, random, shutil, os
out, key, seed, paths = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4:]
os.makedirs(out, exist_ok=True)
rng = random.Random(seed)
order = paths[:]; rng.shuffle(order)
mapping = {}
for i, p in enumerate(order, 1):
    name = f'shot-{i:02d}.png'
    shutil.copy(p, os.path.join(out, name))
    mapping[name] = os.path.basename(p)
json.dump(mapping, open(key, 'w'), indent=1)
print(len(mapping), 'shots ->', out)
