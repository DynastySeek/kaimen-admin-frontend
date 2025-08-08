import { createPageLoadingGuard } from './page-loading-guard'
import { createPermissionGuard } from './permission-guard'
import { createTabGuard } from './tab-guard'

export function setupRouterGuards(router) {
  createPageLoadingGuard(router)
  createPermissionGuard(router)
  createTabGuard(router)
}
