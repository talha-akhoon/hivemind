import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/db';
import { Job, JobStatus } from '@/lib/db/entities/job.entity';
import { createClient } from '@/lib/supabase/server';

async function uploadToSupabase(file: File, key: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from('models')
    .upload(key, file, { upsert: true, contentType: file.type });
  if (error) throw new Error(error.message);

  // Get public URL for the model
  const { data: publicUrlData } = supabase.storage.from('models').getPublicUrl(key);
  return publicUrlData?.publicUrl || '';
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = parseInt(params.id);
    const formData = await request.formData();

    // Extract form data
    const modelFile = formData.get('modelFile') as File;
    const agentId = formData.get('agentId')?.toString();
    const accountId = formData.get('accountId')?.toString();
    const metricsStr = formData.get('metrics')?.toString();
    const modelSize = formData.get('modelSize')?.toString();

    // Validate required fields
    if (!modelFile || !agentId || !accountId || !metricsStr) {
      return NextResponse.json(
        { error: 'Missing required fields: modelFile, agentId, accountId, metrics' },
        { status: 400 }
      );
    }

    let metrics: Record<string, number>;
    try {
      metrics = JSON.parse(metricsStr);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid metrics JSON format' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDb();
    const jobRepo = db.getRepository(Job);

    // Find the job and verify agent ownership
    const job = await jobRepo.findOne({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Verify the job is in progress and assigned to this agent
    if (job.status !== JobStatus.IN_PROGRESS) {
      return NextResponse.json(
        { error: 'Job is not in progress' },
        { status: 400 }
      );
    }

    if (job.results?.provider_id !== agentId) {
      return NextResponse.json(
        { error: 'Job is not assigned to this agent' },
        { status: 403 }
      );
    }

    // Check if metrics meet the success criteria
    const targetMetric = metrics[job.metric_type];
    const meetsThreshold = targetMetric !== undefined && targetMetric >= job.metric_threshold;

    // Upload model file to Supabase storage
    const timestamp = Date.now();
    const modelKey = `models/${jobId}/${agentId}/${timestamp}_${modelFile.name}`;

    try {
      const modelUrl = await uploadToSupabase(modelFile, modelKey);

      // Create logs file with training information
      const logsContent = {
        jobId,
        agentId,
        accountId,
        submittedAt: new Date().toISOString(),
        metrics,
        modelSize: modelSize ? parseInt(modelSize) : modelFile.size,
        meetsThreshold,
        trainingConfig: job.training_config
      };

      const logsBlob = new Blob([JSON.stringify(logsContent, null, 2)], {
        type: 'application/json'
      });
      const logsFile = new File([logsBlob], `training_logs_${jobId}_${timestamp}.json`, {
        type: 'application/json'
      });

      const logsKey = `models/${jobId}/${agentId}/${timestamp}_logs.json`;
      const logsUrl = await uploadToSupabase(logsFile, logsKey);

      // Calculate training time if available
      const startedAt = job.results?.started_at;
      const trainingTime = startedAt
        ? Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)
        : undefined;

      // Update job with results
      const newStatus = meetsThreshold ? JobStatus.COMPLETED : JobStatus.FAILED;
      const updatedResults = {
        ...job.results,
        final_metrics: metrics,
        model_url: modelUrl,
        model_storage_key: modelKey, // Store the storage key for access control
        logs_url: logsUrl,
        logs_storage_key: logsKey,
        training_time: trainingTime,
        submitted_at: new Date().toISOString(),
        model_size: modelSize ? parseInt(modelSize) : modelFile.size,
        meets_threshold: meetsThreshold
      };

      await jobRepo.update(jobId, {
        status: newStatus,
        results: updatedResults
      });

      // Return success response
      return NextResponse.json({
        success: true,
        jobId,
        status: newStatus,
        meetsThreshold,
        metrics,
        modelUrl,
        logsUrl,
        trainingTime,
        message: meetsThreshold
          ? 'Model submitted successfully and meets success criteria'
          : 'Model submitted but does not meet success criteria'
      });

    } catch (uploadError) {
      console.error('Upload error:', uploadError);

      // Mark job as failed due to upload error
      await jobRepo.update(jobId, {
        status: JobStatus.FAILED,
        results: {
          ...job.results,
          error: 'Failed to upload model',
          failed_at: new Date().toISOString()
        }
      });

      return NextResponse.json(
        { error: 'Failed to upload model files' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Submit model error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
