from pathlib import Path
import re,sys
root=Path(__file__).resolve().parents[1]
forbidden_patterns=[r'(?i)password\s*[:=]',r'(?i)api[_-]?key\s*[:=]',r'(?i)bearer\s+[a-z0-9._-]{20,}',r'@cronos\.be',r'@belnet\.be']
scan=[]
for p in root.rglob('*'):
    if not p.is_file() or '.git' in p.parts or p.suffix.lower() in {'.png','.webp','.jpg','.jpeg','.xlsx','.zip'}: continue
    try: text=p.read_text(encoding='utf-8')
    except Exception: continue
    for pattern in forbidden_patterns:
        if re.search(pattern,text): scan.append(f'{p.relative_to(root)} matches {pattern}')
for item in scan: print('FAIL',item)
if scan: sys.exit(1)
print('PASS public repository hygiene')
