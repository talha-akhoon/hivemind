"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronRight,
    ChevronDown,
    X,
    FileText,
    Database,
    Cpu,
    Target,
    DollarSign,
    Upload,
    CheckCircle,
    AlertCircle,
    Info,
    Clock,
    Zap,
    BookOpen
} from 'lucide-react';

const JobPostForm = () => {
    const router = useRouter();

    // Form state - updated with BERT-specific defaults
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        datasetToken: '',
        template: 'nlp',
        customScriptUrl: '',
        // Updated hyperparameters for BERT
        epochs: 5,
        batchSize: 16,
        learningRate: 0.00002, // 2e-5 for BERT
        modelArchitecture: 'bert-base-uncased',
        maxLength: 128,
        validationSplit: 0.2,
        earlyStoppingPatience: 3,
        weightDecay: 0.01,
        maxGradNorm: 1.0,
        // Success criteria
        metricType: 'f1',
        metricThreshold: 0.85,
        // Job settings
        deadline: 24,
        totalBudget: 1000,
        // Data format
        dataFormat: 'jsonl',
        numLabels: 2
    });

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [datasets, setDatasets] = useState([]);
    const [loadingDatasets, setLoadingDatasets] = useState(true);

    // Load available datasets on component mount
    useEffect(() => {
        const loadDatasets = async () => {
            try {
                setLoadingDatasets(true);
                const response = await fetch('/api/datasets');

                if (response.ok) {
                    const data = await response.json();
                    setDatasets(data);
                } else if (response.status === 401) {
                    console.error('User not authenticated');
                    setDatasets([]);
                } else {
                    throw new Error('Failed to fetch datasets');
                }
            } catch (error) {
                console.error('Failed to load datasets:', error);
                setDatasets([]);
            } finally {
                setLoadingDatasets(false);
            }
        };

        loadDatasets();
    }, []);

    const templates = [
        {
            id: 'nlp',
            name: 'NLP/Text Classification',
            icon: '📝',
            description: 'Fine-tune BERT models for text classification tasks',
            estimatedTime: '1-4 hours',
            gpuRequired: true,
            models: ['bert-base-uncased', 'bert-large-uncased', 'distilbert-base-uncased', 'roberta-base', 'albert-base-v2']
        },
        {
            id: 'sentiment',
            name: 'Sentiment Analysis',
            icon: '😊',
            description: 'Specialized template for sentiment classification',
            estimatedTime: '1-3 hours',
            gpuRequired: true,
            models: ['bert-base-uncased', 'distilbert-base-uncased']
        },
        {
            id: 'ner',
            name: 'Named Entity Recognition',
            icon: '🏷️',
            description: 'Extract entities from text (coming soon)',
            estimatedTime: '2-5 hours',
            gpuRequired: true,
            disabled: true
        },
        {
            id: 'custom',
            name: 'Custom Script',
            icon: '⚙️',
            description: 'Upload your own training script (coming soon)',
            estimatedTime: 'Variable',
            gpuRequired: true,
            disabled: true
        }
    ];

    // NLP-specific model architectures
    const nlpModels = {
        'bert-base-uncased': { name: 'BERT Base (Uncased)', params: '110M', description: 'Standard BERT model, good balance of performance and speed' },
        'bert-large-uncased': { name: 'BERT Large (Uncased)', params: '340M', description: 'Larger BERT model, better accuracy but slower' },
        'distilbert-base-uncased': { name: 'DistilBERT Base', params: '66M', description: 'Faster, lighter version of BERT (40% smaller, 60% faster)' },
        'roberta-base': { name: 'RoBERTa Base', params: '125M', description: 'Robustly optimized BERT, often better performance' },
        'albert-base-v2': { name: 'ALBERT Base v2', params: '12M', description: 'Lighter BERT with parameter sharing' }
    };

    // Calculate budget breakdown
    const calculateBudget = () => {
        const total = parseFloat(formData.totalBudget) || 0;
        const protocolFee = total * 0.05;
        const computeAmount = total - protocolFee;

        return {
            compute: computeAmount,
            protocol: protocolFee,
            total: total
        };
    };

    const budget = calculateBudget();

    // Handle form updates
    const updateForm = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Handle dataset selection
    const selectDataset = (dataset) => {
        setSelectedDataset(dataset);
        updateForm('datasetToken', dataset.id);
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Job title is required';
        } else if (formData.title.length < 10) {
            newErrors.title = 'Title should be at least 10 characters';
        }

        if (!formData.datasetToken) {
            newErrors.dataset = 'Please select a dataset';
        }

        if (formData.totalBudget < 100) {
            newErrors.budget = 'Minimum budget is 100 HBAR';
        } else if (formData.totalBudget > 100000) {
            newErrors.budget = 'Maximum budget is 100,000 HBAR';
        }

        if (formData.template === 'custom' && !formData.customScriptUrl.trim()) {
            newErrors.customScript = 'Custom script URL is required for custom template';
        }

        if (formData.metricThreshold < 0 || formData.metricThreshold > 1) {
            newErrors.metric = 'Metric threshold must be between 0 and 1';
        }

        if (formData.epochs < 1 || formData.epochs > 100) {
            newErrors.epochs = 'Epochs must be between 1 and 100';
        }

        if (formData.batchSize < 1 || formData.batchSize > 128) {
            newErrors.batchSize = 'Batch size must be between 1 and 128';
        }

        if (formData.learningRate < 0.000001 || formData.learningRate > 0.1) {
            newErrors.learningRate = 'Learning rate must be between 1e-6 and 0.1';
        }

        if (formData.maxLength < 32 || formData.maxLength > 512) {
            newErrors.maxLength = 'Max length must be between 32 and 512';
        }

        if (formData.numLabels < 2 || formData.numLabels > 100) {
            newErrors.numLabels = 'Number of labels must be between 2 and 100';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Create config object matching the BERT template format
            const trainingConfig = {
                // Model settings
                model_name: formData.modelArchitecture,
                num_labels: formData.numLabels,

                // Data settings
                data_format: formData.dataFormat,
                max_length: formData.maxLength,
                val_split: formData.validationSplit,

                // Training settings
                batch_size: formData.batchSize,
                learning_rate: formData.learningRate,
                epochs: formData.epochs,
                weight_decay: formData.weightDecay,
                max_grad_norm: formData.maxGradNorm,
                patience: formData.earlyStoppingPatience,

                // Output settings
                checkpoint_dir: './checkpoints'
            };

            const jobData = {
                title: formData.title,
                description: formData.description,
                datasetToken: formData.datasetToken,
                template: formData.template,
                customScriptUrl: formData.customScriptUrl,
                trainingConfig,
                metricType: formData.metricType,
                metricThreshold: formData.metricThreshold,
                totalBudget: formData.totalBudget,
                deadline: formData.deadline
            };

            console.log('Submitting job:', jobData);

            // Make API call to create job
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create job');
            }

            const result = await response.json();
            console.log('Job created successfully:', result);

            alert('🎉 Job posted successfully! Compute providers will start bidding soon.');
            router.push('/jobs');

        } catch (error) {
            console.error('Failed to submit job:', error);
            alert(`❌ Failed to post job: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold bg-gradient-to-r text-black bg-clip-text mb-3">
                        Post ML Training Job
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Define your requirements and let compute providers bid
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">
                                    Job Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => updateForm('title', e.target.value)}
                                    placeholder="e.g., Fine-tune BERT for Customer Review Classification"
                                    className={`w-full bg-white border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`}
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                <p className="text-sm text-gray-600 mt-2">
                                    A clear, descriptive title helps attract the right compute providers
                                </p>
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => updateForm('description', e.target.value)}
                                    placeholder="Provide additional context about your training requirements..."
                                    rows={4}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dataset Selection */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Database className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Select Dataset</h2>
                        </div>

                        {/* Dataset Format Info */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-800 mb-1">Dataset Format Requirements</h4>
                                    <p className="text-sm text-blue-700 mb-2">
                                        Your dataset should be in one of these formats:
                                    </p>
                                    <div className="space-y-2 text-xs text-blue-600">
                                        <div>
                                            <strong>JSONL format:</strong> {"{"}"text": "sample text", "label": 0{"}"}
                                        </div>
                                        <div>
                                            <strong>CSV format:</strong> Columns named "text" and "label"
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {errors.dataset && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">{errors.dataset}</p>
                            </div>
                        )}

                        {loadingDatasets ? (
                            <div className="py-8 text-center text-gray-500">
                                <Database className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                                Loading available datasets...
                            </div>
                        ) : datasets.length === 0 ? (
                            <div className="py-8 text-center">
                                <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No datasets available</h3>
                                <p className="text-gray-600 mb-4">
                                    You need to upload or purchase datasets before creating training jobs.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => router.push('/my-datasets/upload')}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Upload Dataset
                                    </button>
                                    <button
                                        onClick={() => router.push('/datasets')}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Browse Datasets
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-sm text-gray-600 mb-4">
                                    Select from {datasets.length} available dataset{datasets.length !== 1 ? 's' : ''}:
                                </div>
                                <div className="grid gap-4">
                                    {datasets.map((dataset) => (
                                        <div
                                            key={dataset.id}
                                            onClick={() => selectDataset(dataset)}
                                            className={`p-5 bg-gray-50 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                                                selectedDataset?.id === dataset.id
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-semibold text-lg text-gray-900">{dataset.title}</div>
                                                {dataset.price > 0 && (
                                                    <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                                                        {dataset.price} HBAR
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-6 text-sm text-gray-600 mb-2">
                                                <span>📊 {dataset.size}</span>
                                                <span>🏷️ {dataset.categories}</span>
                                                <span>⭐ {dataset.rating}</span>
                                                <span>🔧 {dataset.format}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{dataset.description}</p>
                                            {dataset.tags && (
                                                <div className="flex flex-wrap gap-1">
                                                    {dataset.tags.split(',').map((tag, index) => (
                                                        <span key={index} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                                            {tag.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {selectedDataset?.id === dataset.id && (
                                                <div className="mt-3 pt-3 border-t border-indigo-200">
                                                    <div className="flex items-center gap-2 text-sm text-indigo-700">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>Selected for training</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Training Configuration */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Cpu className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Training Configuration</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Template Selection */}
                            <div>
                                <label className="block text-gray-700 mb-3 font-medium">
                                    Select Training Template
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {templates.map((template) => (
                                        <div
                                            key={template.id}
                                            onClick={() => !template.disabled && updateForm('template', template.id)}
                                            className={`p-5 bg-gray-50 border-2 rounded-xl transition-all ${
                                                template.disabled
                                                    ? 'border-gray-200 opacity-50 cursor-not-allowed'
                                                    : `cursor-pointer hover:shadow-lg ${
                                                        formData.template === template.id
                                                            ? 'border-indigo-500 bg-indigo-50 shadow-indigo-100'
                                                            : 'border-gray-200 hover:border-indigo-300'
                                                    }`
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="text-3xl">{template.icon}</div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg mb-1 text-gray-900">
                                                        {template.name}
                                                        {template.disabled && <span className="text-sm text-gray-500 ml-2">(Coming Soon)</span>}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{template.estimatedTime}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {template.gpuRequired ? (
                                                                <>
                                                                    <Zap className="w-3 h-3 text-yellow-600" />
                                                                    <span>GPU Required</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Cpu className="w-3 h-3 text-green-600" />
                                                                    <span>CPU Compatible</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {!template.disabled && formData.template === template.id && (
                                                    <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Custom Script Section */}
                                {formData.template === 'custom' && (
                                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-yellow-800 mb-1">Custom Script Requirements</h4>
                                                <p className="text-sm text-yellow-700 mb-2">
                                                    Your script must follow our training interface and include proper logging.
                                                </p>
                                                <div className="text-xs text-yellow-600">
                                                    • Accept dataset path as command line argument<br/>
                                                    • Output metrics to stdout in JSON format<br/>
                                                    • Save model to specified output directory
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Model Selection for NLP */}
                            {(formData.template === 'nlp' || formData.template === 'sentiment') && (
                                <div>
                                    <label className="block text-gray-700 mb-3 font-medium">
                                        Select Model Architecture
                                    </label>
                                    <div className="space-y-3">
                                        {Object.entries(nlpModels)
                                            .filter(([modelId]) => {
                                                const selectedTemplate = templates.find(t => t.id === formData.template);
                                                return selectedTemplate?.models?.includes(modelId);
                                            })
                                            .map(([modelId, model]) => (
                                            <div
                                                key={modelId}
                                                onClick={() => updateForm('modelArchitecture', modelId)}
                                                className={`p-4 bg-gray-50 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                                    formData.modelArchitecture === modelId
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-gray-200 hover:border-indigo-300'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold text-gray-900">{model.name}</h4>
                                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                                                {model.params}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                                                    </div>
                                                    {formData.modelArchitecture === modelId && (
                                                        <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 ml-3" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Hyperparameters */}
                            <div>
                                <label className="block text-gray-700 mb-3 font-medium">
                                    Hyperparameters
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            Epochs
                                            <span className="text-xs text-gray-500 ml-1">(1-100)</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.epochs}
                                            onChange={(e) => updateForm('epochs', parseInt(e.target.value) || 1)}
                                            min="1"
                                            max="100"
                                            className={`w-full bg-white border ${errors.epochs ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 text-gray-900`}
                                        />
                                        {errors.epochs && <p className="text-red-500 text-xs mt-1">{errors.epochs}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            Batch Size
                                            <span className="text-xs text-gray-500 ml-1">(1-128)</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.batchSize}
                                            onChange={(e) => updateForm('batchSize', parseInt(e.target.value) || 1)}
                                            min="1"
                                            max="128"
                                            className={`w-full bg-white border ${errors.batchSize ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 text-gray-900`}
                                        />
                                        {errors.batchSize && <p className="text-red-500 text-xs mt-1">{errors.batchSize}</p>}
                                        <p className="text-xs text-gray-500 mt-1">Reduce if you get memory errors</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            Learning Rate
                                            <span className="text-xs text-gray-500 ml-1">(1e-6 to 0.1)</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.learningRate}
                                            onChange={(e) => updateForm('learningRate', parseFloat(e.target.value) || 0.00002)}
                                            step="0.000001"
                                            min="0.000001"
                                            max="0.1"
                                            className={`w-full bg-white border ${errors.learningRate ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 text-gray-900`}
                                        />
                                        {errors.learningRate && <p className="text-red-500 text-xs mt-1">{errors.learningRate}</p>}
                                        <p className="text-xs text-gray-500 mt-1">2e-5 is standard for BERT</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            Max Text Length (tokens)
                                            <span className="text-xs text-gray-500 ml-1">(32-512)</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.maxLength}
                                            onChange={(e) => updateForm('maxLength', parseInt(e.target.value) || 128)}
                                            min="32"
                                            max="512"
                                            step="32"
                                            className={`w-full bg-white border ${errors.maxLength ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 text-gray-900`}
                                        />
                                        {errors.maxLength && <p className="text-red-500 text-xs mt-1">{errors.maxLength}</p>}
                                        <p className="text-xs text-gray-500 mt-1">128 for short texts, 256-512 for longer</p>
                                    </div>
                                </div>

                                {/* Dataset-specific settings */}
                                <div className="mt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">
                                                Number of Classes
                                                <span className="text-xs text-gray-500 ml-1">(2-100)</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.numLabels}
                                                onChange={(e) => updateForm('numLabels', parseInt(e.target.value) || 2)}
                                                min="2"
                                                max="100"
                                                className={`w-full bg-white border ${errors.numLabels ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 text-gray-900`}
                                            />
                                            {errors.numLabels && <p className="text-red-500 text-xs mt-1">{errors.numLabels}</p>}
                                            <p className="text-xs text-gray-500 mt-1">2 for binary, more for multi-class</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">
                                                Data Format
                                            </label>
                                            <select
                                                value={formData.dataFormat}
                                                onChange={(e) => updateForm('dataFormat', e.target.value)}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
                                            >
                                                <option value="jsonl">JSONL</option>
                                                <option value="csv">CSV</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Options */}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                                >
                                    {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    Advanced Options
                                </button>

                                {showAdvanced && (
                                    <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
                                        {formData.template === 'custom' && (
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Custom Training Script URL</label>
                                                <input
                                                    type="text"
                                                    value={formData.customScriptUrl}
                                                    onChange={(e) => updateForm('customScriptUrl', e.target.value)}
                                                    placeholder="https://your-storage.com/train.py"
                                                    className={`w-full bg-white border ${errors.customScript ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 text-gray-900`}
                                                />
                                                {errors.customScript && <p className="text-red-500 text-sm mt-1">{errors.customScript}</p>}
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Validation Split</label>
                                                <input
                                                    type="number"
                                                    value={formData.validationSplit}
                                                    onChange={(e) => updateForm('validationSplit', parseFloat(e.target.value) || 0.2)}
                                                    step="0.05"
                                                    min="0.1"
                                                    max="0.5"
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Early Stopping Patience</label>
                                                <input
                                                    type="number"
                                                    value={formData.earlyStoppingPatience}
                                                    onChange={(e) => updateForm('earlyStoppingPatience', parseInt(e.target.value) || 0)}
                                                    min="0"
                                                    max="50"
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Weight Decay (L2)</label>
                                                <input
                                                    type="number"
                                                    value={formData.weightDecay}
                                                    onChange={(e) => updateForm('weightDecay', parseFloat(e.target.value) || 0.01)}
                                                    step="0.001"
                                                    min="0"
                                                    max="0.1"
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Gradient Clipping</label>
                                                <input
                                                    type="number"
                                                    value={formData.maxGradNorm}
                                                    onChange={(e) => updateForm('maxGradNorm', parseFloat(e.target.value) || 1.0)}
                                                    step="0.1"
                                                    min="0.1"
                                                    max="5.0"
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Success Criteria */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Success Criteria</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">Target Metric</label>
                                <div className="flex gap-3 items-center">
                                    <select
                                        value={formData.metricType}
                                        onChange={(e) => updateForm('metricType', e.target.value)}
                                        className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
                                    >
                                        <option value="accuracy">Accuracy</option>
                                        <option value="f1">F1 Score (Weighted)</option>
                                        <option value="precision">Precision</option>
                                        <option value="recall">Recall</option>
                                        <option value="loss">Loss (lower is better)</option>
                                    </select>
                                    <span className="text-gray-600">
                                        {formData.metricType === 'loss' ? '≤' : '≥'}
                                    </span>
                                    <input
                                        type="number"
                                        value={formData.metricThreshold}
                                        onChange={(e) => updateForm('metricThreshold', parseFloat(e.target.value) || 0)}
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        className={`w-24 bg-white border ${errors.metric ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 text-gray-900`}
                                    />
                                </div>
                                {errors.metric && <p className="text-red-500 text-sm mt-1">{errors.metric}</p>}
                                <p className="text-sm text-gray-600 mt-2">
                                    Model must achieve this metric on validation set
                                </p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-700 mb-2">Recommended Thresholds</h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <div>• <strong>Sentiment Analysis:</strong> Accuracy ≥ 0.85, F1 ≥ 0.83</div>
                                    <div>• <strong>Topic Classification:</strong> Accuracy ≥ 0.80, F1 ≥ 0.78</div>
                                    <div>• <strong>Intent Detection:</strong> Accuracy ≥ 0.90, F1 ≥ 0.88</div>
                                    <div>• <strong>Spam Detection:</strong> Precision ≥ 0.95</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Budget Configuration */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Budget & Payment</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium">
                                    Total Budget (HBAR) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.totalBudget}
                                    onChange={(e) => updateForm('totalBudget', parseInt(e.target.value) || 0)}
                                    min="100"
                                    className={`w-full bg-white border ${errors.budget ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900`}
                                />
                                {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
                                <p className="text-sm text-gray-600 mt-2">
                                    Total HBAR to be distributed upon successful completion
                                </p>
                            </div>

                            {/* Budget Breakdown */}
                            <div className="bg-gray-50 rounded-xl p-5">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Compute Provider</span>
                                        <span className="font-medium text-gray-900">{budget.compute.toFixed(0)} HBAR ({((budget.compute/budget.total)*100).toFixed(1)}%)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Protocol Fee</span>
                                        <span className="font-medium text-gray-900">{budget.protocol.toFixed(0)} HBAR (5%)</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t border-gray-200 text-lg">
                                        <span className="text-gray-700">Total</span>
                                        <span className="font-semibold text-gray-900">{budget.total.toFixed(0)} HBAR</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-700">
                                    💡 The protocol fee helps maintain the marketplace and fund development.
                                    Compute providers will bid for their portion (currently {budget.compute.toFixed(0)} HBAR).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Section */}
                    <div className="text-center pt-6 pb-10">
                        <button
                            onClick={() => setShowPreview(true)}
                            disabled={isLoading}
                            className="mr-4 px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Preview
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Posting Job...</span>
                                </div>
                            ) : (
                                `Post Job (${budget.total.toFixed(0)} HBAR)`
                            )}
                        </button>
                        <p className="text-sm text-gray-600 mt-4">
                            {isLoading
                                ? 'Processing your job posting...'
                                : 'Your HBAR will be locked in escrow until job completion'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-gray-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-900">Job Preview</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h4 className="text-lg font-semibold mb-2 text-gray-900">{formData.title || 'Untitled Job'}</h4>
                                <p className="text-gray-600">{formData.description || 'No description provided'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Dataset</p>
                                    <p className="font-medium text-gray-900">{selectedDataset?.title || 'No dataset selected'}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Training Template</p>
                                    <p className="font-medium text-gray-900">
                                        {templates.find(t => t.id === formData.template)?.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Model</p>
                                    <p className="font-medium text-gray-900">
                                        {nlpModels[formData.modelArchitecture]?.name || formData.modelArchitecture}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Epochs</p>
                                    <p className="font-medium text-gray-900">{formData.epochs}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Batch Size</p>
                                    <p className="font-medium text-gray-900">{formData.batchSize}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Learning Rate</p>
                                    <p className="font-medium text-gray-900">{formData.learningRate}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Max Length</p>
                                    <p className="font-medium text-gray-900">{formData.maxLength} tokens</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Success Criteria</p>
                                    <p className="font-medium text-gray-900">
                                        {formData.metricType} {formData.metricType === 'loss' ? '≤' : '≥'} {formData.metricThreshold}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Budget</p>
                                    <p className="font-medium text-gray-900">{budget.total} HBAR</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Deadline</p>
                                    <p className="font-medium text-gray-900">{formData.deadline} hours</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h5 className="font-medium mb-3 text-gray-900">Budget Breakdown</h5>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Compute Provider</span>
                                        <span className="text-gray-900">{budget.compute.toFixed(0)} HBAR</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Protocol Fee</span>
                                        <span className="text-gray-900">{budget.protocol.toFixed(0)} HBAR</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h5 className="font-medium mb-3 text-gray-900">Training Configuration</h5>
                                <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs">
                                    <pre>{JSON.stringify({
                                        model_name: formData.modelArchitecture,
                                        num_labels: formData.numLabels,
                                        data_format: formData.dataFormat,
                                        max_length: formData.maxLength,
                                        val_split: formData.validationSplit,
                                        batch_size: formData.batchSize,
                                        learning_rate: formData.learningRate,
                                        epochs: formData.epochs,
                                        weight_decay: formData.weightDecay,
                                        max_grad_norm: formData.maxGradNorm,
                                        patience: formData.earlyStoppingPatience
                                    }, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobPostForm;

