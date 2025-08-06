import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/db';
import { Dataset } from '@/lib/db/entities/dataset.entity';
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
    try {
        // Check authentication
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Get database connection
        const db = await getDb();
        const repo = db.getRepository(Dataset);

        // Fetch all datasets (could filter by user_id for user's own datasets or include all public ones)
        const datasets = await repo.find({
            select: [
                'id',
                'title',
                'description',
                'domain',
                'price',
                'tags',
                'created_at',
                'user_id',
                'sample_metadata'
            ],
            order: {
                created_at: 'DESC'
            }
        });

        // Format datasets for the job creation form
        const formattedDatasets = datasets.map(dataset => {
            // Parse sample metadata to get size info
            let sampleInfo = { size: 'Unknown size', categories: 'Various' };
            if (dataset.sample_metadata) {
                try {
                    const metadata = JSON.parse(dataset.sample_metadata);
                    sampleInfo = {
                        size: metadata.total_samples ? `${metadata.total_samples.toLocaleString()} samples` : 'Unknown size',
                        categories: metadata.num_classes ? `${metadata.num_classes} classes` : 'Various categories'
                    };
                } catch (e) {
                    // Use defaults if parsing fails
                }
            }

            return {
                id: dataset.id.toString(),
                title: dataset.title,
                description: dataset.description,
                size: sampleInfo.size,
                categories: sampleInfo.categories,
                domain: dataset.domain,
                price: parseFloat(dataset.price || '0'),
                rating: 4.5, // Default rating - you might want to implement real ratings
                format: getFormatFromDomain(dataset.domain),
                tags: dataset.tags || '',
                owner: `User ${dataset.user_id}` // You might want to join with user table for real names
            };
        });

        return NextResponse.json(formattedDatasets);

    } catch (error) {
        console.error('Error fetching datasets:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Helper function to determine format based on domain
function getFormatFromDomain(domain: string): string {
    const formatMap: { [key: string]: string } = {
        'computer_vision': 'Images (JPG/PNG)',
        'natural_language_processing': 'Text (JSON/CSV)',
        'audio': 'Audio (WAV/MP3)',
        'time_series': 'CSV/JSON',
        'tabular': 'CSV',
        'other': 'Various formats'
    };

    return formatMap[domain] || 'Various formats';
}
