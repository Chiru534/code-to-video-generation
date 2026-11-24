# Megapixels — video #12

**Title:** `Your 108 megapixel camera takes 12 megapixel photos.`

**Query:** `why do phone cameras have so many megapixels`

## Verified facts

1. **Nonacell = 3×3 pixel merge, 108 MP → 12 MP.** Samsung ISOCELL Bright HM1 announcement (2023, press release): "uses 3x3 pixel structure... a 108 megapixel sensor with 0.8 µm pixels" and "the sensor directly converts the pixels using an embedded hardware IP, rather than having the task delegated to the mobile processor." Image used at 3× lossless zoom is still 12 MP — the binning is before conversion.
2. **IBM/Pixel expectations.** marques brownlee style: "A 108MP camera takes 12MP photos by default" — verified by Samsung press release claim about the sensor producing 12 MP photos; the diffraction/detail point should be tested — do not claim it without testing.

## The break

4 pixels × 4 pixels merge into 1 output pixel (NON-nine merge: 4-in-1, 2×2). Eight pixels become one. So a 108 MP sensor yields ~12 MP by default, and the extra pixels buy light sensitivity, not resolution.

## Sources

- Samsung ISOCELL Bright HM1 press release, Feb 2023 ("enhanced pixel-binning technology... 3x3 pixel structure").
- Digital Trends / PetaPixel explainers.

## Notes

- Avoid saying "diffraction shows the extra is fake" without measuring — leave that out of the video or mark it "not tested here".
- Include qualifiers in the video ("by default", "for light gathering") as on-screen notes.
