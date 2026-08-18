import { useAuth } from './useAuth';
import { checkPlanAccess } from '../utils/planCheck';

export function usePlanAccess(feature: string) {
  const { user } = useAuth();
  const plan = user?.selectedPlan || 'Basic';
  return checkPlanAccess(plan, feature);
}

export function usePlanName() {
  const { user } = useAuth();
  return user?.selectedPlan || 'Basic';
}