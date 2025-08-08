'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  Clock,
  DollarSign,
  Eye,
  Filter,
  Search,
  Target,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  User,
  Database,
  FileText,
  ExternalLink,
  Cpu
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
  active: { color: 'bg-green-100 text-green-800', icon: Play, label: 'Active' },
  in_progress: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'In Progress' },
  completed: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Completed' },
  failed: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
  cancelled: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Cancelled' }
};

const templateConfig = {
  nlp: { color: 'bg-purple-100 text-purple-800', label: 'NLP' },
  sentiment: { color: 'bg-blue-100 text-blue-800', label: 'Sentiment Analysis' },
  ner: { color: 'bg-orange-100 text-orange-800', label: 'Named Entity Recognition' },
  custom: { color: 'bg-gray-100 text-gray-800', label: 'Custom' }
};

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedJobs, setExpandedJobs] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortJobs = () => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesTemplate = templateFilter === 'all' || job.template === templateFilter;

      return matchesSearch && matchesStatus && matchesTemplate;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof Job];
      let bValue = b[sortBy as keyof Job];

      if (sortBy === 'total_budget') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

    return filtered;
  };

  const toggleJobExpansion = (jobId: number) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredJobs = filterAndSortJobs();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Training Jobs</h1>
              <p className="mt-2 text-gray-600">
                Browse available machine learning training jobs on the HiveMind network
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/jobs/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Zap className="w-4 h-4 mr-2" />
                Create Job
              </Link>
            </div>
          </div>
        </div>

        {/* Info Alert Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Cpu className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                💰 Earn Money with Your Spare GPU!
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Introducing the <strong>HiveMind Protocol CLI</strong> - a smart solution that uses AI agents to automatically determine whether ML training jobs will be profitable for your compute instance. Just install it and let it work while you earn!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://www.npmjs.com/package/hivemind-protocol-cli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Install via NPM
                </a>
                <span className="text-xs text-blue-700 self-center">
                  npm install -g hivemind-protocol-cli
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                🚀 Set up once, earn passively - the CLI handles profitable job selection automatically!
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Jobs</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {jobs.filter(job => job.status === 'active').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {jobs.filter(job => job.status === 'in_progress').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {jobs.filter(job => job.status === 'completed').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Budget</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatBudget(jobs.reduce((sum, job) => sum + job.total_budget, 0))}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {showFilters ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
                </button>
              </div>
              <div className="mt-3 sm:mt-0">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="total_budget-desc">Highest Budget</option>
                  <option value="total_budget-asc">Lowest Budget</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                </select>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                    <select
                      value={templateFilter}
                      onChange={(e) => setTemplateFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Templates</option>
                      <option value="nlp">NLP</option>
                      <option value="sentiment">Sentiment Analysis</option>
                      <option value="ner">Named Entity Recognition</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 13h8l-2 2-6-6-6 6-2-2h8z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const StatusIcon = statusConfig[job.status].icon;
              const isExpanded = expandedJobs.has(job.id);
              const isOwner = user?.id === job.user_id;

              return (
                <div key={job.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {job.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[job.status].color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[job.status].label}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${templateConfig[job.template].color}`}>
                            {templateConfig[job.template].label}
                          </span>
                          {isOwner && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <User className="w-3 h-3 mr-1" />
                              Your Job
                            </span>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {job.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            Budget: {formatBudget(job.total_budget)}
                          </div>
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            Target {job.metric_type}: {job.metric_threshold}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(job.created_at)}
                          </div>
                          <div className="flex items-center">
                            <Database className="w-4 h-4 mr-1" />
                            Dataset ID: {job.dataset_id}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex items-center space-x-2">
                        {job.status === 'completed' && isOwner && (
                          <Link
                            href={`/api/jobs/${job.id}/model`}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Download Model
                          </Link>
                        )}
                        <button
                          onClick={() => toggleJobExpansion(job.id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {isExpanded ? (
                            <>
                              Hide Details
                              <ChevronDown className="ml-1 w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Show Details
                              <ChevronRight className="ml-1 w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Training Configuration */}
                          <div>
                            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              Training Configuration
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Model:</span>
                                <span className="font-medium">{job.training_config.model_name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Labels:</span>
                                <span className="font-medium">{job.training_config.num_labels}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Max Length:</span>
                                <span className="font-medium">{job.training_config.max_length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Batch Size:</span>
                                <span className="font-medium">{job.training_config.batch_size}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Learning Rate:</span>
                                <span className="font-medium">{job.training_config.learning_rate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Epochs:</span>
                                <span className="font-medium">{job.training_config.epochs}</span>
                              </div>
                            </div>
                          </div>

                          {/* Budget Breakdown */}
                          <div>
                            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              Budget Breakdown
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Budget:</span>
                                <span className="font-medium">{formatBudget(job.total_budget)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Compute Budget:</span>
                                <span className="font-medium">{formatBudget(job.compute_budget)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Protocol Fee (5%):</span>
                                <span className="font-medium">{formatBudget(job.protocol_fee)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Results (if available) */}
                          {job.results && (job.results.final_metrics || job.results.training_time) && (
                            <div className="lg:col-span-2">
                              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Training Results
                              </h4>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  {job.results.training_time && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Training Time:</span>
                                      <span className="font-medium">{job.results.training_time}s</span>
                                    </div>
                                  )}
                                  {job.results.final_metrics && Object.entries(job.results.final_metrics).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-gray-600">{key}:</span>
                                      <span className="font-medium">{typeof value === 'number' ? value.toFixed(4) : value}</span>
                                    </div>
                                  ))}
                                  {job.results.meets_threshold !== undefined && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Meets Threshold:</span>
                                      <span className={`font-medium ${job.results.meets_threshold ? 'text-green-600' : 'text-red-600'}`}>
                                        {job.results.meets_threshold ? 'Yes' : 'No'}
                                      </span>
                                    </div>
                                  )}
                                  {job.results.provider_id && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Provider:</span>
                                      <span className="font-medium font-mono text-xs">{job.results.provider_id}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
