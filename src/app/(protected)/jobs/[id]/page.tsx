'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Target,
  Database,
  FileText,
  User,
  Download,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Cpu,
  Calendar,
  Activity,
  Settings,
  BarChart3,
  ExternalLink
} from 'lucide-react';

interface Job {
  id: number;
  title: string;
  description?: string;
  user_id: string;
  dataset_id: number;
  template: 'nlp' | 'sentiment' | 'ner' | 'custom';
  custom_script_url?: string;
  training_config: {
    model_name: string;
    num_labels: number;
    data_format: string;
    max_length: number;
    val_split: number;
    batch_size: number;
    learning_rate: number;
    epochs: number;
    weight_decay: number;
    max_grad_norm: number;
    patience: number;
    checkpoint_dir: string;
  };
  metric_type: string;
  metric_threshold: number;
  total_budget: number;
  compute_budget: number;
  protocol_fee: number;
  status: 'active' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  results?: {
    final_metrics?: Record<string, number>;
    model_url?: string;
    logs_url?: string;
    training_time?: number;
    provider_id?: string;
    submitted_at?: string;
    meets_threshold?: boolean;
  };
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  active: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Play,
    label: 'Active',
    description: 'Job is available for compute providers to pick up'
  },
  in_progress: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Clock,
    label: 'In Progress',
    description: 'Training is currently running on a compute provider'
  },
  completed: {
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: CheckCircle,
    label: 'Completed',
    description: 'Training completed successfully'
  },
  failed: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    label: 'Failed',
    description: 'Training failed or was terminated'
  },
  cancelled: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: AlertCircle,
    label: 'Cancelled',
    description: 'Job was cancelled by the user'
  }
};

const templateConfig = {
  nlp: { color: 'bg-purple-100 text-purple-800', label: 'Natural Language Processing' },
  sentiment: { color: 'bg-blue-100 text-blue-800', label: 'Sentiment Analysis' },
  ner: { color: 'bg-orange-100 text-orange-800', label: 'Named Entity Recognition' },
  custom: { color: 'bg-gray-100 text-gray-800', label: 'Custom Training Script' }
};

export default function JobDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const jobId = params.id as string;

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/${jobId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Job not found');
        } else {
          setError('Failed to load job details');
        }
        return;
      }

      const data = await response.json();
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId, fetchJob]);

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/jobs"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const StatusIcon = statusConfig[job.status].icon;
  const isOwner = user?.id === job.user_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/jobs"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Jobs
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              {job.description && (
                <p className="text-gray-600 text-lg mb-4">{job.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[job.status].color}`}>
                  <StatusIcon className="w-4 h-4 mr-2" />
                  {statusConfig[job.status].label}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${templateConfig[job.template].color}`}>
                  {templateConfig[job.template].label}
                </span>
                {isOwner && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <User className="w-4 h-4 mr-2" />
                    Your Job
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 lg:mt-0 lg:ml-6">
              {job.status === 'completed' && isOwner && (
                <Link
                  href={`/api/jobs/${job.id}/model`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Model
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Status Description */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-start">
            <StatusIcon className="w-6 h-6 text-gray-400 mt-1 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Status: {statusConfig[job.status].label}
              </h3>
              <p className="text-gray-600">{statusConfig[job.status].description}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Budget Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Budget Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{formatBudget(job.total_budget)}</div>
                    <div className="text-sm text-gray-500">Total Budget</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatBudget(job.compute_budget)}</div>
                    <div className="text-sm text-gray-500">Compute Budget</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatBudget(job.protocol_fee)}</div>
                    <div className="text-sm text-gray-500">Protocol Fee (5%)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Configuration */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Training Configuration
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <div className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                      {job.training_config.model_name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Labels</label>
                    <div className="text-sm text-gray-900">{job.training_config.num_labels}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Sequence Length</label>
                    <div className="text-sm text-gray-900">{job.training_config.max_length}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Validation Split</label>
                    <div className="text-sm text-gray-900">{(job.training_config.val_split * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Size</label>
                    <div className="text-sm text-gray-900">{job.training_config.batch_size}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Learning Rate</label>
                    <div className="text-sm text-gray-900">{job.training_config.learning_rate}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Epochs</label>
                    <div className="text-sm text-gray-900">{job.training_config.epochs}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight Decay</label>
                    <div className="text-sm text-gray-900">{job.training_config.weight_decay}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Results */}
            {job.results && (job.results.final_metrics || job.results.training_time) && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Training Results
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {job.results.training_time && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Training Duration</label>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatDuration(job.results.training_time)}
                        </div>
                      </div>
                    )}
                    {job.results.meets_threshold !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meets Threshold</label>
                        <div className={`text-lg font-semibold ${job.results.meets_threshold ? 'text-green-600' : 'text-red-600'}`}>
                          {job.results.meets_threshold ? 'Yes' : 'No'}
                        </div>
                      </div>
                    )}
                  </div>

                  {job.results.final_metrics && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Performance Metrics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(job.results.final_metrics).map(([key, value]) => (
                          <div key={key} className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm font-medium text-gray-700 capitalize">
                              {key.replace(/_/g, ' ')}
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {value.toFixed(4)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.results.provider_id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Compute Provider</label>
                      <div className="text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded">
                        {job.results.provider_id}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Custom Script */}
            {job.template === 'custom' && job.custom_script_url && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Custom Training Script
                  </h3>
                </div>
                <div className="p-6">
                  <a
                    href={job.custom_script_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Custom Script
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Job Overview</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center">
                  <Database className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Dataset ID</div>
                    <div className="text-sm text-gray-900">{job.dataset_id}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Target Metric</div>
                    <div className="text-sm text-gray-900">
                      {job.metric_type}: {job.metric_threshold}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Created</div>
                    <div className="text-sm text-gray-900">{formatDate(job.created_at)}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Activity className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Last Updated</div>
                    <div className="text-sm text-gray-900">{formatDate(job.updated_at)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href={`/datasets/${job.dataset_id}`}
                  className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  View Dataset
                </Link>
                {job.status === 'completed' && job.results?.logs_url && (
                  <a
                    href={job.results.logs_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View Training Logs
                  </a>
                )}
              </div>
            </div>

            {/* Provider Info */}
            {job.status !== 'active' && job.results?.provider_id && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Cpu className="w-5 h-5 mr-2" />
                    Compute Provider
                  </h3>
                </div>
                <div className="p-6">
                  <div className="text-sm font-mono text-gray-600 bg-gray-50 p-3 rounded break-all">
                    {job.results.provider_id}
                  </div>
                  {job.results.submitted_at && (
                    <div className="mt-3 text-sm text-gray-500">
                      Submitted: {formatDate(job.results.submitted_at)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
