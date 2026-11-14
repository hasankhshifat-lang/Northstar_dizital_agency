"""Short 5 art (pukur-gobhir): reuses the Pilot 5 pond background and props from p5/art.py and adds the
refraction board (fish -> surface -> eye, ray bends away from the normal, apparent fish higher) and the puzzle board."""
import math, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "p5"))
import art as A
from art import svg, T, O, INK

W, H = 1080, 1100
SURF = 520                      # water surface on the board
SP = (560, SURF)                # where the ray leaves the water
FISH = (760, 880)               # real fish (centre)
EYE = (303, 214)                # eye: air ray at 40 deg from the normal (water side 29 deg, n = 1.33)
APP = (760, 758)                # apparent fish: back-extension of the air ray, above the real fish

def _fish(x, y, s=1, ghost=False):
    w = 150 * s; h = w * 0.42
    inner = A.fish(ghost, w).split(">", 1)[1].rsplit("</svg>", 1)[0]
    return f'<g transform="translate({x - w/2:.0f} {y - h/2:.0f})">{inner}</g>'

def board_water():
    b = (f'<rect x="60" y="{SURF}" width="960" height="460" rx="10" fill="#7FC3D8" opacity=".55"/>'
         f'<path d="M60 {SURF} H1020" stroke="#3E8EA6" stroke-width="6"/>'
         f'<rect x="60" y="960" width="960" height="30" fill="#8A6E44" opacity=".6"/>'
         + T(1000, SURF - 18, 46, "বাতাস", "#555", anchor="end") + T(1000, SURF + 60, 46, "পানি", "#1E5AA8", anchor="end")
         + _fish(*FISH, 1.3) + A.eye(*EYE, 1.6))
    return svg(W, H, b)

def ray_water():
    x0, y0 = FISH[0] - 85, FISH[1] - 22
    return svg(W, H, f'<path d="M{x0} {y0} L{SP[0]} {SP[1]}" stroke="#E0A800" stroke-width="8"/>'
                     f'<circle cx="{SP[0]}" cy="{SP[1]}" r="9" fill="#E0A800"/>')

def ray_air():
    dx, dy = EYE[0] - SP[0], EYE[1] - SP[1]; L = math.hypot(dx, dy); ux, uy = dx / L, dy / L
    tx, ty = EYE[0] - ux * 75, EYE[1] - uy * 75
    # arrow head pointing at the eye
    px, py = -uy, ux
    head = f'M{tx:.0f} {ty:.0f} L{tx - ux*34 + px*18:.0f} {ty - uy*34 + py*18:.0f} M{tx:.0f} {ty:.0f} L{tx - ux*34 - px*18:.0f} {ty - uy*34 - py*18:.0f}'
    return svg(W, H, f'<path d="M{SP[0]} {SP[1]} L{tx:.0f} {ty:.0f}" stroke="#E0A800" stroke-width="8"/><path d="{head}" stroke="#E0A800" stroke-width="8" fill="none"/>')

def normal():
    return svg(W, H, f'<path d="M{SP[0]} {SURF - 300} V{SURF + 300}" stroke="#555" stroke-width="4" stroke-dasharray="12 10"/>'
                     + T(SP[0] + 14, SURF - 250, 46, "লম্ব", "#555", anchor="start"))

def apparent():
    return svg(W, H, f'<path d="M{SP[0]} {SP[1]} L{APP[0] - 40} {APP[1] - 48}" stroke="#7A4FB5" stroke-width="6" stroke-dasharray="14 10"/>'
                     + _fish(*APP, 1.3, ghost=True)
                     + f'<path d="M{FISH[0]+120} {FISH[1]} V{APP[1]+8}" stroke="#7A4FB5" stroke-width="5"/><path d="M{FISH[0]+105} {APP[1]+26} l15 -20 l15 20" fill="none" stroke="#7A4FB5" stroke-width="5"/>')

def puzzle_board():
    """Glass of water: a ray comes in from the air; two dashed possibilities, no answer shown."""
    sx, sy = 540, 560
    b = (f'<path d="M260 300 L290 980 L790 980 L820 300" fill="none" stroke="{INK}" stroke-width="7"/>'
         f'<path d="M271 {sy} L809 {sy} L790 980 L290 980Z" fill="#7FC3D8" opacity=".55"/><path d="M271 {sy} H809" stroke="#3E8EA6" stroke-width="6"/>'
         f'<path d="M{sx} {sy-240} V{sy+300}" stroke="#555" stroke-width="4" stroke-dasharray="12 10"/>' + T(sx + 14, sy - 200, 46, "লম্ব", "#555", anchor="start")
         + T(245, sy - 20, 44, "বাতাস", "#555", anchor="end") + T(245, sy + 60, 44, "পানি", "#1E5AA8", anchor="end"))
    return svg(W, H, b)

def puzzle_ray():
    sx, sy = 540, 560
    return svg(W, H, f'<path d="M330 260 L{sx} {sy}" stroke="#E0A800" stroke-width="8"/><path d="M{sx} {sy} l-8 -30 M{sx} {sy} l-28 -14" stroke="#E0A800" stroke-width="7"/>'
                     f'<circle cx="{sx}" cy="{sy}" r="9" fill="#E0A800"/>')

def puzzle_opt(toward):
    sx, sy = 540, 560
    if toward:
        return svg(W, H, f'<path d="M{sx} {sy} L640 900" stroke="#1E5AA8" stroke-width="7" stroke-dasharray="16 12"/>'+ T(655, 945, 54, "ক", "#1E5AA8", "Baloo"))
    return svg(W, H, f'<path d="M{sx} {sy} L800 760" stroke="#D7263D" stroke-width="7" stroke-dasharray="16 12"/>'+ T(760, 720, 54, "খ", "#D7263D", "Baloo"))

def drops():
    return svg(160, 120, "".join(f'<ellipse cx="{x}" cy="{y}" rx="7" ry="11" fill="#E9F7FA" stroke="#5FA6B8" stroke-width="2.5"/>' for x, y in ((20, 30), (60, 70), (100, 20), (140, 80), (80, 105))))
