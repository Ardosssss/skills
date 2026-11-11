#!/usr/bin/env python3
"""Baut products.js aus dem oeffentlichen Produkt-Feed des Herstellers.

Aufruf:  python3 build_products.py            (laedt den Feed neu)
         python3 build_products.py feed.json  (nutzt eine gespeicherte Kopie)

Das Ergebnis hat dasselbe Format wie die bisherige products.js
(window.TLZ_DATA = {base, models, items}).
"""
import json, re, sys, time, urllib.request

FEED = 'https://rebago.com/wp-json/wc/store/v1/products?per_page=100&page=%d'
BASE = 'https://rebago.com/wp-content/uploads/'
MAX_IMGS = 8
# Platzhalter, bis die Verkaufspreise feststehen: EUR-Betrag des Herstellers 1:1 als CHF.
PRICE_FACTOR = 1.0

# key: (name, type, cat, feed-category-slugs)
# name: Text = Eigenname; [_, x] = Typbezeichnung (uebersetzt) + Zusatz x ('v_…' wird uebersetzt)
MODELS = {
    'george-xl':   ('George XL', 'rolltop', 'backpacks', ['george-xl']),
    'george-m':    ('George M', 'rolltop', 'backpacks', ['george-m']),
    'george-bike': ('George Bike XL', 'bikebp', 'backpacks', ['george']),
    'david-xs':    ('David XS', 'backpack', 'backpacks', ['david-xs']),
    'david-m':     ('David M', 'backpack', 'backpacks', ['david-m', 'david-m-de']),
    'david-l':     ('David L', 'backpack', 'backpacks', ['david-l']),
    'david-xl':    ('David XL', 'backpack', 'backpacks', ['david-xl']),
    'bob-l':       ('Bob L', 'backpack', 'backpacks', ['bob-daily-backpack-l']),
    'bob-xl':      ('Bob XL', 'backpack', 'backpacks', ['bob-daily-backpack-xl']),
    'bobby':       ('Bobby', 'travelbp', 'backpacks', ['bobby-convertible-travel-backpack']),
    'andy':        ('Andy', 'backpack', 'backpacks', ['andy']),
    'pablo':       ('Pablo', 'shoulder', 'shoulder', ['pablo']),
    'alex':        ('Alex', 'shoulder', 'shoulder', ['alex']),
    'coco':        ('Coco', 'shoulder', 'shoulder', ['coco']),
    'albert':      ('Albert', 'shoulder', 'shoulder', ['albert']),
    'karl':        ('Karl', 'laptopbag', 'shoulder', ['karl']),
    'steve':       ('Steve', 'laptopbag', 'shoulder', ['steve']),
    'sigmund':     ('Sigmund', 'laptopbag', 'shoulder', ['sigmund']),
    'stanley':     ('Stanley', 'messenger', 'shoulder', ['stanley']),
    'charlie':     ('Charlie', 'zipbag', 'shoulder', ['charlie']),
    'harry':       ('Harry', 'zipbag', 'shoulder', ['harry']),
    'miguel':      ('Miguel', 'shoulder', 'shoulder', ['miguel']),
    'crossbody':   (['', ''], 'crossbody', 'shoulder', ['crossbody-bag']),
    'beltbag-l':   (['', 'L'], 'belt', 'hip', ['belt-bag']),
    'beltbag-s':   (['', 'S'], 'belt', 'hip', ['bum-bag']),
    'hipbag-xl':   (['', 'XL'], 'hip', 'hip', ['hip-bag', 'money-belts', 'upcycled-bags']),
    'hipbag-m':    (['', 'M'], 'hip', 'hip', ['hip-bags-m']),
    'shopper':     (['', ''], 'shopper', 'shopper', ['shopper']),
    'jackie-l':    ('Jackie L', 'woven', 'shopper', ['jackie-l', 'jackie']),
    'jackie-m':    ('Jackie M', 'woven', 'shopper', ['jackie-m']),
    'wallet-s':    (['', 'S'], 'wallet', 'wallets', ['wallet-s']),
    'wallet-l':    (['', 'L'], 'wallet', 'wallets', ['wallet-l', 'geldborse-l']),
    'wallet-xl':   (['', 'XL'], 'wallet', 'wallets', ['wallet-xl', 'geldboerse-xl', 'wallets']),
    'wallet-tarp': (['', 'v_tarp'], 'wallet', 'wallets', ['tarp', 'lkw-plane']),
    'wallet-belt': (['', 'v_belt'], 'wallet', 'wallets', ['seat-belt']),
    'wallet-tube': (['', 'v_tube'], 'wallet', 'wallets', ['tube']),
    'wallet-fire': (['', 'v_fire'], 'wallet', 'wallets', ['firehose']),
    'pouch':       (['', ''], 'pouch', 'acc', ['pouch']),
    'keyholder':   (['', ''], 'keyholder', 'acc', ['keyholders']),
    'belt':        (['', ''], 'beltacc', 'acc', ['belts']),
    'pad':         (['', ''], 'pad', 'acc', ['shoulder-pad']),
    'lappo-13':    (['', '13″'], 'sleeve', 'acc', ['lappo-13']),
    'lappo-15':    (['', '15″'], 'sleeve', 'acc', ['lappo-15']),
    'cosmetic':    (['', ''], 'cosmetic', 'acc', ['cosmetic-bags']),
    'pannier':     (['', ''], 'pannier', 'acc', ['panniers']),
}
SLUG2MODEL = {s: k for k, v in MODELS.items() for s in v[3]}
# allgemeine Sammelkategorien zaehlen nur, wenn nichts Genaueres da ist
GENERIC = {'money-belts', 'upcycled-bags', 'wallets', 'jackie', 'x-mas-sale'}

