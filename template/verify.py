#!/usr/bin/env python3
"""快速檢查建好的網站：python3 template/verify.py <index.html> [截圖資料夾]
檢查：沒有 JS 錯誤、390px 不會橫向捲動、每一天都能切換、記帳／地圖／新增行程都在。"""
import sys, os, pathlib
from playwright.sync_api import sync_playwright
page_file = pathlib.Path(sys.argv[1]).resolve()
shots = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else None
chrome = '/usr/bin/google-chrome' if os.path.exists('/usr/bin/google-chrome') else None
problems = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=chrome, args=['--no-sandbox']) if chrome else p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(page_file.as_uri()); pg.wait_for_timeout(1200)
    n = pg.evaluate('days.length')
    for d in range(n):
        pg.evaluate(f'showDay({d})'); pg.wait_for_timeout(150)
        ev = pg.evaluate("document.querySelectorAll('#dayCard .event:not(.custom-ev)').length")
        if ev != len(pg.evaluate(f'days[{d}].events')): problems.append(f'D{d+1} 卡片數和資料不同')
        if shots:
            shots.mkdir(parents=True, exist_ok=True); pg.query_selector('#dayCard').screenshot(path=str(shots / f'day{d+1}.png'))
        w = pg.evaluate('document.documentElement.scrollWidth')
        if w > 392: problems.append(f'D{d+1} 橫向超出 {w}px')
    for sel in ['#ledgerApp', '#footprints svg', '.cs-add', '#whereNow', '#phrases', '#emergency']:
        if not pg.query_selector(sel): problems.append('缺少 ' + sel)
    if shots:
        for sel, name in [('#footprints', 'map'), ('#ledger', 'ledger')]:
            el = pg.query_selector(sel)
            if el: el.scroll_into_view_if_needed(); pg.wait_for_timeout(900); el.screenshot(path=str(shots / f'{name}.png'))
    problems += ['JS 錯誤：' + e for e in errs]
    b.close()
print('全部通過 ✓' if not problems else '\n'.join(problems))
sys.exit(1 if problems else 0)
