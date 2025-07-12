// lib/uploadToSupabase.ts

import { supabaseClient } from './supabaseClient';

export async function uploadResumeFile(file: File, userId: string) {
  const timestamp = Date.now();
  const filePath = `${userId}/${timestamp}_${file.name}`;

  const { data, error } = await supabaseClient.storage
    .from('resumes')
    .upload(filePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data: publicUrlData } = supabaseClient.storage
    .from('resumes')
    .getPublicUrl(filePath);

  return {
    filePath,
    publicUrl: publicUrlData.publicUrl,
  };
}
