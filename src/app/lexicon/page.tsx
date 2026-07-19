import { LexiconPageController } from "../_lexicon/LexiconPageController";
import { createLexiconPageViewModel } from "../../features/lexicon/application/lexicon-page-service";

export default function LexiconPage() {
  return <LexiconPageController initialViewModel={createLexiconPageViewModel()} />;
}
