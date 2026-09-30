import { entityMap } from "@/lib/entitymap";

export const dynamic = "force-static";

export function GET() {
  return Response.json(entityMap());
}