MATS = {'truck cover': 'tarp', 'lkw-plane': 'tarp', 'seat belt': 'belt', 'sicherheitsgurt': 'belt',
        'bicycle innerube': 'biketube', 'fire hose': 'firehose', 'truck innertube': 'trucktube',
        'bicycle tire': 'biketire'}
FAST = {'zip': 'zip', 'reißverschluss': 'zip', 'velcro': 'velcro', 'klettverschluss': 'velcro',
        'snaps': 'snaps', 'druckknöpfe': 'snaps', 'clip': 'clip', 'string': 'string', 'buckle': 'buckle'}
YES = {'yes', 'ja'}


def load(path=None):
    if path:
        return json.load(open(path, encoding='utf-8'))
    out, page = [], 1
    while True:
        req = urllib.request.Request(FEED % page, headers={'User-Agent': 'Mozilla/5.0'})
        chunk = json.load(urllib.request.urlopen(req, timeout=60))
        out += chunk
        if len(chunk) < 100:
            return out
        page += 1
        time.sleep(1)


def attr(p, name):
    for a in p['attributes']:
        if a['name'] == name:
            return [t['name'] for t in a['terms']]
    return []


def img_code(im):
    m = re.match(re.escape(BASE) + r'(.+)\.(\w+)$', im['src'])
    if not m:
        return None
    stem, ext = m.groups()
    sizes = {}
    for url, w in re.findall(r'(\S+) (\d+)w', im.get('srcset') or ''):
        s = re.search(r'-(\d+x\d+)\.\w+$', url)
        if s and url.startswith(BASE + stem + '-'):
            sizes[int(w)] = s.group(1)
    t = re.search(r'-(\d+x\d+)\.\w+$', im.get('thumbnail') or '')
    thumb = t.group(1) if t else sizes.get(300, '')
    mid = sizes.get(600) or sizes.get(768) or sizes.get(1024) or ''
    big = sizes.get(1024) or sizes.get(1536) or sizes.get(768) or ''
    if ext == 'webp' and (thumb, mid, big) == ('300x300', '600x450', '1024x768'):
        return stem
    return '|'.join([stem, ext, thumb, mid, big])


def main():
    feed = load(sys.argv[1] if len(sys.argv) > 1 else None)
    items, used, skipped = [], set(), 0
    for p in feed:
        slugs = [c['slug'] for c in p['categories']]
        cand = [s for s in slugs if s in SLUG2MODEL and s not in GENERIC] or [s for s in slugs if s in SLUG2MODEL]
        if not cand or not p['is_in_stock'] or not p['images']:
            skipped += 1
            continue
        key = SLUG2MODEL[cand[0]]
        nr = re.search(r'(\d+)\s*$', p['sku'] or '')
        price = round(int(p['prices']['regular_price']) / 10 ** p['prices']['currency_minor_unit'] * PRICE_FACTOR)
        a4, lap = attr(p, 'Fits A4'), attr(p, 'Laptop sleeve')
        mats = []
        for x in attr(p, 'Materials'):
            v = MATS.get(x.lower())
            if v and v not in mats:
                mats.append(v)
        fast = []
        for x in attr(p, 'Fastening'):
            v = FAST.get(x.lower())
            if v and v not in fast:
                fast.append(v)
        imgs = [c for c in (img_code(i) for i in p['images'][:MAX_IMGS]) if c]
        if not imgs:
            skipped += 1
            continue
        used.add(key)
        items.append([
            p['id'], key, nr.group(1) if nr else str(p['id']), price, mats,
            ''.join(attr(p, 'Capacity')[:1]),
            (1 if a4[0].lower() in YES else 0) if a4 else -1,
            (1 if lap[0].lower() in YES else 0) if lap else -1,
            fast, ''.join(attr(p, 'Number of pockets')[:1]),
            (p.get('formatted_dimensions') or '').replace(' × ', ' × '), imgs,
        ])
    models = {k: {'name': v[0], 'type': v[1], 'cat': v[2]} for k, v in MODELS.items() if k in used}
    data = {'base': BASE, 'models': models, 'items': items}
    with open('products.js', 'w', encoding='utf-8') as f:
        f.write('/* Erzeugt mit build_products.py aus dem Hersteller-Feed. Preise sind Platzhalter. */\n')
        f.write('window.TLZ_DATA=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(len(items), 'Stück,', len(models), 'Modelle,', skipped, 'übersprungen')


if __name__ == '__main__':
    main()
