
import { FileNode, HealthModel, Dependency, RepoInfo, ApiEndpoint } from '../types';
import { fetchFileContent } from './githubService';

export async function performDeterministicAnalysis(
  repo: RepoInfo,
  tree: FileNode[],
  token?: string,
  onProgress?: (msg: string) => void
): Promise<Omit<HealthModel, 'scoring' | 'overallScore' | 'timestamp'>> {
  
  const analysis: Omit<HealthModel, 'scoring' | 'overallScore' | 'timestamp'> = {
    repo,
    runtime: { language: 'Unknown' },
    dependencies: [] as Dependency[],
    testPosture: { hasTests: false, frameworks: [], signal: 'None detected' },
    architecture: { patterns: [], entryPoints: [], components: [], description: '' },
    apiInventory: { endpoints: [], documentation: [], specs: [] },
    docsHealth: { hasReadme: false, hasADR: false, missing: [] }
  };

  // 1. Language and Runtime
  const pkgFile = tree.find(f => f.path === 'package.json');
  if (pkgFile) {
    onProgress?.("READ: Parsing package.json manifest for runtime constraints...");
    analysis.runtime.language = 'Node.js';
    const pkg = await fetchFileContent(repo, 'package.json', token);
    try {
      const data = JSON.parse(pkg);
      if (data.engines?.node) analysis.runtime.version = data.engines.node;
      
      const deps = { ...(data.dependencies || {}), ...(data.devDependencies || {}) };
      analysis.dependencies = Object.entries(deps).map(([name, ver]) => ({
        name,
        version: ver as string,
        type: 'npm',
        status: 'current'
      }));
    } catch (e) {}
  }

  // 2. Intelligent API Route Detection
  onProgress?.("GREP: Scanning directory signatures for API patterns...");
  
  const seenRoutes = new Map<string, ApiEndpoint>();

  // Look for Next.js App Router style routes
  const routeFiles = tree.filter(f => f.path.endsWith('route.ts') || f.path.endsWith('route.js'));
  for (const file of routeFiles.slice(0, 10)) {
    onProgress?.(`READ: Analysing route logic in ${file.path}`);
    const content = await fetchFileContent(repo, file.path, token);
    const parts = file.path.split('/');
    const apiIndex = parts.indexOf('api');
    if (apiIndex !== -1) {
      const routePath = '/' + parts.slice(apiIndex, parts.length - 1).join('/');
      const methods: string[] = [];
      if (content.includes('export async function GET')) methods.push('GET');
      if (content.includes('export async function POST')) methods.push('POST');
      if (content.includes('export async function PUT')) methods.push('PUT');
      if (content.includes('export async function DELETE')) methods.push('DELETE');
      if (content.includes('export async function PATCH')) methods.push('PATCH');
      
      seenRoutes.set(routePath, {
        path: routePath,
        methods: methods.length > 0 ? methods : ['GET'],
        type: 'rest'
      });
    }
  }

  // WebSocket Detection
  onProgress?.("GREP: Searching for WebSocket and real-time protocol signatures...");
  const wsFiles = tree.filter(f => 
    f.path.includes('socket') || 
    f.path.includes('ws') || 
    f.path.includes('subscription')
  );
  for (const file of wsFiles.slice(0, 3)) {
    onProgress?.(`READ: Inspecting real-time channel logic in ${file.path}`);
    const content = await fetchFileContent(repo, file.path, token);
    if (content.includes('io.on') || content.includes('new WebSocket') || content.includes('wss:')) {
      seenRoutes.set('Real-time Channel', {
        path: file.path,
        methods: ['WSS'],
        type: 'websocket'
      });
      analysis.architecture.patterns.push('WebSocket/Event-Driven');
    }
  }

  analysis.apiInventory.endpoints = Array.from(seenRoutes.values());

  // 3. Architecture Deep Scan
  onProgress?.("SCAN: Evaluating directory hierarchy for architectural patterns...");
  const srcDirs = tree.filter(f => f.type === 'dir' && (f.path.startsWith('src') || f.path.startsWith('app') || f.path.startsWith('lib')));
  
  srcDirs.forEach(dir => {
    if (dir.path.includes('controllers')) analysis.architecture.patterns.push('MVC Pattern');
    if (dir.path.includes('services')) analysis.architecture.patterns.push('Service Layer');
    if (dir.path.includes('repositories')) analysis.architecture.patterns.push('Data Access Layer');
    if (dir.path.includes('components')) analysis.architecture.patterns.push('Component Architecture');
  });

  // 4. Documentation
  onProgress?.("READ: Verifying documentation health indicators...");
  analysis.docsHealth.hasReadme = tree.some(f => f.path.toLowerCase() === 'readme.md');
  analysis.docsHealth.hasADR = tree.some(f => f.path.toLowerCase().includes('adr') || f.path.toLowerCase().includes('decision'));

  return analysis;
}
