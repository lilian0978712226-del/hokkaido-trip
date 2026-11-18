import re, pathlib
import os
W = pathlib.Path(__file__).resolve().parent
OUT = pathlib.Path(os.environ.get('TRIP_BUILD','/tmp/tripbuild')); OUT.mkdir(parents=True,exist_ok=True)
TD=pathlib.Path(os.environ['TRIP_DIR']) if os.environ.get('TRIP_DIR') else None
def F(n):
    return (TD/n) if TD and (TD/n).exists() else (W/n)
h = F('orig.html').read_text(encoding='utf-8')
orig = h

def rep(old, new, count=1):
    global h
    n = h.count(old)
    if n == 0 and os.environ.get('TRIP_LOOSE'):
        print('WARN skipped patch:', old[:70].replace('\n',' ')); return
    assert n >= 1, ('missing', old[:80])
    if count == 1:
        assert n == 1, ('not unique', n, old[:80])
    h = h.replace(old, new)

# meta theme colour + title kept; theme-color updated
rep('<meta content="#EAF6FF" name="theme-color"/>', '<meta content="#FFF8EC" name="theme-color"/>')

# 1. theme stylesheet last in head
css = F('theme.css').read_text(encoding='utf-8')
rep('</style>\n</head>', '</style>\n<style id="snowmaru-storybook">' + css + '</style>\n</head>')

# 2. icon symbols appended into existing defs
sym = F('symbols.svg').read_text(encoding='utf-8')
rep('</defs></svg>\n<header', sym + '\n</defs></svg>\n<header')

def ic(id_, cls='h-ic'):
    return f'<svg class="{cls}" aria-hidden="true" viewBox="0 0 64 64"><use href="#{id_}"></use></svg>'

# 3. header: brand + quick nav
rep('<header class="top"><div class="brand">❄️ 北海道雪日記</div></header>',
    '<header class="top"><div class="brand"><svg aria-hidden="true" viewBox="0 0 80 72"><use href="#i-bird"></use></svg><span>北海道雪日記</span></div>'
    '<nav class="top-nav" aria-label="快速跳轉"><a href="#itinerary">今日行程</a><a href="#flights">航班</a><a href="#weather">天氣</a>'
    '<a href="#food-book">美食</a><a href="#stay">住宿</a><a href="#essentials">租車</a><a href="#checklists">清單</a><a href="#arrival-tax">退稅</a></nav></header>')

# 4. hero illustration replaced (same container classes + role)
s = h.index('<div aria-label="北海道冬季插畫')
e = h.index('</svg></div>', s) + len('</svg></div>')
h = h[:s] + F('hero.svg').read_text(encoding='utf-8') + h[e:]

# hero date chips (keeps original line too)
rep('<p>2027.02.10 — 02.18　｜　9 天 8 夜・雙人自駕</p>',
    '<p>2027.02.10 — 02.18　｜　9 天 8 夜・雙人自駕</p><div class="hero-dates" aria-hidden="true"><span>2027.02.10－02.18 ・ 9天8夜雙人旅行</span></div>')

# countdown icon -> plane svg (text ✈ kept for screen readers? icon is aria-hidden)
rep('<div aria-hidden="true" class="departure-countdown-icon">✈</div>',
    '<div aria-hidden="true" class="departure-countdown-icon">' + '<svg aria-hidden="true" viewBox="0 0 100 100"><use href="#i-enaga"></use></svg>' + '</div>')

# hero quick strip after countdown
rep('<small>2027.02.10 10:20　JX318 台中 → 新千歲</small></div></div>',
    '<small>2027.02.10 10:20　JX318 台中 → 新千歲</small></div></div>'
    '<div class="hero-quick">'
    '<a class="hq-card hq-weather" href="#weather">' + ic('i-weather', '') + '<div><b id="heroWeatherTitle">今日天氣</b><small id="heroWeatherMirror">正在準備天氣資料…</small></div></a>'
    '<a class="hq-card hq-flight" href="#flights">' + ic('i-plane', '') + '<div><b>航班摘要</b><small>去程 2/10 JX318 10:20 台中 RMQ → 新千歲 CTS 15:00<br/>回程 2/18 JX319 16:00 新千歲 CTS → 台中 RMQ 19:55</small></div></a>'
    '</div>')

# shortcut icons
for emo, sid in [('🌤️','i-weather'),('🗓️','i-train'),('🏨','i-house'),('🚗','i-car'),('☑️','i-check'),('🛂','i-passport')]:
    rep(f'<span>{emo}</span><b>', f'<span>{ic(sid, "")}</span><b>')

