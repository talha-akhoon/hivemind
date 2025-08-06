export enum DatasetLicense {
  COMMERCIAL_UNLIMITED = 'commercial-unlimited',
  COMMERCIAL_ATTRIBUTION = 'commercial-attribution',
  RESEARCH_ONLY = 'research-only',
  SINGLE_PROJECT = 'single-project',
  ENTERPRISE = 'enterprise',
  LIMITED_COMMERCIAL = 'limited-commercial',
}

export const DatasetLicenseLabels: Record<DatasetLicense, string> = {
  [DatasetLicense.COMMERCIAL_UNLIMITED]: 'Commercial Use - Unlimited',
  [DatasetLicense.COMMERCIAL_ATTRIBUTION]: 'Commercial Use - Attribution Required',
  [DatasetLicense.RESEARCH_ONLY]: 'Research/Academic Only',
  [DatasetLicense.SINGLE_PROJECT]: 'Single Project License',
  [DatasetLicense.ENTERPRISE]: 'Enterprise License (Custom Terms)',
  [DatasetLicense.LIMITED_COMMERCIAL]: 'Limited Commercial Use',
};

export enum DatasetDomain {
  ENTERTAINMENT = 'entertainment',
  FINANCE = 'finance',
  HEALTHCARE = 'healthcare',
  RETAIL = 'retail',
  TECHNOLOGY = 'technology',
  AUTOMOTIVE = 'automotive',
  REAL_ESTATE = 'real-estate',
  EDUCATION = 'education',
  GOVERNMENT = 'government',
  SOCIAL_MEDIA = 'social-media',
  TELECOMMUNICATIONS = 'telecommunications',
  ENERGY = 'energy',
  MANUFACTURING = 'manufacturing',
  AGRICULTURE = 'agriculture',
  OTHER = 'other',
}

export const DatasetDomainLabels: Record<DatasetDomain, string> = {
  [DatasetDomain.ENTERTAINMENT]: 'Entertainment & Media',
  [DatasetDomain.FINANCE]: 'Finance & Banking',
  [DatasetDomain.HEALTHCARE]: 'Healthcare & Life Sciences',
  [DatasetDomain.RETAIL]: 'Retail & E-commerce',
  [DatasetDomain.TECHNOLOGY]: 'Technology & Software',
  [DatasetDomain.AUTOMOTIVE]: 'Automotive & Transportation',
  [DatasetDomain.REAL_ESTATE]: 'Real Estate',
  [DatasetDomain.EDUCATION]: 'Education',
  [DatasetDomain.GOVERNMENT]: 'Government & Public',
  [DatasetDomain.SOCIAL_MEDIA]: 'Social Media',
  [DatasetDomain.TELECOMMUNICATIONS]: 'Telecommunications',
  [DatasetDomain.ENERGY]: 'Energy & Utilities',
  [DatasetDomain.MANUFACTURING]: 'Manufacturing',
  [DatasetDomain.AGRICULTURE]: 'Agriculture',
  [DatasetDomain.OTHER]: 'Other',
};

function makeOptions<T extends string>(labels: Record<T, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value: value as T, label: label as string }));
}

export const DatasetLicenseOptions = makeOptions<DatasetLicense>(DatasetLicenseLabels);
export const DatasetDomainOptions = makeOptions<DatasetDomain>(DatasetDomainLabels);
