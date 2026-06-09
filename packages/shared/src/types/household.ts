export type MemberRole = 'admin' | 'member'

export interface Household {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface HouseholdMember {
  id: string
  householdId: string
  profileId: string
  role: MemberRole
  joinedAt: string
}
