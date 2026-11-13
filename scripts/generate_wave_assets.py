"""Regenerate FishMate's 3 transparent, seamless flowing-ocean assets.

This file is only needed when changing the artwork. The Expo app itself does NOT
require Python. To regenerate: pip install pillow numpy; python scripts/generate_wave_assets.py

Each exported strip repeats continuously along X. The wave curves use only integer
harmonics of the tile period, ensuring the edges join without a jump.
"""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'fishmate'
W, H = 1280, 600

CONFIGS = [
    # name, base rgb, tint strength, phase, curve amplitude, gradient falloff
    ('ocean-flow-back.png', (113, 190, 207), 29, 0.35, 1.0, 245),
    ('ocean-flow-middle.png', (70, 180, 194), 35, 1.55, 1.06, 223),
    ('ocean-flow-front.png', (67, 173, 195), 36, 2.70, 1.13, 215),
]

x = np.arange(W, dtype=np.float32)[None, :]
y = np.arange(H, dtype=np.float32)[:, None]
a = 2 * np.pi * x / (W - 1)  # Match the first and last raster columns exactly.

for filename, rgb, strength, phase, amplitude, falloff in CONFIGS:
    # Periodic top edge with smooth matching slope and brightness at both ends.
    crest = (95 + amplitude * (42 * np.sin(a + phase) +
              13 * np.sin(2 * a - phase * 0.51) +
               8 * np.cos(3 * a + phase * 0.67)))
    d = y - crest
    inside = (d >= 0).astype(np.float32)
    # Soft translucent body that vanishes gracefully far below the wave crest.
    wash = inside * strength * np.exp(-np.maximum(d, 0) / falloff)
    # White-blue specular crest edge; narrow enough to look like a fluid surface.
    crest_edge = 48 * np.exp(-np.square(d / 4.0))
    crest_haze = 13 * np.exp(-np.square((d - 13) / 21.0))
    # Subsurface translucent curls following a different periodic harmonic.
    curl_position = 96 + 20 * np.sin(2 * a + phase * 1.21)
    curl = 13 * np.exp(-np.square((d - curl_position) / 23))
    curl2_position = 173 + 14 * np.sin(a - phase * 0.85)
    curl2 = 7 * np.exp(-np.square((d - curl2_position) / 31))
    alpha = np.clip(wash + crest_edge + crest_haze + curl + curl2, 0, 95)
    # Anti-aliased crest transition (rather than an abrupt 1px edge).
    alpha *= np.clip((d + 2.0) / 4.0, 0, 1)
    # Transparent lower edge; welcome text remains legible.
    alpha *= np.clip((H - y) / 170.0, 0, 1)

    # Very faint cyan highlights inside the crest, without visual noise.
    highlight = np.exp(-np.square(d / 11.0))
    out = np.zeros((H, W, 4), dtype=np.uint8)
    for channel, base in enumerate(rgb):
        out[..., channel] = np.uint8(np.clip(base + highlight * (230 - base) * 0.57, 0, 255))
    out[..., 3] = alpha.astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(OUT / filename, optimize=True)
    print(filename, Image.open(OUT / filename).size, (OUT / filename).stat().st_size, 'bytes')
