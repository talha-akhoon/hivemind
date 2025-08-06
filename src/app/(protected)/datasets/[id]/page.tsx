"use client";
import {use, useEffect, useState} from "react";
import {DatasetDomain, DatasetDomainLabels, DatasetLicense, DatasetLicenseLabels} from '@/lib/db/enums/dataset.enums';
import Link from 'next/link';
import {useAuth} from "@/contexts/AuthContext";
import {useWallet} from "@/contexts/WalletContext";
import {Hbar, TransferTransaction} from "@hashgraph/sdk";

interface DatasetViewPageProps {
    params: Promise<{ id: string }>
}

export default function DatasetViewPage({params}: DatasetViewPageProps) {
    const {user, loading: authLoading} = useAuth();
    const [dataset, setDataset] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {id} = use(params);
    const [purchasing, setPurchasing] = useState(false);
    const { isConnected, accountId, connect, sendTransaction } = useWallet();

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`/api/datasets/${id}`)
            .then(async (res) => {
                if (!res.ok) throw new Error("Dataset not found");
                return res.json();
            })
            .then((data) => {
                setDataset(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);
    console.log(process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID);

    const handlePurchase = async () => {
        if (!isConnected) {
            console.log("not connected, attempting to connect...");
            await connect();
            return;
        }

        setPurchasing(true);

        try {
            // Use the correct field name from dataset entity
            const priceHbar = parseFloat(dataset.price || '0');
            console.log('accountId:', accountId);
            console.log('hedera_account_id:', process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID);
            const paymentTx = new TransferTransaction()
                .addHbarTransfer(accountId as string, new Hbar(-priceHbar))
                .addHbarTransfer(process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID as string, new Hbar(priceHbar))
                .setTransactionMemo(`Dataset purchase: ${dataset.id}`);
            console.log('paymentTx:', paymentTx.transactionId);
            console.log('Sending payment to platform...');
            await sendTransaction(paymentTx);
            console.log('paymentTx2:', paymentTx.transactionId?.toString());
            const response = await fetch('/api/datasets/purchase', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    datasetId: dataset.id,
                    buyerWallet: accountId,
                    paymentTxId: paymentTx.transactionId?.toString()
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            // Show success message
            alert('Dataset purchased successfully! You will receive your access token shortly.');

        } catch (error) {
            console.error('Purchase failed:', error);
            alert(`Purchase failed: ${error.message}`);
        } finally {
            setPurchasing(false);
        }
    };

    if (loading || authLoading) return <div className="py-12 text-center">Loading...</div>;
    if (error) return <div className="py-12 text-center text-red-600">{error}</div>;
    if (!dataset) return null;

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Link href="/datasets" className="text-blue-600 hover:underline text-sm mb-4 inline-block">&larr; Back to
                Marketplace</Link>
            <div className="bg-white rounded-xl shadow p-8 border border-blue-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{dataset.title}</h1>
                <div className="flex flex-wrap gap-4 items-center mb-4">
                    <span
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs font-semibold">{DatasetDomainLabels[dataset.domain as DatasetDomain]}</span>
                    <span
                        className="bg-green-50 text-green-700 px-3 py-1 rounded text-xs font-semibold">{DatasetLicenseLabels[dataset.license as DatasetLicense]}</span>
                </div>
                <p className="text-gray-700 mb-6 whitespace-pre-line">{dataset.description}</p>
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Sample Files</h2>
                    <ul className="list-disc ml-6 space-y-1">
                        {dataset.trainFileSampleUrl &&
                            <li><a href={dataset.trainFileSampleUrl} target="_blank" rel="noopener"
                                   className="text-blue-600 underline">Training Data Sample</a></li>}
                        {dataset.testFileSampleUrl &&
                            <li><a href={dataset.testFileSampleUrl} target="_blank" rel="noopener"
                                   className="text-blue-600 underline">Test Data Sample</a></li>}
                        {dataset.additionalFilesUrl &&
                            <li><a href={dataset.additionalFilesUrl} target="_blank" rel="noopener"
                                   className="text-blue-600 underline">Additional Files</a></li>}
                    </ul>
                </div>
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-sm">
                        <div><span className="font-semibold">Data Source:</span> {dataset.data_source}</div>
                        <div><span className="font-semibold">Collection Method:</span> {dataset.collection_method}</div>
                        <div><span
                            className="font-semibold">Uploaded:</span> {new Date(dataset.created_at).toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4 mt-8">
                    <div className="py-1 text-2xl text-center"><span
                        className="font-semibold">Price:</span>{dataset.price ? `${dataset.price} HBAR` : 'Free'}</div>

                    {dataset.has_purchased || (!loading && user && user.id !== dataset.user_id) && (
                        <button
                            onClick={() => handlePurchase()}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                            Purchase Dataset
                        </button>
                    )}

                </div>
            </div>
        </div>
    );
}
