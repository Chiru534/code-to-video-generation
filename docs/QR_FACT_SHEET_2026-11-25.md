# QR codes — video #13

**Title:** `A QR code is designed to be partly destroyed.`

**Query:** `how do qr codes work`

## Verified facts

1. **Reed-Solomon is built in at four levels.** L: ~7%, M: ~15%, Q: ~25%, H: ~30% of codewords restorable. (DENSO WAVE error-correction page; ISO/IEC 18004 Table 8.)
2. **It is damage tolerance, not obfuscation.** When a code is read with damage, the scanner reconstructs the missing codewords.
3. **Levels Q and H exist because a logo actually removes modules.** H = more redundancy so a center logo can survive; M = general default.
4. **The three finder squares are NOT protected.** If you destroy the corner patterns, the scanner loses the position. The data codewords carry the tolerance, the finders don't.

## Sources

- DENSO WAVE — qrcode.com/en/about/error_correction.html ("Approx. 7% of codewords can be restored" — Level L, etc.)
- ISO/IEC 18004 (the QR standard).

## Notes for narration

- Numbers on screen should say "up to 30%" for level H.
- Honest caveat: destruction means the data codewords — not the finder squares or quiet zone.
