"""Lightweight SVD pipeline smoke test using a synthetic PNG, no personal data."""
import base64
import io
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image

SCRIPT = Path(__file__).resolve().parents[1] / "WEBSITE/server/python/script.py"


class SvdTests(unittest.TestCase):
    def test_png_to_private_jpeg_artifacts(self):
        image = Image.new("RGB", (12, 8), (100, 70, 20))
        data = io.BytesIO()
        image.save(data, format="PNG")
        png = base64.b64encode(data.getvalue()).decode("ascii")
        payload = {
            "imageBase64Front1": png,
            "imageBase64Front2": png,
            "imageBase64Side": png,
            "uniqueFilenameFront1": "front-1",
            "uniqueFilenameFront2": "front-2",
            "uniqueFilenameSide": "side",
        }
        with tempfile.TemporaryDirectory() as directory:
            subprocess.run(
                [sys.executable, str(SCRIPT), "svd", directory],
                input=json.dumps(payload),
                text=True,
                capture_output=True,
                check=True,
                timeout=30,
            )
            for stem in ("front-1", "front-2", "side"):
                p = Path(directory, f"{stem}.jpg")
                self.assertTrue(p.exists())
                self.assertGreater(p.stat().st_size, 0)
                # The uniform gray level should be preserved, not auto-stretched
                # into a black/white artifact by the image writer.
                with Image.open(p) as result:
                    pixels = list(result.convert("L").tobytes())
                    self.assertLess(abs(sum(pixels) / len(pixels) - 63), 10)
                    self.assertLess(max(pixels) - min(pixels), 15)

if __name__ == "__main__":
    unittest.main()
