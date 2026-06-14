export interface EditProfileData {
  displayName: string
}

export interface EditProfileState {
  saving: boolean
  error: string | null
  success: boolean
}
