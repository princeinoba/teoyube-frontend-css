# Deterministic Runtime Build Identity

Teoyube's canonical Next build ID is derived from a versioned SHA-256 digest
of explicit runtime and build inputs. It is not derived from the current Git
HEAD, a timestamp, random data, an environment-selected value, or a report.

The source policy is `config/runtime/runtime-source-manifest.json`. It covers:

- Next source and server/domain data under `src/`
- runtime assets under `public/`
- the approved static sources consumed by the Next compatibility layer
- Next, TypeScript, package, lockfile, security-header, route, asset, and
  telemetry configuration
- runtime launch and verification tooling under `scripts/runtime/`

Recovery reports, owner decisions, release artifacts, `.next`, temporary
output, Git metadata, and timestamps are excluded. Therefore a report-only
commit does not change the ID, while a route, API, source, package, lockfile,
Next configuration, or public runtime-asset change does.

Text inputs normalize CRLF/CR line endings to LF. Paths normalize to
repository-relative forward-slash form, are rejected when unsafe, are checked
case-insensitively for duplicates, and are hashed in ordinal order. The
canonical record envelope uses sorted-key JSON serialization.

The build ID format is:

```text
teoyube-<first 24 hexadecimal characters of runtimeSourceDigest>
```

`next.config.mjs` uses Next's supported `generateBuildId` option. Configuration
evaluation performs no network call, repository write, secret access, Git
mutation, or timestamp/random operation. Arbitrary build-ID overrides are
rejected.

The canonical runtime manifest binds the complete digest, generator version,
runtime-source commit, deterministic build ID, and verification time. The
runtime verifier recomputes the digest and fails on stale source, a stale
build, manifest mismatch, dirty runtime inputs, missing sources, unsafe
feature defaults, or loss of the static rollback.

The old Prompt 22 and Prompt 23A random IDs remain valid historical artifact
identifiers. They are not reusable as the canonical rebuild identity.
