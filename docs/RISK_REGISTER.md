# SkinSafe Risk Register

| ID | Risk | Impact | Likelihood | Mitigation | Owner | Status |
|----|------|--------|------------|------------|-------|--------|
| R01 | Medical claims in UI copy trigger regulatory action | HIGH | MED | Automated copy checker (check:copy script), compliance review, banned phrase list | Claude/Founder | ACTIVE |
| R02 | False positive ingredient flags erode user trust | MED | HIGH | Boundary-aware matching, negative pattern exclusions, confidence levels, test coverage | Claude | ACTIVE |
| R03 | Users interpret fit score as medical recommendation | HIGH | MED | Prominent disclaimers on all result screens, "for informational purposes" framing | Claude/Founder | ACTIVE |
| R04 | App store rejection due to health claims | HIGH | MED | Review all App Store metadata, screenshots, descriptions before submission | Founder | ACTIVE |
| R05 | Supabase anon key exposed enables spam/abuse | LOW | MED | Rate limiting at Supabase level, monitoring for abuse, no PII in database | Claude/Founder | ACTIVE |
| R06 | Incomplete ingredient data leads to missed flags | MED | HIGH | Confidence level indicators, encourage full INCI input, community contributions | Claude | ACTIVE |
| R07 | Camera permission denied blocks core functionality | MED | MED | Manual UPC entry fallback, clear permission request messaging | Claude | MITIGATED |
| R08 | Large ingredient lists cause performance issues | LOW | LOW | Tokenization optimization, lazy evaluation, limit max tokens processed | Claude | MONITORING |
| R09 | Offline-first mode creates data sync issues | MED | LOW | For MVP: no sync needed. Post-MVP: conflict resolution strategy | Founder | DEFERRED |
| R10 | Community-submitted products contain incorrect data | MED | MED | No moderation in MVP (accept risk), flag low-confidence entries, post-MVP: review queue | Founder | ACCEPTED |
| R11 | TypeScript compile errors block deployment | HIGH | LOW | CI/CD with tsc --noEmit, pre-commit hooks | Claude | ACTIVE |
| R12 | Expo SDK updates break dependencies | MED | MED | Lock dependency versions, test before upgrades, maintain upgrade notes | Claude | MONITORING |

---

## Risk Definitions

### Impact Levels
- **HIGH**: Blocks launch, causes legal/regulatory issues, or severely damages user trust
- **MED**: Degrades user experience, requires significant rework, or delays launch
- **LOW**: Minor inconvenience, easily worked around, minimal user impact

### Likelihood Levels
- **HIGH**: Expected to occur; has occurred in similar projects
- **MED**: Could occur; depends on external factors
- **LOW**: Unlikely; requires multiple failures or edge cases

### Status Definitions
- **ACTIVE**: Risk is current and being actively managed
- **MITIGATED**: Controls in place; residual risk acceptable
- **MONITORING**: Watching for changes; no immediate action needed
- **DEFERRED**: Will address post-MVP or if conditions change
- **ACCEPTED**: Acknowledged; no further action planned
- **CLOSED**: Risk no longer applicable

---

## Escalation Criteria

Escalate to Founder immediately if:
1. Any regulatory or legal concern arises
2. App store submission is rejected
3. User reports harm from app recommendations
4. Security breach or data exposure occurs

---

## Review Cadence

- Weekly: Review ACTIVE risks during sprint planning
- Monthly: Full register review; update statuses
- Per Release: Verify all HIGH impact risks are MITIGATED or ACCEPTED
