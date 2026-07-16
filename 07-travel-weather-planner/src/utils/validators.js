const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateSignup = (form) => {
  const errors = {}
  if (!form.fullName.trim()) errors.fullName = 'Please enter your full name.'
  if (!emailPattern.test(form.email.trim())) errors.email = 'Enter a valid email address.'
  if (form.password.length < 6) errors.password = 'Password must contain at least 6 characters.'
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.'
  if (!form.defaultCity.trim()) errors.defaultCity = 'Please enter a default city.'
  return errors
}

export const validateLogin = (form) => {
  const errors = {}
  if (!emailPattern.test(form.email.trim())) errors.email = 'Enter a valid email address.'
  if (!form.password) errors.password = 'Please enter your password.'
  return errors
}
