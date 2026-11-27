#!/usr/bin/env python3
"""精簡版：python3 template/lite/build_lite.py template/trips/hokkaido-2027 → lite/index.html"""
import sys, pathlib
HERE = pathlib.Path(__file__).resolve().parent
TD = pathlib.Path(sys.argv[1]).resolve()
data = (TD/'data.js').read_text(encoding='utf-8')
v2 = (HERE.parent/'src'/'v2.js').read_text(encoding='utf-8')
i = v2.index('const NAV={'); j = v2.index('const CITY=', i); k = v2.index(';', j) + 1
page = (HERE/'page.html').read_text(encoding='utf-8').replace('/*DATA*/', data).replace('/*NAV*/', v2[i:k])
out = HERE.parent.parent/'lite'; out.mkdir(exist_ok=True)
(out/'index.html').write_text(page, encoding='utf-8')
print('OK', out/'index.html', len(page))
