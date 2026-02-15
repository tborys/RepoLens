
export interface RepoInfo {
  owner: string;
  name: string;
  platform: 'github' | 'gitlab';
  url: string;
}

export interface FileNode {
  path: string;
  type: 'file' | 'dir';
  content?: string;
  size?: number;
}

export interface ApiEndpoint {
  path: string;
  methods: string[];
  parameters?: string[];
  responses?: string[];
  type: 'rest' | 'websocket' | 'graphql' | 'grpc';
}

export interface Dependency {
  name: string;
  version: string;
  type: string;
  status: 'current' | 'outdated' | 'critical';
  latestKnown?: string;
}

export interface DimensionScore {
  score: number;
  severity: 'Healthy' | 'Moderate' | 'Risk' | 'Critical';
  explanation: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface HealthModel {
  repo: RepoInfo;
  runtime: {
    language: string;
    version?: string;
  };
  dependencies: Dependency[];
  testPosture: {
    hasTests: boolean;
    frameworks: string[];
    signal: string;
  };
  architecture: {
    patterns: string[];
    entryPoints: string[];
    components: string[];
    description: string;
  };
  apiInventory: {
    endpoints: ApiEndpoint[];
    documentation: string[];
    specs?: string[];
  };
  docsHealth: {
    hasReadme: boolean;
    hasADR: boolean;
    missing: string[];
  };
  scoring: Record<string, DimensionScore>;
  overallScore: number;
  timestamp: string;
}

export interface AIAnalysis {
  behavioralSummary: string;
  executiveSummary: string;
  riskPrioritization: string[];
  architecturalExplanation: string;
  recommendations: string[];
  dependencyInsights: {
    outdated: { name: string; current: string; latest: string; impact: string }[];
  };
}
