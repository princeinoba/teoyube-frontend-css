import { ApprovedTeoyubeShell } from "./_shell/ApprovedTeoyubeShell";
import { TeoyubeAppStateProvider } from "@/components/productization/TeoyubeAppStateProvider";
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
  return (
    <html lang="en">
      <body data-view="today">
        <style>{approvedStylesheetImports}</style>
        <TeoyubeAppStateProvider>
          <ApprovedTeoyubeShell>{children}</ApprovedTeoyubeShell>
        </TeoyubeAppStateProvider>
      </body>
    </html>
  );
}
