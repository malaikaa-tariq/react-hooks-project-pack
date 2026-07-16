export const weatherInterests = ['General', 'Travel', 'Study', 'Fitness', 'Outdoor Work']
export const activityTypes = ['Study', 'Walk', 'Workout', 'Picnic', 'Shopping', 'Commute']

export const createDefaultUserData = (profile = {}) => ({
  profile: {
    fullName: profile.fullName || '',
    email: profile.email || '',
    defaultCity: profile.defaultCity || 'Karachi',
    unit: profile.unit || 'celsius',
    interest: profile.interest || 'General',
  },
  savedCities: [],
  recentSearches: [],
  activityPlans: [],
})
