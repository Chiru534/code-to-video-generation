# 5G battery — video #10

**Title:** `The Battery Cost Isn't the Speed. It's the State Machine.`

**Query:** `does 5g drain battery`

## Verified facts

1. **5G consumes more power than 4G during RRC state transitions** (SIGCOMM 2021, Table 2). Measured in mW (Monsoon power monitor):
   - 4G: 178 (T-Mobile), 0 (Verizon 4G — sampling window artifact; don't use).
   - 5G NSA low-band: 249 (Verizon), 260 (T-Mobile), 593 (T-Mobile SA).
   - 5G NSA mmWave: 1092 (Verizon).
   - **4G→5G switch** itself: 799 (Verizon), 245 (T-Mobile), 1494 (Verizon mmWave).
2. **5G has a longer tail** (return to idle after data transfer). SIGCOMM 2021: 4G returns to RRC_IDLE in ~10s, 5G in ~20s (§4.3, "an obvious long-tail stage... 4G returns to RRC_IDLE after about 10s, while 5G takes about 20s"). Also Ericsson 2021: RRC_INACTIVE shortens the transition, battery savings up to 30% for NSA → cite as mitigating factor.
3. **PlTB: network picks the cell. The user experiences it as "5G mode eats battery" — but the mechanism is control plane.** From Xu et al. measurements, the modem draws far more while acquiring/holding/switching than while moving data (that's in §4 of the SIGCOMM 2021 paper — get exact text: "the modem draws far more while acquiring and holding a marginal cell than while moving data through a good one").
4. **Requirement caveat:** mmWave needs more steering.
5. **Case citation (SIGCOMM 2021):** T-Mobile 5G NSA low band consumes more than 4G; handover energies differ.

## Facts NOT claimed

- Don't say "the 5G chip always idles harder". Say "the tail is longer, the handovers cost more, and the 4G↔5G switch costs a few hundred mW — the data path itself is comparable to 4G."
- Qualifiers: "Monsoon power monitor measurements in two US carriers (Verizon, T-Mobile), 2021", "mW figures are averages, carrier and device dependent".

## Sources

- SIGCOMM 2021: A Variegated Look at 5G in the Wild — Performance, Power and QoE Implications (conferences.sigcomm.org/sigcomm/2021/files/papers/3452296.3472923.pdf).
- 2022-04-02 arXiv: Power Saving Techniques in 3GPP 5G New Radio — A Comprehensive Latency and Reliability Analysis.
- Ericsson, July 2021: 5G feature — RRC_INACTIVE — battery savings up to 30%.
- 2022-03-10 arXiv:2203.05634 — RedCap, eDRX, 90+ s batteries.

## The reversal

The break: a phone at the edge of coverage spends most of the time in the state machine, not moving data — acquiring, re-measuring, handoving — and that state machine costs far more than moving data through a good cell. So "5G battery" is really "5G state machine battery".

## One measured data point to keep

The RRC power table from SIGCOMM 2021 is the visual anchor: a bar chart of mW per state, 4G vs 5G, plus handover costs.

## Measured demand (from 20 Nov): 437,167 median — keep short in the video.
