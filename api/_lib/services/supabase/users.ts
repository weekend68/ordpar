import { getSupabaseClient } from './client.js';

export interface UserRecord {
  id: string;
  name: string;
  created_at: string;
}

/**
 * Create a new user
 */
export async function createUser(name: string): Promise<string> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .insert({ name })
    .select('id')
    .single();

  if (error) {
    console.error('❌ Failed to create user:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }

  console.log(`👤 Created user: ${data.id} (${name})`);
  return data.id;
}

/**
 * Get a user by ID
 */
export async function getUser(id: string): Promise<UserRecord | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get user: ${error.message}`);
  }

  return data;
}
