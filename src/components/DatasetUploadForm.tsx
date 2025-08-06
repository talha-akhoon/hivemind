"use client";
import React, {useEffect, useState} from 'react';
import { Upload, FileText, Info, DollarSign, Tag, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DatasetLicenseOptions, DatasetDomainOptions } from '@/lib/db/enums/dataset.enums';
import {useWallet} from '@/contexts/WalletContext';

export default function DatasetUploadForm() {
    const { accountId } = useWallet();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        domain: '',
        data_source: '',
        collection_method: '',
        license: '',
        price: '',
        tags: '',
        owner_wallet: accountId || '',
        train_file: null,
        test_file: null,
        additional_files: null,
        sampling_method: 'head',
        sample_size: 100
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState("");
    const router = useRouter();

    useEffect(() => {
        setFormData({
            ...formData,
            owner_wallet: accountId as string
        })
    }, [accountId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e, fileType) => {
        setFormData(prev => ({
            ...prev,
            [fileType]: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        setLoading(true);
        setToast("");
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value) data.append(key, value);
        });
        try {
            const res = await fetch("/api/my-datasets/upload", {
                method: "POST",
                body: data,
            });
            if (res.ok) {
                setToast("Dataset uploaded! 🎉");
                setFormData({
                    title: '',
                    description: '',
                    domain: '',
                    data_source: '',
                    collection_method: '',
                    license: '',
                    price: '',
                    tags: '',
                    owner_wallet: walletData?.accountId || '',
                    train_file: null,
                    test_file: null,
                    additional_files: null,
                    sampling_method: 'head',
                    sample_size: 100
                });
                setTimeout(() => {
                    setToast("");
                    router.push("/my-datasets");
                }, 1200);
            } else {
                const err = await res.json();
                setToast("Upload failed: " + (err?.message || res.statusText));
            }
        } catch (error) {
            setToast("Upload failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const FileUploadBox = ({ title, fileType, required = false, description }) => (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="text-center">
                <FileText className="mx-auto mb-2 text-gray-400" size={32} />
                <h4 className="font-medium text-gray-700 mb-1">
                    {title} {required && <span className="text-red-500">*</span>}
                </h4>
                <p className="text-xs text-gray-500 mb-2">{description}</p>
                {formData[fileType] ? (
                    <div className="text-green-600 text-sm">
                        ✓ {formData[fileType].name}
                    </div>
                ) : (
                    <div>
                        <input
                            type="file"
                            accept=".csv,.json,.jsonl,.parquet,.xlsx"
                            onChange={(e) => handleFileChange(e, fileType)}
                            className="hidden"
                            id={fileType}
                        />
                        <label
                            htmlFor={fileType}
                            className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm cursor-pointer hover:bg-blue-200"
                        >
                            Choose File
                        </label>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Upload Training Dataset
                </h1>
                <p className="text-gray-600">
                    Share your data with ML practitioners and earn revenue
                </p>
            </div>

            <div className="space-y-8">

                {/* Basic Information */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Info className="mr-2" size={20} />
                        Basic Information
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dataset Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., IMDB Movie Reviews Dataset"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Domain/Industry *
                            </label>
                            <select
                                name="domain"
                                value={formData.domain}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select domain</option>
                                {DatasetDomainOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dataset Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe what this data contains, what each row represents, and what insights it might provide. Be specific about the content and structure."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                {/* Dataset Files */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Upload className="mr-2" size={20} />
                        Dataset Files
                    </h2>
                    <div className="grid md:grid-cols-1 gap-4 mb-4">
                        <FileUploadBox
                            title="Training Data"
                            fileType="train_file"
                            required={true}
                            description="Main dataset file for training models"
                        />
                        <FileUploadBox
                            title="Test Data"
                            fileType="test_file"
                            description="Separate test set for evaluation (optional but recommended)"
                        />
                    </div>

                    <div className="grid md:grid-cols-1 gap-4 mb-4">
                        <FileUploadBox
                            title="Additional Files"
                            fileType="additional_files"
                            description="Data dictionary, README, or other documentation"
                        />
                    </div>

                    {/* Sampling Options */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Sample Generation</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sampling Method
                                </label>
                                <select
                                    name="sampling_method"
                                    value={formData.sampling_method}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="head">First N Rows (Head)</option>
                                    <option value="random">Random Sample</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sample Size
                                </label>
                                <input
                                    type="number"
                                    name="sample_size"
                                    min="1"
                                    value={formData.sample_size}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            A sample of your training and test data will be generated and made public for preview. Choose the method and number of rows to include.
                        </p>
                    </div>
                </div>

                {/* Data Source & Collection */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Data Source & Collection</h2>

                    <div className="">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data Source
                            </label>
                            <input
                                type="text"
                                name="data_source"
                                value={formData.data_source}
                                onChange={handleInputChange}
                                placeholder="e.g., Company internal data, Public APIs, Web scraping"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Collection Method & Processing
                        </label>
                        <textarea
                            name="collection_method"
                            value={formData.collection_method}
                            onChange={handleInputChange}
                            placeholder="How was this data collected and processed? Include any cleaning steps, sampling methods, or transformations applied."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Licensing & Pricing */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <DollarSign className="mr-2" size={20} />
                        Licensing & Pricing
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                License Type *
                            </label>
                            <select
                                name="license"
                                value={formData.license}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select license</option>
                                {DatasetLicenseOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price (HBAR) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder="299"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Wallet Address Field */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Wallet className="mr-2" size={16} />
                            Owner Wallet Address *
                        </label>
                        <input
                            type="text"
                            name="owner_wallet"
                            value={formData.owner_wallet}
                            placeholder="0.0.xxxxx"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {accountId
                                ? `Connected wallet: ${accountId}`
                                : "Connect your wallet to auto-fill this field"
                            }
                        </p>
                    </div>
                </div>

                {/* Discoverability */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Tag className="mr-2" size={20} />
                        Discoverability
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            placeholder="e.g., sentiment-analysis, movie-reviews, text-data, entertainment"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Add relevant tags to help ML practitioners discover your dataset
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                                Uploading...
                            </span>
                        ) : (
                            <>🚀 Upload Dataset</>
                        )}
                    </button>
                </div>
            </div>

            {/* Info Boxes */}
            <div className="mt-8 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Pricing Tips</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Clean, well-documented datasets command higher prices</li>
                        <li>• Consider your data's uniqueness and collection effort</li>
                        <li>• Research pricing for similar datasets in your domain</li>
                        <li>• You can adjust pricing based on demand and feedback</li>
                    </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">What happens after upload?</h3>
                    <ul className="text-sm text-green-800 space-y-1">
                        <li>• AI analyzes data quality, completeness, and structure</li>
                        <li>• Automatic detection of potential use cases and applications</li>
                        <li>• Quality score and marketplace readiness assessment</li>
                        <li>• Dataset preview and sample generation for buyers</li>
                        <li>• Pricing validation based on similar datasets</li>
                    </ul>
                </div>
            </div>

            {toast && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg text-lg animate-fade-in">
                    {toast}
                </div>
            )}
        </div>
    );
}