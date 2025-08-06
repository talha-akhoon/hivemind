import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export async function getSignedUrlFromKey(key: string, expiresInSeconds = 3600): Promise<string | null> {
  if (!key) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage.from('datasets').createSignedUrl(key, expiresInSeconds);
  if (error) {
    console.error('Failed to create signed URL:', error);
    return null;
  }
  return data?.signedUrl || null;
}

