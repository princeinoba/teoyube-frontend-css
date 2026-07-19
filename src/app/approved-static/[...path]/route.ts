import { readApprovedStylesheet } from "../../../server/static/approved-static-file";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const content = await readApprovedStylesheet(path);
  if (!content) return new Response("Not found", { status: 404 });
  return new Response(content, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/css; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
