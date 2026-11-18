#!/usr/bin/env python3
"""把一趟旅行做成網站。
用法： python3 template/make.py template/trips/<旅行資料夾> [輸出資料夾]
旅行資料夾裡放：trip.json、data.js、orig.html（基底頁），以及任何想覆蓋 src/ 的同名檔（例如 v8.js、hero.svg）。
"""
import os, sys, json, base64, hashlib, subprocess, shutil, pathlib, tempfile
HERE = pathlib.Path(__file__).resolve().parent
TD = pathlib.Path(sys.argv[1]).resolve()
cfg = json.loads((TD/'trip.json').read_text(encoding='utf-8'))
out = pathlib.Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else (HERE.parent/cfg.get('publish_path','.')).resolve()
tmp = pathlib.Path(tempfile.mkdtemp())
env = dict(os.environ, TRIP_DIR=str(TD), TRIP_BUILD=str(tmp))
if cfg.get('loose'): env['TRIP_LOOSE'] = '1'
for step in ['build.py', 'build2.py']:
    script = TD/step if (TD/step).exists() else HERE/'src'/step
    subprocess.run([sys.executable, str(script)], env=env, check=True, cwd=str(HERE/'src'))
h = (tmp/'index2.html').read_text(encoding='utf-8')
A = lambda n: (TD/'assets'/n) if (TD/'assets'/n).exists() else (HERE/'assets'/n)
b64 = lambda n: base64.b64encode(A(n).read_bytes()).decode()
old = '<link href="apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180"/><link href="favicon-32.png" rel="icon" sizes="32x32" type="image/png"/>'
if old in h:
    h = h.replace(old, f'<link href="data:image/png;base64,{b64("apple-touch-icon.png")}" rel="apple-touch-icon" sizes="180x180"/><link href="data:image/png;base64,{b64("favicon-32.png")}" rel="icon" sizes="32x32" type="image/png"/>')
p = cfg.get('storage_prefix', '')
if p:  # 同一個 github.io 網址下的每趟旅行各自存資料，不互相干擾
    shim = ("<script>(function(){var P=%s,S=Storage.prototype,g=S.getItem,s=S.setItem,r=S.removeItem;"
            "S.getItem=function(k){return g.call(this,P+k)};S.setItem=function(k,v){return s.call(this,P+k,v)};"
            "S.removeItem=function(k){return r.call(this,P+k)};})();</script>") % json.dumps(p + ':')
    h = h.replace('<head>', '<head>' + shim, 1)
out.mkdir(parents=True, exist_ok=True)
(out/'index.html').write_text(h, encoding='utf-8')
ver = hashlib.md5(h.encode()).hexdigest()[:8]
sw = A('sw.js').read_text(encoding='utf-8')
import re
sw = re.sub(r"const V='[^']*';", f"const V='{cfg['id']}-{ver}';", sw)
(out/'sw.js').write_text(sw, encoding='utf-8')
for n in ['manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'favicon-32.png']:
    if not (out/n).exists() or (TD/'assets'/n).exists():
        shutil.copy(A(n), out/n)
print('OK', out/'index.html', len(h), 'bytes')
