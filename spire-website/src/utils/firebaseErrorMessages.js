/**
 * User-facing copy for Firebase Auth / Storage errors (error.code).
 */
export function firebaseErrorMessage(error) {
  const code = error?.code || ''
  const map = {
    'auth/email-already-in-use':
      'This email is already registered. Sign in, or use a different email.',
    'auth/invalid-credential':
      'Invalid email or password. If you just signed up, use the same password, or reset it if you forgot.',
    'auth/wrong-password': 'Wrong password. Try again.',
    'auth/user-not-found': 'No account found for this email.',
    'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
    'auth/weak-password': 'Password is too weak.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'storage/unauthorized':
      'File access was denied. Sign out and sign in again, or ask an admin to update Storage rules.',
    'storage/canceled': 'Upload was canceled.',
    'storage/retry-limit-exceeded': 'Upload failed after several tries. Check your connection.',
  }
  return map[code] || error?.message || 'Something went wrong. Please try again.'
}
