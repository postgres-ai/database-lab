import { Config } from '@postgres.ai/shared/types/api/entities/config'

export type UpdateConfig = (values: Config) => Promise<{
  response: Response | null
  error: Response | null
}>
