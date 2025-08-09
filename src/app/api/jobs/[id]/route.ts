import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/db';
import { Job } from '@/lib/db/entities/job.entity';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = parseInt(params.id);

    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    // Connect to database
    const db = await getDb();
    const jobRepo = db.getRepository(Job);

    // Find the job by ID
    const job = await jobRepo.findOne({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);

  } catch (error) {
    console.error('Failed to fetch job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
