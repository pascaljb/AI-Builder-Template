// src/store/index.ts
// Re-exports all slices. Import stores from here in components.
// Add new slices here when created by scaffold-feature.

export { useUIStore, selectIsLoading, selectToasts, selectActiveModal, selectModalData } from './slices/ui'
export { useAuthStore, selectUser, selectIsAuthenticated, selectAuthStatus, selectAuthError, selectUserId } from './slices/auth'

// Feature slices are added below this line by scaffold-feature skill
