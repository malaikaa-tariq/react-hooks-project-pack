export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

export const validateSignup = (form, users) => {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!isEmail(form.email)) errors.email = 'Enter a valid email address.';
  if (users.some((user) => user.email.toLowerCase() === form.email.trim().toLowerCase())) errors.email = 'An account already exists with this email.';
  if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.';
  if (!form.ageRange) errors.ageRange = 'Select an age range.';
  if (!form.mainDevice) errors.mainDevice = 'Select your main device.';
  const goal = Number(form.screenGoal);
  if (goal < 1 || goal > 16) errors.screenGoal = 'Choose a goal from 1 to 16 hours.';
  return errors;
};

export const validateProfile = (form) => {
  const errors = {};
  if (!form.fullName?.trim()) errors.fullName = 'Full name is required.';
  if (!isEmail(form.email)) errors.email = 'Enter a valid email address.';
  if (!form.ageRange) errors.ageRange = 'Select an age range.';
  if (!form.gender) errors.gender = 'Select a gender option.';
  const screenGoal = Number(form.screenGoal);
  const sleepTarget = Number(form.sleepTarget);
  if (screenGoal < 1 || screenGoal > 16) errors.screenGoal = 'Screen-time goal must be between 1 and 16 hours.';
  if (sleepTarget < 4 || sleepTarget > 10) errors.sleepTarget = 'Sleep target must be between 4 and 10 hours.';
  if (!form.focusGoal?.trim()) errors.focusGoal = 'Add a focus goal.';
  if (!form.wellnessGoal) errors.wellnessGoal = 'Select a wellness goal.';
  return errors;
};

export const validateScreenEntry = (form) => {
  const errors = {};
  const total = Number(form.total);
  if (!form.date) errors.date = 'Date is required.';
  if (total < 0 || total > 24 || Number.isNaN(total)) errors.total = 'Total screen time must be from 0 to 24 hours.';
  const categories = ['productive', 'entertainment', 'social', 'study'];
  if (categories.some((key) => Number(form[key] || 0) < 0)) errors.categories = 'Category hours cannot be negative.';
  if (categories.some((key) => Number(form[key] || 0) > total)) errors.categories = 'Category hours cannot be greater than total screen time.';
  return errors;
};

export const validateAppUsage = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = 'App or category name is required.';
  if (Number(form.timeSpent) <= 0 || Number(form.timeSpent) > 24) errors.timeSpent = 'Time spent must be greater than 0 and no more than 24 hours.';
  if (Number(form.limit) <= 0 || Number(form.limit) > 24) errors.limit = 'Daily limit must be greater than 0 and no more than 24 hours.';
  return errors;
};
