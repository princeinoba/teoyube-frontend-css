const { completeEmergencyGateRecovery } = require("./lib/teoyubeWorldOwnerAttestation.cjs");

async function run() {
  const report = await completeEmergencyGateRecovery();
  console.log(JSON.stringify({
    valid: report.valid,
    phase: report.phase,
    backupPath: report.backupPath,
    stateRevisionBefore: report.stateRevisionBefore,
    stateRevisionAfterAttestation: report.stateRevisionAfterAttestation,
    stateRevisionAfterApproval: report.stateRevisionAfterApproval,
    blockerCountBefore: report.gateBefore.blockerCount,
    blockerCountAfter: report.finalGate.blockerCount,
    selectedRecords: report.finalGate.counts.selected,
    confirmedSequences: report.finalGate.counts.approvedSequences,
    confirmedSequenceSegments: report.finalGate.counts.confirmedSequenceSegments,
    attestationArtifactId: report.attestation.artifactId,
    attestationArtifactChecksum: report.attestation.artifactChecksumSha256,
    approvalArtifactChecksum: report.approval.artifactChecksumSha256,
    derivativeExecutionAuthorized: report.derivativeExecutionAuthorized,
    publicationAuthorized: report.publicationAuthorized,
    mediaFilesCopied: report.mediaFilesCopied,
    mediaFilesTranscoded: report.mediaFilesTranscoded,
    publicFilesWritten: report.publicFilesWritten,
    sourceFilesModified: report.sourceFilesModified
  }, null, 2));
  if (!report.valid) process.exitCode = 1;
  return report;
}

if (require.main === module) run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

module.exports = { run };