# 5. section headings with illustrations
rep('<h2 id="todaySectionTitle"><span class="deco">📍</span> 今日行程</h2>', '<h2 id="todaySectionTitle"><span class="deco">📍</span> 今日行程</h2>')
rep('<h2>❄️ 貼心備註</h2>', '<h2>' + ic('i-note') + '貼心備註</h2>')
rep('<h2>🌤️ 天氣與雪況</h2>', '<h2>' + ic('i-weather') + '天氣與雪況</h2>')
rep('<h2>🧭 今日旅行小幫手</h2>', '<h2>' + ic('i-compass') + '今日旅行小幫手</h2>')
rep('<h2>☑️ 出發前待辦 </h2>', '<h2>' + ic('i-letter') + '出發前待辦</h2>')
rep('<h2>🧳 行李清單 </h2>', '<h2>' + ic('i-suitcase') + '行李清單</h2>')
rep('<h2>🏨 住宿資訊</h2>', '<h2>' + ic('i-onsen') + '住宿資訊</h2>')
rep('<h2>📌 重要資訊</h2>', '<h2>' + ic('i-car') + '重要資訊・租車</h2>')
rep('<h2>🛂 入境卡與退稅</h2>', '<h2>' + ic('i-passport') + '入境卡與退稅</h2>')

# 6. flights -> boarding passes (same data)
old_fl = ('<section class="section" id="flights"><h2><span class="deco">✈️</span> 航班小卡</h2><div class="flightgrid"><div class="mini"><small>去程｜2/10</small><strong>JX318</strong><p>台中 RMQ → 新千歲 CTS</p><b>10:20 → 15:00</b></div><div class="mini"><small>回程｜2/18</small><strong>JX319</strong><p>新千歲 CTS → 台中 RMQ</p><b>16:00 → 19:55</b></div></div>')
def pass_(cls, label, fn, a, an, at, b, bn, bt, tag):
    return (f'<article class="pass {cls}" aria-label="{label} {fn} {an} {a} {at} 到 {bn} {b} {bt}"><div class="pass-top"><span>BOARDING PASS</span><small>{label}</small></div>'
            f'<div class="pass-route"><div class="pass-port"><b>{a}</b><small>{an}</small><em>{at}</em></div><div class="pass-path">{ic("i-plane", "")}</div>'
            f'<div class="pass-port"><b>{b}</b><small>{bn}</small><em>{bt}</em></div></div>'
            f'<div class="pass-foot"><span>FLIGHT <b>{fn}</b></span><span class="pass-tag">{tag}</span></div></article>')
new_fl = ('<section class="section" id="flights"><h2>' + ic('i-plane') + '航班小卡</h2><div class="flightgrid boarding">'
          + pass_('', '去程｜2/10', 'JX318', 'RMQ', '台中', '10:20', 'CTS', '新千歲', '15:00', 'HOKKAIDO ♡')
          + pass_('back', '回程｜2/18', 'JX319', 'CTS', '新千歲', '16:00', 'RMQ', '台中', '19:55', 'HOME ♡')
          + '</div>')
rep(old_fl, new_fl)

# 7. food encyclopedia section (built from original days data by script) inserted before stay
rep('<section class="section" id="stay">',
    '<section class="section" id="food-book"><h2>' + ic('f-crab') + '北海道美食圖鑑</h2><p class="muted" id="foodCount">依原行程自動整理</p><div class="food-book" id="foodBook"></div></section>\n<section class="section" id="stay">')

# 8. lodging cards -> cabin cards (same text, same buttons)
for name, icon in [('Hotel Vista Sapporo Odori','i-house'),('Hotel Amanek Asahikawa','i-house'),('第一瀧本館（Dai-ichi Takimotokan）','i-onsen'),('KOKO STAY 千歲','i-house')]:
    rep(f'<div class="card lodging"><div><h3>{name}</h3>', f'<div class="card lodging stay-card">{ic(icon, "stay-ic")}<div><h3>{name}</h3>')

# footer mascot
rep('<div class="footer">', '<div class="footer"><svg aria-hidden="true" viewBox="0 0 80 72"><use href="#i-bird"></use></svg>')

# 9. extra script before </body>
js = F('extra.js').read_text(encoding='utf-8')
rep('</script></body></html>', '</script>\n<script>' + js + '</script></body></html>')

(OUT/'index.html').write_text(h, encoding='utf-8')
print(len(orig), len(h))
