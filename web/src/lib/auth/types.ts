export type AppRole = "lecturer" | "student";

export type Profile = {
  id: string;
  username: string;
  displayName: string;
  role: AppRole;
};
