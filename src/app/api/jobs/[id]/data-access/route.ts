import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/db';
import { Job, JobStatus } from '@/lib/db/entities/job.entity';
import { Dataset } from '@/lib/db/entities/dataset.entity';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = parseInt(params.id);
    const body = await request.json();
    const { agentId, accountId } = body;

    if (!agentId || !accountId) {
      return NextResponse.json(
        { error: 'Agent ID and Account ID are required' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDb();
    const jobRepo = db.getRepository(Job);
    const datasetRepo = db.getRepository(Dataset);

    // Find the job with dataset
    const job = await jobRepo.findOne({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if job is active and available for agents
    if (job.status !== JobStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'Job is not available for processing' },
        { status: 400 }
      );
    }

    // Get the associated dataset
    const dataset = await datasetRepo.findOne({ where: { id: job.dataset_id } });
    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Update job status to IN_PROGRESS and assign to agent
    await jobRepo.update(jobId, {
      status: JobStatus.IN_PROGRESS,
      results: {
        ...job.results,
        provider_id: agentId,
        started_at: new Date().toISOString()
      }
    });

    // Create Supabase client for generating signed URLs
    const supabase = await createClient();

    // Generate signed URLs for private dataset files (24 hour expiry)
    const signedUrls: Record<string, string> = {};

    if (dataset.train_file_url) {
      const { data } = await supabase.storage
        .from('datasets')
        .createSignedUrl(dataset.train_file_url, 86400); // 24 hours
      if (data?.signedUrl) {
        signedUrls.train_file = data.signedUrl;
      }
    }

    if (dataset.test_file_url) {
      const { data } = await supabase.storage
        .from('datasets')
        .createSignedUrl(dataset.test_file_url, 86400);
      if (data?.signedUrl) {
        signedUrls.test_file = data.signedUrl;
      }
    }

    if (dataset.validation_file_url) {
      const { data } = await supabase.storage
        .from('datasets')
        .createSignedUrl(dataset.validation_file_url, 86400);
      if (data?.signedUrl) {
        signedUrls.validation_file = data.signedUrl;
      }
    }

    if (dataset.additional_files_url) {
      const { data } = await supabase.storage
        .from('datasets')
        .createSignedUrl(dataset.additional_files_url, 86400);
      if (data?.signedUrl) {
        signedUrls.additional_files = data.signedUrl;
      }
    }

    // Custom script URL if provided
    if (job.custom_script_url) {
      const { data } = await supabase.storage
        .from('datasets')
        .createSignedUrl(job.custom_script_url, 86400);
      if (data?.signedUrl) {
        signedUrls.custom_script = data.signedUrl;
      }
    }

    // Return job details and data access URLs
    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        description: job.description,
        template: job.template,
        training_config: job.training_config,
        metric_type: job.metric_type,
        metric_threshold: job.metric_threshold,
        total_budget: job.total_budget,
        compute_budget: job.compute_budget
      },
      dataset: {
        id: dataset.id,
        title: dataset.title,
        description: dataset.description,
        domain: dataset.domain,
        data_source: dataset.data_source
      },
      dataUrls: signedUrls,
      accessGrantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString() // 24 hours from now
    });

  } catch (error) {
    console.error('Data access error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
