const planFeatures: Record<string, string[]> = {
  'Basic': ['crop_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts'],
  'Basic Monthly': ['crop_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts'],
  'Pro': ['crop_scan', 'field_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts', 'iot_field_sensors', 'field_scan_gps'],
  'Full Suite': ['crop_scan', 'field_scan', 'field_scan_manual', 'livestock', 'health', 'production', 'inventory', 'finance', 'weather', 'ai_chat', 'team', 'market', 'reports', 'alerts', 'iot_field_sensors', 'field_scan_gps', 'storage_monitoring', 'co2_detection', 'pir_detection'],
};

export const checkPlanAccess = (plan: string, feature: string): boolean => {
  const allowedFeatures = planFeatures[plan] || planFeatures['Basic'];
  return allowedFeatures.includes(feature);
};