// Kept out of actions.ts because a "use server" file may only export async
// functions — exporting this constant from there fails the production build.
export type ExamActionState = { error: string | null; message: string | null };

export const emptyExamActionState: ExamActionState = { error: null, message: null };
