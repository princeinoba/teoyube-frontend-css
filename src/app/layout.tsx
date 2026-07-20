import { ApprovedTeoyubeShell } from "./_shell/ApprovedTeoyubeShell";
import { TeoyubeAppStateProvider } from "@/components/productization/TeoyubeAppStateProvider";
import { createDeterministicDailySpiritualLoopSeed } from "@/features/journey/application/daily-spiritual-loop-service";
import { DailySpiritualLoopProvider } from "@/features/journey/ui/DailySpiritualLoopProvider";
import type { ReactNode } from "react";

export const metadata = {
  title: "TEOYUBE App",
  description: "TEOYUBE helps Saints discover biblical promises, understand calling, receive daily divine assignments, and build the Book of the Saint."
};

const approvedStylesheetImports = `
@import url("/styles/legacy.css?recovery=1");
@import url("/styles/tokens.css?recovery=1");
@import url("/styles/reset.css?recovery=1");
@import url("/styles/base.css?recovery=1");
@import url("/styles/layout.css?recovery=1");
@import url("/styles/components.css?recovery=1");
@import url("/styles/pages/index.css?recovery=1");
@import url("/styles/utilities.css?recovery=1");
@import url("/styles/responsive.css?recovery=1");
`;

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  const dailySpiritualLoopSeed = createDeterministicDailySpiritualLoopSeed();
  return (
    <html lang="en">
      <body data-view="today">
        <style>{approvedStylesheetImports}</style>
        <TeoyubeAppStateProvider>
          <DailySpiritualLoopProvider seed={dailySpiritualLoopSeed}>
            <ApprovedTeoyubeShell>{children}</ApprovedTeoyubeShell>
          </DailySpiritualLoopProvider>
        </TeoyubeAppStateProvider>
      </body>
    </html>
  );
}
