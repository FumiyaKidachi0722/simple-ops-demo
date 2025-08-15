export function saveCurrentUser(user: import("./types").User) {
  if (typeof window === "undefined") return;
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function loadCurrentUser(): import("./types").User | null {
  if (typeof window === "undefined") return null;
  const item = localStorage.getItem("currentUser");
  return item ? (JSON.parse(item) as import("./types").User) : null;
}

export function clearCurrentUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("currentUser");
}
