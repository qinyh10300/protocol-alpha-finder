"""Small dependency-free SVG helper shared by the project diagrams."""
from html import escape

PALETTE = [('#eff5ff', '#c8daf8', '#2563b8'), ('#f5f1fc', '#ded2f2', '#7953ad'), ('#fff7ed', '#f1dcc2', '#a8661e'), ('#eef8f4', '#c9e5d9', '#20775b')]


class Diagram:
    def __init__(self, width, height, title, description, lang):
        self.width, self.height = width, height
        self.parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc" xml:lang="{lang}">', f'<title id="title">{escape(title)}</title><desc id="desc">{escape(description)}</desc><defs>']
        for i, (_, _, color) in enumerate(PALETTE):
            self.parts.append(f'<marker id="a{i}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M 0 0 L 10 5 L 0 10 L 2.5 5 Z" fill="{color}"/></marker>')
        self.parts.append('''</defs><style>
text { font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif; fill:#24384d; }
.title { font-size:38px; font-weight:700; letter-spacing:-.4px; }
.heading { font-size:23px; font-weight:650; }
.node { font-size:21px; font-weight:600; }
.body { font-size:18px; fill:#526579; }
.small { font-size:16px; fill:#61758a; }
.code { font-family:'SFMono-Regular',Consolas,monospace; font-size:16px; }
.label { font-size:14px; font-weight:650; letter-spacing:1px; fill:#61758a; }
</style>''')
        self.rect(0, 0, width, height, '#ffffff', 'none', 0)

    def text(self, x, y, value, cls='body', anchor='start', color=None):
        style = f' style="fill:{color}"' if color else ''
        self.parts.append(f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}"{style}>{escape(value)}</text>')

    def rect(self, x, y, w, h, fill='#ffffff', stroke='#dce5ef', radius=16):
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="1.3"/>')

    def line(self, x1, y1, x2, y2, color='#e8eef4'):
        self.parts.append(f'<path d="M {x1} {y1} L {x2} {y2}" stroke="{color}" fill="none"/>')

    def arrow(self, x1, y1, x2, y2, color=0, kind='flow', dashed=False, vertical=False):
        if vertical:
            mid = (y1+y2)/2
            d = f'M {x1} {y1} C {x1} {mid} {x2} {mid} {x2} {y2}'
        else:
            mid = (x1+x2)/2
            d = f'M {x1} {y1} C {mid} {y1} {mid} {y2} {x2} {y2}'
        dash = ' stroke-dasharray="5 6"' if dashed else ''
        self.parts.append(f'<path data-kind="{kind}" d="{d}" stroke="{PALETTE[color][2]}" stroke-width="{2 if dashed else 3}" fill="none" stroke-linecap="round" marker-end="url(#a{color})"{dash}/>')

    def save(self, path):
        path.write_text('\n'.join(self.parts)+ '\n</svg>\n')
