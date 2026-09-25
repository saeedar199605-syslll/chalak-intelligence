/**
 * Shared types and Zod schemas for Chalak Intelligence Platform.
 * This package provides the single source of truth for all API contracts.
 * Used by both frontend (packages/web) and backend (packages/functions).
 */

import { z } from 'zod';

// === Auth ===

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().min(3).max(32),
  fullName: z.string().optional(),
  locale: z.enum(['fa', 'en']).default('fa'),
  digitMode: z.enum(['persian', 'english']).default('persian'),
  timezone: z.string().default('Asia/Tehran'),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastLogin: z.coerce.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(100).optional(),
  inviteCode: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  emailOrUsername: z.string().min(1),
  password: z.string().min(1),
  rememberMe: z.boolean().default(false),
  csrfToken: z.string(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const AuthResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.coerce.date(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// === Organization ===

export const OrgUnitSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional(),
  parentId: z.string().optional(),
  path: z.string(),
  level: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
});

export type OrgUnit = z.infer<typeof OrgUnitSchema>;

// === Datasets ===

export const DataTypeSchema = z.enum([
  'string',
  'number',
  'date',
  'boolean',
  'currency',
  'percentage',
]);

export type DataType = z.infer<typeof DataTypeSchema>;

export const DatasetColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string().optional(),
  dataType: DataTypeSchema,
  isDimension: z.boolean().default(false),
  isMeasure: z.boolean().default(false),
  isKey: z.boolean().default(false),
  isNullable: z.boolean().default(true),
  formatPattern: z.string().optional(),
  ordinal: z.number().int().nonnegative(),
});

export type DatasetColumn = z.infer<typeof DatasetColumnSchema>;

export const StorageTypeSchema = z.enum(['d1_inline', 'r2_csv', 'r2_parquet', 'api']);

export const DatasetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  ownerId: z.string(),
  orgUnitId: z.string().optional(),
  storageType: StorageTypeSchema,
  r2Bucket: z.string().optional(),
  r2Key: z.string().optional(),
  d1TableName: z.string().optional(),
  rowCount: z.number().int().nonnegative().default(0),
  isDemo: z.boolean().default(false),
  isActive: z.boolean().default(true),
  columns: z.array(DatasetColumnSchema).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Dataset = z.infer<typeof DatasetSchema>;

// === KPI ===

export const KPIFrequencySchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'realtime',
]);

export const AggregationMethodSchema = z.enum([
  'sum',
  'avg',
  'count',
  'count_distinct',
  'min',
  'max',
  'median',
  'custom',
]);

export const PreferredDirectionSchema = z.enum([
  'higher_is_better',
  'lower_is_better',
  'target_range_is_best',
]);

export const KPIHealthStatusSchema = z.enum([
  'healthy',
  'watch',
  'critical',
  'no_data',
]);

export const KPISchema = z.object({
  id: z.string(),
  code: z.string(),
  nameFa: z.string(),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  businessDefinition: z.string().optional(),
  formula: z.string(),
  dataSourceId: z.string().optional(),
  ownerId: z.string().optional(),
  department: z.string().optional(),
  unit: z.string().optional(),
  frequency: KPIFrequencySchema,
  aggregationMethod: AggregationMethodSchema,
  dimensions: z.array(z.string()).optional(),
  targetType: z.enum(['single', 'threshold', 'range']),
  targetValue: z.number().optional(),
  targetMin: z.number().optional(),
  targetMax: z.number().optional(),
  baselineValue: z.number().optional(),
  warningThreshold: z.number().optional(),
  criticalThreshold: z.number().optional(),
  preferredDirection: PreferredDirectionSchema,
  displayUnit: z.string().optional(),
  decimalPrecision: z.number().int().nonnegative().default(2),
  comparisonPeriod: z.enum(['previous_period', 'same_period_last_year']),
  effectiveDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  interpretationGuide: z.string().optional(),
  aiPromptContext: z.string().optional(),
  version: z.number().int().positive().default(1),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type KPI = z.infer<typeof KPISchema>;

export const KPIHealthSchema = z.object({
  kpiId: z.string(),
  health: KPIHealthStatusSchema,
  currentValue: z.number(),
  targetValue: z.number().optional(),
  variance: z.number().optional(),
  momentum: z.number().optional(),
  lastUpdated: z.coerce.date(),
});

export type KPIHealth = z.infer<typeof KPIHealthSchema>;

// === Momentum ===

export const MomentumMethodSchema = z.enum(['simple', 'trend', 'composite']);
export const MomentumDirectionSchema = z.enum([
  'strongly_improving',
  'improving',
  'stable',
  'weakening',
  'deteriorating',
  'insufficient_data',
]);

export const MomentumComponentSchema = z.object({
  name: z.string(),
  value: z.number(),
  weight: z.number(),
  contribution: z.number(),
  explanation: z.string(),
});

export const MomentumSchema = z.object({
  kpiId: z.string(),
  method: MomentumMethodSchema,
  direction: MomentumDirectionSchema,
  score: z.number(),
  components: z.array(MomentumComponentSchema),
  period: z.string(),
  sampleSize: z.number(),
  volatility: z.number(),
  confidence: z.enum(['high', 'medium', 'low']),
  dataCoverage: z.number(),
  computedAt: z.coerce.date(),
});

export type Momentum = z.infer<typeof MomentumSchema>;

// === Analysis ===

export const AnalysisStatusSchema = z.enum(['draft', 'approved']);
export const AnalysisSourceSchema = z.enum(['manual', 'ai', 'ai_edited']);

export const AnalysisSchema = z.object({
  id: z.string(),
  kpiId: z.string(),
  authorId: z.string(),
  period: z.string(),
  title: z.string(),
  content: z.record(z.string(), z.string()).optional(),
  dataSnapshot: z.record(z.string(), z.unknown()).optional(),
  status: AnalysisStatusSchema,
  source: AnalysisSourceSchema,
  aiProvider: z.string().optional(),
  aiModel: z.string().optional(),
  version: z.number().int().positive().default(1),
  approvedBy: z.string().optional(),
  approvedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Analysis = z.infer<typeof AnalysisSchema>;

// === API Response Wrapper ===

export function ApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  });
}

// === Re-export ===
export {
  z,
  DataTypeSchema as DataType,
  StorageTypeSchema as StorageType,
  KPIFrequencySchema as KPIFrequency,
  AggregationMethodSchema as AggregationMethod,
  PreferredDirectionSchema as PreferredDirection,
  KPIHealthStatusSchema as KPIHealthStatus,
  MomentumMethodSchema as MomentumMethod,
  MomentumDirectionSchema as MomentumDirection,
  AnalysisStatusSchema as AnalysisStatus,
  AnalysisSourceSchema as AnalysisSource,
};
