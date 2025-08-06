import { getDb } from '@/lib/db/db';
import { Dataset } from '@/lib/db/entities/dataset.entity';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { DatasetDomainLabels } from '@/lib/db/enums/dataset.enums';

export default async function MyDataset() {
    // Get current user from Supabase
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return (
            <div className=" flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">My Datasets</h1>
                    <p className="text-gray-700 mt-4">You must be logged in to view your datasets.</p>
                </div>
            </div>
        );
    }
    const db = await getDb();
    const repo = db.getRepository(Dataset);
    const datasets = await repo.find({ where: { user_id: user.id }, order: { created_at: 'DESC' } });

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">My Datasets</h1>
                </div>
                {datasets.length === 0 ? (
                    <p className="text-gray-700 text-center">You have not uploaded any datasets yet.</p>
                ) : (
                    <div className="space-y-6">
                        {datasets.map(ds => (
                            <div key={ds.id} className="bg-white rounded-lg shadow p-5 border border-gray-100">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <div>
                                        <h2 className="text-lg font-semibold text-blue-900">{ds.title}</h2>
                                        <p className="text-gray-600 text-sm mb-1">{DatasetDomainLabels[ds.domain]}</p>
                                        <p className="text-gray-700 text-sm line-clamp-2">{ds.description}</p>
                                        <div className="text-xs text-gray-400 mt-1">Uploaded: {new Date(ds.created_at).toLocaleString()}</div>
                                    </div>
                                    <div className="flex flex-col gap-1 mt-2 md:mt-0 md:items-end">
                                        <span className="text-blue-700 font-bold">{ds.price ? `${ds.price} HBAR` : 'Free'}</span>
                                        <Link
                                            href={`/datasets/${ds.id}`}
                                            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-2 rounded-lg text-sm font-bold shadow transition mt-2"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}