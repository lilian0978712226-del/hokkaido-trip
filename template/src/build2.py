import pathlib,re
import os
W=pathlib.Path(__file__).resolve().parent
OUT=pathlib.Path(os.environ.get('TRIP_BUILD','/tmp/tripbuild')); OUT.mkdir(parents=True,exist_ok=True)
TD=pathlib.Path(os.environ['TRIP_DIR']) if os.environ.get('TRIP_DIR') else None
def F(n):
    return (TD/n) if TD and (TD/n).exists() else (W/n)
h=(OUT/'index.html').read_text(encoding='utf-8')
def rep(old,new):
    global h
    n=h.count(old)
    if n==0 and os.environ.get('TRIP_LOOSE'):
        print('WARN skipped patch:',old[:70].replace('\n',' ')); return
    assert n==1,(n,old[:90]); h=h.replace(old,new)
def ic(i,c=''): return f'<svg class="{c}" aria-hidden="true" viewBox="0 0 64 64"><use href="#{i}"></use></svg>'
# fonts: second source for Huninn (jsDelivr / Fontsource), non-blocking
rep('<link href="https://fonts.googleapis.com/css2?family=Huninn&amp;display=swap" rel="stylesheet"/>',
    '<link href="https://fonts.googleapis.com/css2?family=Huninn&amp;display=swap" rel="stylesheet"/><link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin=""/><link href="https://cdn.jsdelivr.net/npm/@fontsource/huninn@5/index.css" rel="stylesheet" media="print" onload="this.media=\'all\'"/>')
