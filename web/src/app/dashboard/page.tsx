import { redirect } from "next/navigation";
import { dashboardPathForRole, requireProfile } from "@/lib/auth/session";

export default async function DashboardIndex() {
  const profile = await requireProfile();
  redirect(dashboardPathForRole[profile.role]);
}
