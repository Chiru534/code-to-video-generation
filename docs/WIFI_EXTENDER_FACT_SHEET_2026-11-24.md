# Wi-Fi extender — video #11

**Title:** `Your Wi-Fi extender makes Wi-Fi slower.`

**Query:** `do more antennas mean better wifi` (measured 20 Nov: top 4.6M, median 287,391, 9/12)

## Verified facts

1. **An extender is a relay; Wi-Fi is half-duplex.** One radio cannot transmit and receive on the same channel at once. (ExtenderWorks — "the rate through the extender is at best about half the rate into it"; SmallNetBuilder; NIFITEXT)
2. **Mechanism: airtime doubles.** The frame uses the channel twice: router → extender, extender → device. (ExtenderWorks: "the channel is occupied twice for the same data".)
3. **Repeated-band extenders pay it too.** An extender that repeats the same band on itself (2.4 in, 2.4 out) suffers the halving per band — any single-radio extender pays it. (NIFITEXT 2026, Omada)
4. **It doesn't increase internet speed or router wireless capacity.** (Omada, 2026)
5. **Phone bars show the extender, not the extender's link to the router.** (Omada, 2026)
6. **Mesh is the same physics, on two radios.**

## The reversal (for the video)

"A single-radio extender uses one channel to talk to the router and back, so each frame costs two turns of the airtime."

## Visual note

Airtime timeline: frame crosses channel twice on the way to the extender and back; the halving made visible.

## Measured demand

`do more antennas mean better wifi`: top 4.6M, median 287,391, 9/12 >100K.
