# WEB import and reproducibility

Run `node scripts/recovery/verifyWebCorpus.cjs` in a network-disabled process. It safely reads the fixed preserved archive, repeats traversal/absolute-path/duplicate/encryption/method/size/ratio/CRC checks, verifies 70/70 embedded SHA-256 entries and embedded source/license evidence, imports all 68 USFM sources, and compares regenerated corpus and lexical-index bytes with committed artifacts.

Versions and hashes:

- importer: `teoyube-web-usfm-importer-1.0.0`
- corpus: `engwebp-2020-stable-2026-07-10.p15b.1`
- archive: `4253589697dc6b5e92695655f2f28792d50e7be7b9c8e212af4f4bd18e866c3b`
- normalized corpus: `6e6b3f95b5d61c83c06534ee4281f10b6e4e02c878b75141dcdd4403bf42d77f`
- lexical index: `544b67548c04a36e2445fa6601f07f6cdb7b8d044ae2691591629609b2eeeeb2`
- generated composite: `91ed0e262462adc49b54fcb264a910d2753cb927538cf7968486961009fcb62f`
- generated manifest: `e777cbf8c0dcebbb5093194025f1d4c788095d0c873ab4b5021fd238525ab8bd`

`scripts/scripture/importWebCorpus.cjs` is the explicit regeneration command. Normal recovery verification is read-only and never downloads or rewrites artifacts. Source, normalized corpus, and lexical index are kept in distinct server-only locations. No extraction directory is required by the memory-only safe ZIP reader, and no temporary source material is retained.
