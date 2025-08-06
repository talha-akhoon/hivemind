import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface SamplingOptions {
    method: 'head' | 'random' | 'stratified';
    sampleSize: number;
    stratifyColumn?: string;
    preserveHeaders?: boolean;
    maxFileSize?: number; // Max size in bytes for sample file
}

export class DataSampler {
    private defaultOptions: SamplingOptions = {
        method: 'head',
        sampleSize: 100,
        preserveHeaders: true,
        maxFileSize: 1024 * 1024 // 1MB
    };

    async createSample(file: File, options?: Partial<SamplingOptions>): Promise<File> {
        const opts = { ...this.defaultOptions, ...options };
        const fileType = this.detectFileType(file);

        switch (fileType) {
            case 'csv':
                return this.sampleCSV(file, opts);
            case 'json':
                return this.sampleJSON(file, opts);
            case 'jsonl':
                // JSONL is treated as JSON with line-by-line parsing
                const text = await file.text();
                const jsonLines = text.split('\n').filter(line => line.trim() !== '');
                const jsonData = jsonLines.map(line => JSON.parse(line));
                const sampledData = this.applySampling(jsonData, opts);
                const jsonlBlob = new Blob(sampledData.map(item => JSON.stringify(item) + '\n'), { type: 'application/jsonl' });
                return new File([jsonlBlob], `sample_${file.name}`, { type: 'application/jsonl' });
            case 'excel':
                return this.sampleExcel(file, opts);
            default:
                throw new Error(`Unsupported file type: ${file.type}`);
        }
    }

    private detectFileType(file: File): string {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension === 'csv' || file.type === 'text/csv') return 'csv';
        if (extension === 'json' || file.type === 'application/json') return 'json';
        if (extension === 'jsonl' || file.type === 'application/jsonl') return 'jsonl';
        if (['xlsx', 'xls'].includes(extension || '') ||
            file.type.includes('spreadsheet')) return 'excel';
        return 'unknown';
    }

    private async sampleCSV(file: File, options: SamplingOptions): Promise<File> {
        const text = await file.text();

        return new Promise((resolve, reject) => {
            Papa.parse(text, {
                header: true,
                complete: (results) => {
                    const sampled = this.applySampling(results.data, options);
                    const csv = Papa.unparse(sampled);
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const sampleFile = new File([blob], `sample_${file.name}`, { type: 'text/csv' });
                    resolve(sampleFile);
                },
                error: reject
            });
        });
    }

    private async sampleJSON(file: File, options: SamplingOptions): Promise<File> {
        const text = await file.text();
        const data = JSON.parse(text);

        let sampled;
        if (Array.isArray(data)) {
            sampled = this.applySampling(data, options);
        } else if (data.data && Array.isArray(data.data)) {
            // Handle nested data structure
            sampled = { ...data, data: this.applySampling(data.data, options) };
        } else {
            // For non-array JSON, return a redacted version
            sampled = this.redactObject(data, options.sampleSize);
        }

        const json = JSON.stringify(sampled, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        return new File([blob], `sample_${file.name}`, { type: 'application/json' });
    }

    private async sampleExcel(file: File, options: SamplingOptions): Promise<File> {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });

        const newWorkbook = XLSX.utils.book_new();

        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            const sampled = this.applySampling(data, options);
            const newSheet = XLSX.utils.json_to_sheet(sampled);
            XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
        }

        const excelBuffer = XLSX.write(newWorkbook, { type: 'array', bookType: 'xlsx' });
        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        return new File([blob], `sample_${file.name}`, { type: blob.type });
    }

    private applySampling(data: any[], options: SamplingOptions): any[] {
        if (data.length <= options.sampleSize) return data;

        switch (options.method) {
            case 'head':
                return data.slice(0, options.sampleSize);

            case 'random':
                return this.randomSample(data, options.sampleSize);

            case 'stratified':
                if (!options.stratifyColumn) {
                    return this.randomSample(data, options.sampleSize);
                }
                return this.stratifiedSample(data, options.sampleSize, options.stratifyColumn);

            default:
                return data.slice(0, options.sampleSize);
        }
    }

    private randomSample(data: any[], size: number): any[] {
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, size);
    }

    private stratifiedSample(data: any[], size: number, column: string): any[] {
        // Group by column value
        const groups = data.reduce((acc, item) => {
            const key = item[column] || 'unknown';
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {} as Record<string, any[]>);

        // Calculate samples per group
        const groupCount = Object.keys(groups).length;
        const samplesPerGroup = Math.floor(size / groupCount);
        const remainder = size % groupCount;

        const sampled: any[] = [];
        let extraSamples = remainder;

        for (const [key, group] of Object.entries(groups)) {
            const groupSize = samplesPerGroup + (extraSamples-- > 0 ? 1 : 0);
            const groupSample = this.randomSample(group, Math.min(groupSize, group.length));
            sampled.push(...groupSample);
        }

        return sampled;
    }

    private redactObject(obj: any, maxKeys: number): any {
        if (typeof obj !== 'object' || obj === null) return obj;

        const keys = Object.keys(obj);
        const sampleKeys = keys.slice(0, maxKeys);
        const redacted: any = {};

        for (const key of sampleKeys) {
            if (typeof obj[key] === 'object') {
                redacted[key] = this.redactObject(obj[key], Math.floor(maxKeys / 2));
            } else {
                redacted[key] = obj[key];
            }
        }

        if (keys.length > maxKeys) {
            redacted['_sample_note'] = `${keys.length - maxKeys} additional fields hidden in sample`;
        }

        return redacted;
    }

    // Generate sample metadata for display
    generateSampleMetadata(originalSize: number, sampleSize: number): object {
        return {
            originalRows: originalSize,
            sampleRows: sampleSize,
            samplePercentage: ((sampleSize / originalSize) * 100).toFixed(2),
            samplingMethod: this.defaultOptions.method,
            createdAt: new Date().toISOString()
        };
    }
}
