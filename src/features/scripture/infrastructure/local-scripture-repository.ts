// Compatibility boundary for the approved Canon page. The implementation is
// owned by the server-side canonical Scripture repository.
export {
  canonicalScriptureRepository,
  createCanonicalScriptureRepository as createLocalScriptureRepository
} from "../../../server/scripture/canonical-scripture-repository";
