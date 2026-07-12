export const supabase = {
  auth: { signInWithPassword: async () => ({ data: null, error: null }) },
  from: () => ({ select: () => ({ data: [], error: null }) })
};
