const USER_KEY = 'user_info';

export function getUserInfo() {
  const cached = localStorage.getItem(USER_KEY);
  if (!cached) return null;

  try {
    return JSON.parse(cached);
  } catch (_) {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function saveUserInfo(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUserInfo() {
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
  const user = getUserInfo();
  return Boolean(user?.username);
}
