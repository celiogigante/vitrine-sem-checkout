const ADMIN_KEY = "cellstore_admin";

export function isAdmin(): boolean {
  return localStorage.getItem(ADMIN_KEY) === "true";
}

export function login(password: string): boolean {
  // Simple admin password - in production use proper auth
  if (password === "admin123") {
    localStorage.setItem(ADMIN_KEY, "true");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(ADMIN_KEY);
}
