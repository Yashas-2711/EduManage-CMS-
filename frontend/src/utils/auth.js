// Token management utilities
export const getToken = () => localStorage.getItem('cms_token');
export const setToken = (token) => localStorage.setItem('cms_token', token);
export const removeToken = () => localStorage.removeItem('cms_token');

export const getUser = () => {
  try {
    const userStr = localStorage.getItem('cms_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => !!getToken();

export const logout = () => {
  removeToken();
  localStorage.removeItem('cms_user');
  window.location.href = '/login';
};
