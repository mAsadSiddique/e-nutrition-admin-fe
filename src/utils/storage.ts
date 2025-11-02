const storagePrefix = "e-nutrition";

const storage = {
  getToken(): string | null {
    try {
      const token = localStorage.getItem(`${storagePrefix}_token`);
      return token ? JSON.parse(token) : null;
    } catch {
      return null;
    }
  },
  setToken(token: string) {
    localStorage.setItem(`${storagePrefix}_token`, JSON.stringify(token));
  },
  clearToken() {
    localStorage.removeItem(`${storagePrefix}_token`);
  },
};

export default storage;
