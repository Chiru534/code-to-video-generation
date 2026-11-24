# CAPTCHA fact sheet — video #9

**Title idea:** `You Are Not Passing a CAPTCHA. You Are Working for Google.`

**Query:** `why are captchas so hard` (Yahoo results show it as a Google property for years).

## Verified facts (sources in parens)

1. **The system was never just a Turing test.** The original reCAPTCHA (Luis von Ahn, Carnegie Mellon, 2007) was explicitly dual-purpose: stop bots and use the solved words as inputs to digitization projects that OCR failed on (Wikipedia).
2. **New York Times archive.** By 2011-13, the NYTimes archive back to 1851 was digitized using reCAPTCHA (NYTimes piece "Deciphering Old Texts, One Woozy, Curvy Word at a Time", 2011; CMU "Perfect Fit", 2009).
3. **Google acquisition.** Google acquired ReCAPTCHA Inc. in **September 2009** (CMU news, Google blog spot, Wikipedia; confirmed by the acquihire).
4. **Google Books** also consumed it — pre-Google, von Ahn ran the SPICE/Google-licensed ESP Game (again, digitization as a side effect).
5. **Street View digits (2012).** In 2012, reCAPTCHA began mixing in photos of house numbers from Google Street View (The Register, 2012, 07:28LMT; TechCrunch, 2012-03-29; Google Maps Working Notes). This means the CAPTCHA answer is also reading house numbers onto Google Maps — consistent with the claim structure.
6. **Mechanism detail.** A word was paired: one known word (control) + one unknown word (two independent OCR failures) — the system mostly relied on the control word for the human test; the unknown word became training labels (Wikipedia "The history of reCAPTCHA").
7. **Vertical (2014+).** From ~2013/2014, reCAPTCHA displayed a single word pair; image grids in v2+ and risk-score risk signals in v3+ — the user cannot verify the training-data claim for those versions (only v1's dual-purpose design is documented).

## The angle

The reversal: a CAPTCHA is not primarily a test of whether you are human. It is a *problem's behalf* system. You are not passing a test; you are contributing to labelling. The difficulty scales with how much labelling is still needed — more reading = more numbers to clean.

## Facts NOT claimed

- Don't claim anything specific about modern v2/v3 flows (cursory research, citations are thin).
- Don't say "CAPTCHAs are useless". Say: "the difficulty scales with how much labelling is still needed."
- Qualifiers: "documented design, September 2009, …"

## Sources

- Wikipedia: reCAPTCHA (dual purpose, NYT, Street View).
- CMU news: Google Inc. acquires Carnegie Mellon spin-off ReCAPTCHA Inc. (2009).
- CMU "Perfect Fit" (2009).
- The New York Times: "Deciphering Old Texts, One Woozy, Curvy Word at a Time" (2011).
- The Register: "Google plonks reCAPTCHA on Street View, makes users ID your house" (2012-04-04).
- TechCrunch: "Google Now Using ReCAPTCHA To Decode Street View Addresses" (2012-03-29).
- Google Maps Working Notes / Crawlex blog history.

## Measured demand (YouTube Data API, earlier session)

`why are captchas so hard`: top 34.3M, median 1,600,326, 9/12 > 100K.
Top results: Cleo Abram, Smart Nonsense (animation + explainer channels).
