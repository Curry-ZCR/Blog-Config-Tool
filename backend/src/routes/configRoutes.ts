import { Router, Request, Response } from 'express'
import { configService } from '../services/ConfigService'
import type { 
  GetConfigResponse, 
  UpdateConfigRequest, 
  UpdateConfigResponse 
} from '../../../shared/types/api'

const router = Router()

/**
 * GET /api/config
 * Read and parse params.yml configuration
 * 
 * Requirements: 1.1, 7.1, 7.4
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await configService.readConfig()

    if (result.success && result.config) {
      const response: GetConfigResponse = {
        success: true,
        data: result.config
      }
      return res.json(response)
    } else {
      const response: GetConfigResponse = {
        success: false,
        data: {} as any,
        error: result.error || 'Failed to read configuration'
      }
      return res.status(400).json(response)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const response: GetConfigResponse = {
      success: false,
      data: {} as any,
      error: `Failed to read config: ${errorMessage}`
    }
    return res.status(500).json(response)
  }
})

/**
 * PUT /api/config
 * Update params.yml configuration with backup
 * 
 * Requirements: 1.2, 4.4, 7.2, 7.3
 */
router.put('/', async (req: Request, res: Response) => {
  try {
    const { config } = req.body as UpdateConfigRequest

    if (!config || typeof config !== 'object') {
      const response: UpdateConfigResponse = {
        success: false,
        error: 'Configuration object is required'
      }
      return res.status(400).json(response)
    }

    const result = await configService.updateConfig(config)

    if (result.success) {
      const response: UpdateConfigResponse = {
        success: true,
        backupPath: result.backupPath
      }
      return res.json(response)
    } else {
      const response: UpdateConfigResponse = {
        success: false,
        error: result.error || 'Failed to update configuration'
      }
      return res.status(400).json(response)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const response: UpdateConfigResponse = {
      success: false,
      error: `Failed to update config: ${errorMessage}`
    }
    return res.status(500).json(response)
  }
})

export default router
