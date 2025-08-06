import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db/db';
import {Dataset} from '@/lib/db/entities/dataset.entity';
import {getSignedUrlFromKey} from '@/lib/supabase/getSignedUrl';
import {createClient as createSupabaseServerClient} from "@/lib/supabase/server";
import {User} from "@supabase/supabase-js";
import {Purchase} from "@/lib/db/entities/purchase.entity";

export async function GET(req: NextRequest, {params}: { params: { id: string } }) {
    const db = await getDb();
    const repo = db.getRepository(Dataset);
    const { id } = await params
    const dataset = await repo.findOne({where: {id: Number(id)}});

    if (!dataset) {
        return NextResponse.json({error: 'Dataset not found'}, {status: 404});
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }


    const trainFileSampleUrl = dataset.train_file_sample_url ? await getSignedUrlFromKey(dataset.train_file_sample_url) : null;
    const testFileSampleUrl = dataset.test_file_sample_url ? await getSignedUrlFromKey(dataset.test_file_sample_url) : null;
    const additionalFilesUrl = dataset.additional_files_url ? await getSignedUrlFromKey(dataset.additional_files_url) : null;
    const hasPurchased = await hasPurchasedDataset(dataset, user);
    return NextResponse.json({
        data_source: dataset.data_source,
        collection_method: dataset.collection_method,
        description: dataset.description,
        domain: dataset.domain,
        id: dataset.id,
        license: dataset.license,
        price: dataset.price,
        tags: dataset.tags,
        title: dataset.title,
        sample_metadata: dataset.sample_metadata,
        token_id: dataset.token_id,
        created_at: dataset.created_at,
        user_id: dataset.user_id,
        has_purchased: hasPurchased,
        trainFileSampleUrl,
        testFileSampleUrl,
        additionalFilesUrl,
    });
}

async function hasPurchasedDataset(dataset: Dataset, user: User): Promise<boolean> {
    const db = await getDb();
    const purchaseRepo = db.getRepository(Purchase);
    const purchase = await purchaseRepo.findOne({
        where: {
            dataset_id: dataset.id,
            user_id: user.id,
            status: 'completed'
        }
    });

    return purchase !== null;
}