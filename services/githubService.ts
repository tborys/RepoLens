
import { RepoInfo, FileNode } from '../types';

export async function fetchRepoTree(repo: RepoInfo, token?: string): Promise<FileNode[]> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/git/trees/main?recursive=1`, { headers });
  
  if (!response.ok) {
    // Try master if main fails
    const secondTry = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/git/trees/master?recursive=1`, { headers });
    if (!secondTry.ok) {
      throw new Error(`Failed to fetch repository tree: ${secondTry.statusText}`);
    }
    const data = await secondTry.json();
    return data.tree.map((item: any) => ({
      path: item.path,
      type: item.type === 'blob' ? 'file' : 'dir',
      size: item.size
    }));
  }

  const data = await response.json();
  return data.tree.map((item: any) => ({
    path: item.path,
    type: item.type === 'blob' ? 'file' : 'dir',
    size: item.size
  }));
}

export async function fetchFileContent(repo: RepoInfo, path: string, token?: string): Promise<string> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3.raw',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/contents/${path}`, { headers });
  if (!response.ok) return '';
  return await response.text();
}
