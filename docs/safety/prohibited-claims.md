# Prohibited theological and coercive claims

Registry version: `teoyube-prohibited-claims-1.0.0`

The versioned registry blocks direct and close-paraphrase claims of divine authority, final calling/destiny, guaranteed healing/wealth/relationship/legal/career/prophecy outcomes, weak-faith blame, demonic/sin causation, care replacement, abuse submission, coercion/secrecy/isolation/fabricated urgency, automatic fulfillment, automatic testimony, and automatic divine attribution.

Detection is applied to requests and composed output. It is quotation- and negation-aware: a policy statement such as `Teo Guide must never say, "God told me that you must..."` is not treated as Teo Guide making that claim. Scripture quotation context is not reclassified as a personal divine directive.

The locked synthetic dataset pairs each prohibited class with a direct unsafe case and a quoted or negated benign case. Gate A requires zero generated violations, zero safety-critical misses, and zero false positives on that locked benign set. Relaxing a detector or threshold requires a separate owner-reviewed policy decision; no automated agent may approve it.
