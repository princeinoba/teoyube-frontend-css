# Software supply-chain policy

The repository pins Node 24.18.x, npm 10.2.4, and an exact lockfile.

`npm run release:supply-chain:verify` performs:

- `npm ci` and package-lock integrity validation;
- `npm audit` with critical/high findings treated as blockers;
- direct dependency and lifecycle-script review against
  `config/supply-chain-policy.json`;
- SPDX-style SBOM generation;
- dependency license inventory and forbidden-license enforcement;
- SDK version capture;
- package and build artifact hashing.

Generated SBOM and full dependency evidence live in the ignored compact
release-evidence directory. No signing identity exists in this workspace, so
artifact signing and attestation are explicitly a production dependency. The
gate does not fabricate a signature or signer.

Dependency exceptions require a scoped owner/security review and a policy
change with rationale. A report alone cannot suppress a vulnerability.
