
import { HealthModel, DimensionScore } from '../types';

export function calculateScores(partialModel: Omit<HealthModel, 'scoring' | 'overallScore' | 'timestamp'>): HealthModel {
  const scoring: Record<string, DimensionScore> = {};

  // Documentation Score
  let docScore = 0;
  if (partialModel.docsHealth.hasReadme) docScore += 70;
  if (partialModel.docsHealth.hasADR) docScore += 30;
  scoring['documentation'] = {
    score: docScore,
    severity: docScore > 70 ? 'Healthy' : docScore > 30 ? 'Moderate' : 'Risk',
    explanation: docScore === 100 ? 'Comprehensive documentation found.' : 'Missing key documentation like ADRs or README.',
    priority: docScore > 70 ? 'Low' : 'High'
  };

  // Test Score
  let testScore = partialModel.testPosture.hasTests ? 80 : 0;
  if (partialModel.testPosture.frameworks.length > 0) testScore += 20;
  scoring['testing'] = {
    score: testScore,
    severity: testScore > 70 ? 'Healthy' : testScore > 0 ? 'Moderate' : 'Risk',
    explanation: partialModel.testPosture.hasTests ? 'Test presence detected.' : 'No automated tests detected in the repository tree.',
    priority: testScore > 50 ? 'Medium' : 'High'
  };

  // Architecture Score
  let archScore = 50;
  if (partialModel.architecture.patterns.length > 0) archScore += 25;
  if (partialModel.architecture.patterns.includes('Containerized')) archScore += 25;
  scoring['architecture'] = {
    score: Math.min(archScore, 100),
    severity: archScore > 75 ? 'Healthy' : 'Moderate',
    explanation: 'Basic structural patterns identified.',
    priority: 'Low'
  };

  const values = Object.values(scoring).map(s => s.score);
  const overallScore = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return {
    ...partialModel,
    scoring,
    overallScore,
    timestamp: new Date().toISOString()
  } as HealthModel;
}
