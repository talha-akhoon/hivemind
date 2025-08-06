"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Filter,
    Clock,
    DollarSign,
    Database,
    Target,
    Cpu,
    Zap,
    ChevronDown,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    PlayCircle,
    XCircle,
    Calendar,
    User,
    TrendingUp,
    FileText,
    Tag
} from 'lucide-react';

const JobsPage = () => {
    const router = useRouter();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);

    // Load jobs on component mount
    useEffect(() => {
        loadJobs();
    }, []);

    // Filter and sort jobs when filters change
    useEffect(() => {
        filterAndSortJobs();
    }, [jobs, searchTerm, selectedTemplate, selectedStatus, sortBy]);

    const loadJobs = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/jobs');

            if (response.ok) {
                const jobsData = await response.json();
                setJobs(jobsData);
            } else {
                console.error('Failed to load jobs');
                setJobs([]);
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortJobs = () => {
        let filtered = [...jobs];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(job =>
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply template filter
        if (selectedTemplate !== 'all') {
            filtered = filtered.filter(job => job.template === selectedTemplate);
        }

        // Apply status filter
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(job => job.status === selectedStatus);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'budget_high':
                    return b.total_budget - a.total_budget;
                case 'budget_low':
                    return a.total_budget - b.total_budget;
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        setFilteredJobs(filtered);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <PlayCircle className="w-4 h-4 text-blue-600" />;
            case 'in_progress':
                return <TrendingUp className="w-4 h-4 text-indigo-600" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'cancelled':
                return <AlertCircle className="w-4 h-4 text-gray-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_progress':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTemplateIcon = (template) => {
        switch (template) {
            case 'nlp':
                return '📝';
            case 'sentiment':
                return '😊';
            case 'ner':
                return '🏷️';
            case 'custom':
                return '⚙️';
            default:
                return '📊';
        }
    };

    const formatBudget = (budget) => {
        if (budget >= 1000) {
            return `${(budget / 1000).toFixed(1)}K`;
        }
        return budget.toString();
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else {
            return `${diffDays}d ago`;
        }
    };

    const templates = [
        { id: 'all', name: 'All Templates' },
        { id: 'nlp', name: 'NLP/Text Classification' },
        { id: 'sentiment', name: 'Sentiment Analysis' },
        { id: 'ner', name: 'Named Entity Recognition' },
        { id: 'custom', name: 'Custom Script' }
    ];

    const statuses = [
        { id: 'all', name: 'All Statuses' },
        { id: 'active', name: 'Active' },
        { id: 'in_progress', name: 'In Progress' },
        { id: 'completed', name: 'Completed' },
        { id: 'failed', name: 'Failed' },
        { id: 'cancelled', name: 'Cancelled' }
    ];

    const sortOptions = [
        { id: 'newest', name: 'Newest First' },
        { id: 'oldest', name: 'Oldest First' },
        { id: 'budget_high', name: 'Highest Budget' },
        { id: 'budget_low', name: 'Lowest Budget' },
        { id: 'title', name: 'Title A-Z' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading jobs...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-black mb-2">
                            ML Training Jobs
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Browse and manage machine learning training opportunities
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/jobs/create')}
                        className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Post New Job
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search jobs by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        {/* Quick Filters */}
                        <div className="flex gap-2">
                            <select
                                value={selectedTemplate}
                                onChange={(e) => setSelectedTemplate(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                            >
                                {templates.map(template => (
                                    <option key={template.id} value={template.id}>
                                        {template.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                            >
                                {statuses.map(status => (
                                    <option key={status.id} value={status.id}>
                                        {status.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Jobs Grid */}
                {filteredJobs.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Database className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {jobs.length === 0 ? 'No jobs available' : 'No jobs match your filters'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {jobs.length === 0
                                ? 'Be the first to post a machine learning training job!'
                                : 'Try adjusting your search criteria or filters.'
                            }
                        </p>
                        {jobs.length === 0 && (
                            <button
                                onClick={() => router.push('/jobs/create')}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-0.5 transition-all"
                            >
                                Post Your First Job
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Results Summary */}
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-gray-600">
                                Showing {filteredJobs.length} of {jobs.length} jobs
                            </p>
                        </div>

                        {/* Jobs List */}
                        <div className="grid gap-6">
                            {filteredJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer"
                                    onClick={() => router.push(`/jobs/${job.id}`)}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                                        {/* Main Content */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-2xl">
                                                        {getTemplateIcon(job.template)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                            {job.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{formatTimeAgo(job.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-1 ${getStatusColor(job.status)}`}>
                                                    {getStatusIcon(job.status)}
                                                    <span className="capitalize">{job.status.replace('_', ' ')}</span>
                                                </div>
                                            </div>

                                            {job.description && (
                                                <p className="text-gray-600 mb-4 line-clamp-2">
                                                    {job.description}
                                                </p>
                                            )}

                                            {/* Job Details */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <DollarSign className="w-4 h-4 text-green-600" />
                                                    <span>{formatBudget(job.total_budget)} HBAR</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Target className="w-4 h-4 text-blue-600" />
                                                    <span>{job.metric_type} ≥ {job.metric_threshold}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Cpu className="w-4 h-4 text-purple-600" />
                                                    <span className="capitalize">{job.template}</span>
                                                </div>
                                            </div>

                                            {/* Training Config Preview */}
                                            {job.training_config && (
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                        {job.training_config.model_name}
                                                    </span>
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                        {job.training_config.epochs} epochs
                                                    </span>
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                        batch: {job.training_config.batch_size}
                                                    </span>
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                        lr: {job.training_config.learning_rate}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Area */}
                                        <div className="flex flex-col items-end gap-2 min-w-fit">
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {formatBudget(job.compute_budget)}
                                                </div>
                                                <div className="text-sm text-gray-500">HBAR reward</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default JobsPage;
