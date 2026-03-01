# Degraded Mode Behavior

Confidence tier ladder:

- Tier 0 (normal): all routes healthy
- Tier 1 (reweight): one route degraded, reduce heavy calls
- Tier 2 (safe_mode): multiple route failures, reduce iteration frequency
- Tier 3 (hold_observe): sustained failure, no promotion/execution actions

Fallback order example:
1. primary private route
2. secondary private route
3. minimal safe-mode operation with explicit degraded reporting
