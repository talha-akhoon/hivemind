import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDb } from '@/lib/db/db';
import { Job, JobTemplate, JobStatus } from '@/lib/db/entities/job.entity';
import { Dataset } from '@/lib/db/entities/dataset.entity';

export async function POST(request: NextRequest) {
  try {
    // Get user from Supabase auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      datasetToken,
      template,
      customScriptUrl,
      trainingConfig,
      metricType,
      metricThreshold,
      totalBudget,
      deadline
    } = body;

    // Validate required fields
    if (!title || !datasetToken || !template || !trainingConfig || !metricType || !metricThreshold || !totalBudget) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Connect to database
    const db = await getDb();
    const datasetRepo = db.getRepository(Dataset);
    const jobRepo = db.getRepository(Job);

    // Verify dataset exists and user has access
    const dataset = await datasetRepo.findOne({ where: { id: parseInt(datasetToken) } });
    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Calculate budget breakdown
    const protocolFee = totalBudget * 0.05;
    const computeBudget = totalBudget - protocolFee;

    // Create job
    const job = new Job();
    job.title = title;
    job.description = description || null;
    job.user_id = user.id;
    job.dataset_id = dataset.id;
    job.template = template as JobTemplate;
    job.custom_script_url = customScriptUrl || null;
    job.training_config = trainingConfig;
    job.metric_type = metricType;
    job.metric_threshold = parseFloat(metricThreshold);
    job.total_budget = parseFloat(totalBudget);
    job.compute_budget = computeBudget;
    job.protocol_fee = protocolFee;
    job.status = JobStatus.ACTIVE;

    // Save job to database
    const savedJob = await jobRepo.save(job);

    return NextResponse.json({
      success: true,
      job: {
        id: savedJob.id,
        title: savedJob.title,
        status: savedJob.status,
        total_budget: savedJob.total_budget,
        created_at: savedJob.created_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user from Supabase auth (optional for browsing all jobs)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // For now, allow browsing all jobs without authentication
    // In production, you might want to require auth or limit access

    // Connect to database
    const db = await getDb();
    const jobRepo = db.getRepository(Job);

    // Get all jobs (not just user's jobs) ordered by creation date
    const jobs = await jobRepo.find({
      order: { created_at: 'DESC' },
      relations: [] // Add relations if needed (e.g., dataset info)
    });

    return NextResponse.json(jobs);

  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