# css + symbols
rep('</style>\n</head>','</style>\n<style id="snowmaru-v2">'+F('v2.css').read_text(encoding='utf-8')+'</style>\n</head>')
rep('</defs></svg>\n<header',F('v2_symbols.svg').read_text(encoding='utf-8')+'</defs></svg>\n<header')
# top nav
s=h.index('<nav class="top-nav"'); e=h.index('</nav>',s)+6
h=h[:s]+'<nav class="top-nav" aria-label="快速跳轉"><a href="#itinerary">行程</a><a href="#ledger">記帳</a><a href="#flights">航班</a><a href="#weather">天氣</a><a href="#food-book">美食</a><a href="#stay">住宿</a><a href="#essentials">租車</a><a href="#checklists">清單</a><a href="#arrival-tax">退稅</a></nav>'+h[e:]
# hero: replace quick cards with slim weather line + STARLUX passes (moved from the flights section)
s=h.index('<section class="section" id="flights">'); e=h.index('</section>',s)+10
fl=h[s:e]; h=h[:s]+h[e:]
g0=fl.index('<div class="flightgrid boarding">'); g1=fl.rindex('</div><p class="muted">')+6
grid=fl[g0:g1]
note=re.search(r'<p class="muted">(.*?)</p>',fl).group(1)
grid=grid.replace('<span>BOARDING PASS</span>','<span class="sx">'+ic('i-plane')+'STARLUX 星宇航空</span>')
s=h.index('<div class="hero-quick">'); e=h.index('</a></div>',s)+10
h=h[:s]+('<div id="flights">'+grid+'<p class="flight-note">'+note+'</p></div>')+h[e:]
# shortcut: weather -> ledger
s=h.index('<a href="#weather"><span>'); e=h.index('</a>',s)+4
h=h[:s]+'<a href="#ledger"><span>'+ic('i-wallet')+'</span><b>記帳預算</b><small>隨手記一筆</small></a>'+h[e:]
# ledger section right after itinerary/care-notes (before weather)
rep('<section class="section" id="weather">','<section class="section" id="ledger"><h2>'+ic('i-wallet','h-ic')+'記帳・預算</h2><div class="card ledger-card" id="ledgerApp"></div></section>\n<section class="section" id="weather">')
# shorter headings
rep('今日旅行小幫手</h2>','旅行小幫手</h2>')
rep('北海道美食圖鑑</h2>','北海道美食街</h2>')
# bottom nav: notes -> ledger
rep("<button onclick=\"document.getElementById('care-notes').scrollIntoView()\">📘 貼心備註</button>","<button onclick=\"document.getElementById('ledger').scrollIntoView()\">💰 記帳</button>")
# final itinerary data (confirmed Funliday plan)
a0=h.index('const days=');b0=h.index('const prep=')
h=h[:a0]+F('data.js').read_text(encoding='utf-8')+h[b0:]
h=h.replace("['德壽','焼肉','成吉思汗','Parfaiteria','鱗友','六花亭','LeTAO','北菓樓','Cafe BAAL','湯咖哩','可麗餅','Maruhira','居酒屋','牛乳','牧場']","['德壽','焼肉','一蘭','檍','だんご','成吉思汗','Parfaiteria','鱗友','茶和','六花亭','北菓樓','BaaL','Shinobure','湯咖哩','Enikaitamochi','可麗餅','禪','牧場','酪農場','文字燒','天金','白老牛','Lake Hill','海膽']")
h=h.replace("['小樽水族館','美瑛聖誕樹','白鬚瀑布','青池','小樽運河遊船','旭川市旭山動物園','藻岩山纜車','北海道神宮','滝野すずらん丘陵公園 Snow World']","['小樽水族館','美瑛聖誕樹','白鬚瀑布','青池','小樽運河遊船','旭川市旭山動物園','藻岩山纜車','北海道神宮','滝野すずらん丘陵公園 Snow World','大通雪祭','鱗友朝市','有珠山纜車','登別地獄谷','森林精靈露台']")
h=h.replace("e[1].includes('飯店')||e[1].includes('館')&&e[1].includes('瀧本')?'住宿'","/Hotel|STAY|飯店/.test(e[1])||e[1].includes('館')&&e[1].includes('瀧本')?'住宿'")
h=h.replace("i===0&&j===0||e[1].includes('機場')?'交通／航班'","i===0&&j===0||e[1].includes('機場')||e[1].includes('租車')?'交通／航班'")
h=h.replace('<p class="muted">登別溫泉｜2/16–2/17（依目前行程推定，請以訂房確認單為準）</p>','<p class="muted">登別溫泉｜2/16–2/17</p>')
# v2 script
rep('</script></body></html>','</script>\n<script>'+F('v2.js').read_text(encoding='utf-8')+'</script>\n<script>'+F('v5.js').read_text(encoding='utf-8')+'</script>\n<script>'+F('v6.js').read_text(encoding='utf-8')+'</script>\n<script>'+F('v7.js').read_text(encoding='utf-8')+'</script>\n<script>'+F('v8.js').read_text(encoding='utf-8')+'</script>\n<script>'+F('v9.js').read_text(encoding='utf-8')+'</script>\n<script>'+F('v10.js').read_text(encoding='utf-8')+'</script>\n<script>'+F('v11.js').read_text(encoding='utf-8')+'</script>\n<script>'+F('v12.js').read_text(encoding='utf-8')+'</script>\n<script>'+F('v13.js').read_text(encoding='utf-8')+'</script></body></html>')
rep('</style>\n</head>','</style>\n<style id="v5">'+F('v5.css').read_text(encoding='utf-8')+F('v6.css').read_text(encoding='utf-8')+F('v7.css').read_text(encoding='utf-8')+F('v8.css').read_text(encoding='utf-8')+F('v10.css').read_text(encoding='utf-8')+F('v11.css').read_text(encoding='utf-8')+F('v12.css').read_text(encoding='utf-8')+F('v13.css').read_text(encoding='utf-8')+'</style>\n</head>')
import sys;sys.path.insert(0,str(W));from soften import soften
# soften only our design layer (everything outside the original <script> data)
s0=h.index('<script>\nconst days=') if '<script>\nconst days=' in h else h.index('<script>')
e0=h.index('</script>',s0)
h=soften(h[:s0])+h[s0:e0]+soften(h[e0:])
h=h.replace('やまぎき','やまざき')
h=h.replace("navigator.serviceWorker.register('./sw.js')","navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>{r.update();return r;})")
(OUT/'index2.html').write_text(h,encoding='utf-8'); print(len(h))
