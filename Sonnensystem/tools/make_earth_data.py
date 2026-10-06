#!/usr/bin/env python3
"""Erzeugt earth-data.js aus Natural-Earth-Daten (gemeinfrei, naturalearthdata.com).

Aufruf:  python3 tools/make_earth_data.py <ordner mit ne_50m_*.geojson>
Benötigt: ne_50m_land.geojson, ne_50m_lakes.geojson, ne_50m_glaciated_areas.geojson
(z. B. von github.com/nvkelso/natural-earth-vector/tree/master/geojson)

Format: je Ebene ein Base64-String aus Varints. Pro Ring: Punktanzahl, danach
Zickzack-kodierte Differenzen von Länge/Breite in 0,1°-Schritten.
"""
import base64, json, math, os, sys

TOL = 0.12  # Douglas-Peucker-Toleranz in Grad


def rings(path, min_area, keep=lambda props: True):
    data = json.load(open(path))
    for ft in data['features']:
        if not keep(ft['properties']):
            continue
        g = ft['geometry']
        polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
        for poly in polys:
            for ring in poly:
                if abs(area(ring)) >= min_area:
                    yield ring


def area(r):
    return 0.5 * sum(r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1] for i in range(len(r) - 1))


def dp(pts, tol):
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = pts[a]; bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        L = math.hypot(dx, dy)
        best, bi = 0, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            d = abs(dy * (px - ax) - dx * (py - ay)) / L if L else math.hypot(px - ax, py - ay)
            if d > best:
                best, bi = d, i
        if best > tol:
            keep[bi] = True
            stack += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]


def varint(n, out):
    while True:
        b = n & 0x7F
        n >>= 7
        if n:
            out.append(b | 0x80)
        else:
            out.append(b)
            return


def encode(rs):
    out = bytearray()
    count = pts_total = 0
    for r in rs:
        q = []
        for lon, lat in dp(r, TOL):
            p = (round(lon * 10), round(lat * 10))
            if not q or p != q[-1]:
                q.append(p)
        if len(q) < 4:
            continue
        varint(len(q), out)
        px = py = 0
        for x, y in q:
            for d in (x - px, y - py):
                varint((d << 1) ^ (d >> 63) if d < 0 else d << 1, out)
            px, py = x, y
        count += 1
        pts_total += len(q)
    print(f'  {count} Ringe, {pts_total} Punkte, {len(out)} Bytes', file=sys.stderr)
    return base64.b64encode(bytes(out)).decode()


def main(src):
    f = lambda n: os.path.join(src, n)
    layers = {
        'land': encode(rings(f('ne_50m_land.geojson'), 0.02)),
        'lakes': encode(rings(f('ne_50m_lakes.geojson'), 0.3)),
        'ice': encode(rings(f('ne_50m_glaciated_areas.geojson'), 0.05)),
    }
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    with open(os.path.join(here, 'earth-data.js'), 'w') as fh:
        fh.write('// Küstenlinien, Seen und Gletscher der Erde – erzeugt mit tools/make_earth_data.py\n')
        fh.write('// Quelle: Natural Earth (naturalearthdata.com), gemeinfrei (Public Domain).\n')
        fh.write('window.EARTH_DATA = ' + json.dumps(layers, indent=1) + ';\n')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '.')
