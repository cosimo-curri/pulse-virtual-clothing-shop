"""Tests of the regression API schema with synthetic coefficients and measurements."""

import json
import subprocess
import sys
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "WEBSITE/server/python/script.py"


class PredictionTests(unittest.TestCase):
    def test_prediction_uses_leg_length_pixels(self):
        labels_univariate = ["ARM", "LEG", "SHOULDERS", "ARM_LENGTH", "LEG_LENGTH"]
        labels_bivariate = ["CHEST", "BUST", "GLUTEUS", "BELLY"]
        coefficients = [
            {"label": label, "coefficients": [0.5], "intercept": 10}
            for label in labels_univariate
        ] + [
            {"label": label, "coefficients": [0, 0, 0, 0, 0], "intercept": 20}
            for label in labels_bivariate
        ]
        measurements = {
            key: 120 for key in (
                "armPx", "legPx", "shouldersPx", "armLengthPx", "legLengthPx",
                "chestFrontPx", "chestSidePx", "bustFrontPx", "bustSidePx",
                "gluteusFrontPx", "gluteusSidePx", "bellyFrontPx", "bellySidePx"
            )
        }
        completed = subprocess.run(
            [sys.executable, str(SCRIPT), "predict"],
            input=json.dumps({"bodyMeasurements": measurements, "regressionParameters": coefficients}),
            text=True,
            capture_output=True,
            check=True,
            timeout=30,
        )
        output = json.loads(completed.stdout)
        self.assertAlmostEqual(output["legLengthCm"], 70.0)
        self.assertAlmostEqual(output["armCircumferenceCm"], 70.0)
        self.assertAlmostEqual(output["chestCircumferenceCm"], 20.0)
        self.assertEqual(len(output), 9)


if __name__ == "__main__":
    unittest.main()
