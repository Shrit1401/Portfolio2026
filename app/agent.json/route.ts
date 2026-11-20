import { getAgentProfile } from "@/app/lib/profile";

export const dynamic = "force-static";

export function GET() {
  return Response.json(getAgentProfile());
}
