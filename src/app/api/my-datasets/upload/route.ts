import { NextRequest, NextResponse } from 'next/server';
import { DataSource } from 'typeorm';
import { Dataset } from '@/lib/db/entities/dataset.entity';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import {getDb} from '@/lib/db/db';
import {DataSampler, SamplingOptions} from "@/lib/dataSampling";
import {createDatasetToken} from "@/lib/hedera";

async function uploadToSupabase(file: File, key: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from('datasets')
    .upload(key, file, { upsert: true, contentType: file.type });
  if (error) throw new Error(error.message);
  // Get public URL
  const { data: publicUrlData } = supabase.storage.from('datasets').getPublicUrl(key);
  return publicUrlData?.publicUrl || '';
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  // Get user id from Supabase session
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  // Sampling configuration from form
  const samplingMethod = formData.get('sampling_method')?.toString() as SamplingOptions['method'] || 'head';
  const sampleSize = parseInt(formData.get('sample_size')?.toString() || '100');

  const sampler = new DataSampler();
  const sampleMetadata: any = {};

  // Extract fields
  const fields = [
    'title', 'description', 'domain', 'data_source', 'collection_method',
    'license', 'price', 'tags', 'owner_wallet'
  ];
  const dataset: any = { user_id: user.id };
  fields.forEach(f => dataset[f] = formData.get(f)?.toString() || '');
  // Handle files
  const fileFields = ['train_file', 'test_file'];
  for (const field of fileFields) {
    const file = formData.get(field) as File | null;
    if (file && file.size > 0) {
      // Upload original file (private)
      const originalKey = `datasets/private/${user.id}/${Date.now()}_${field}_${file.name}`;
      await uploadToSupabase(file, originalKey);
      dataset[`${field}_url`] = originalKey; // Save only the storage key

      // Create and upload sample (public)
      try {
        const sampleFile = await sampler.createSample(file, {
          method: samplingMethod,
          sampleSize: sampleSize
        });
        const sampleKey = `datasets/samples/${user.id}/${Date.now()}_sample_${field}_${file.name}`;
        dataset[`${field}_sample_url`] = sampleKey; // Save only the storage key
        await uploadToSupabase(sampleFile, sampleKey);

        // Store sample metadata
        sampleMetadata[field] = {
          originalSize: file.size,
          sampleSize: sampleFile.size,
          samplingMethod,
          rowsSampled: sampleSize
        };
      } catch (error) {
        console.error(`Failed to create sample for ${field}:`, error);
        dataset[`${field}_sample_url`] = '';
      }
    } else {
      dataset[`${field}_url`] = '';
      dataset[`${field}_sample_url`] = '';
    }
  }

  // Handle additional files (no sampling for now)
  const additionalFiles = formData.get('additional_files') as File | null;
  if (additionalFiles && additionalFiles.size > 0) {
    const key = `datasets/private/${user.id}/${Date.now()}_additional_${additionalFiles.name}`;
    await uploadToSupabase(additionalFiles, key);
    dataset['additional_files_url'] = key; // Save only the storage key
  } else {
    dataset['additional_files_url'] = '';
  }

  dataset['sample_metadata'] = JSON.stringify(sampleMetadata);

  // Save to DB
  const db: DataSource = await getDb();
  const repo = db.getRepository(Dataset);
  const saved = await repo.save(repo.create(dataset));

  const tokenData = await createDatasetToken({
    datasetId: saved.id,
    title: saved.title,
  })

  // Save token id to dataset row
  saved.token_id = tokenData?.tokenId || '';
  await repo.save(saved);

  return NextResponse.json({ success: true, id: saved.id });
}
