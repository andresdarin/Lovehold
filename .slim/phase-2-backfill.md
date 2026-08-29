# Phase 2 persistence backfill strategy

No migration is executed in this phase. Existing legacy schedule and expense
fields remain readable. A future transaction per profile should set profile
defaults, create missing canonical account/flow/goal rows, copy legacy category
and schedule values, and verify links and balances before enabling strict writes.
