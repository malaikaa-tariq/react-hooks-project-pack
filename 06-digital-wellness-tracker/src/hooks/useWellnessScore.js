import { useMemo } from 'react';
import { calculateWellnessScore } from '../utils/wellnessCalculations';

export function useWellnessScore(data) {
  // Recalculates only when the wellness inputs change.
  return useMemo(() => calculateWellnessScore(data), [data]);
}
