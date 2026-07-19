export type CanonViewModel = Readonly<{
  approvedHtml: string;
  sourceDigest: string;
  canonicalEntryCount: number;
  promiseClusterCount: number;
  activeTab: string;
}>;
