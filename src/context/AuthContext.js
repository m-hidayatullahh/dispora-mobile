import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Autentikasi mode demo: akun disimpan di perangkat, tidak ada server.
// Kalau nanti Dispora menyediakan endpoint auth, ganti isi login()
// dan register() dengan panggilan API — sisa aplikasi tidak perlu berubah.

const USERS_KEY = 'dispora.users';
const SESSION_KEY = 'dispora.session';

const AuthContext = createContext(null);

async function readUsers() {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

async function writeUsers(users) {
  try {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    // abaikan
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((raw) => {
        if (raw) setUser(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      isLoggedIn: !!user,

      async register({ name, email, phone, password }) {
        const users = await readUsers();
        const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          const err = new Error('EXISTS');
          err.code = 'EXISTS';
          throw err;
        }
        const record = {
          id: 'u' + Date.now(),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password, // demo saja; jangan pakai pola ini di produksi
          createdAt: new Date().toISOString(),
        };
        await writeUsers([...users, record]);

        const session = { id: record.id, name: record.name, email: record.email, phone: record.phone };
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setUser(session);
        return session;
      },

      async login({ email, password }) {
        const users = await readUsers();
        const found = users.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
        );
        if (!found) {
          const err = new Error('NOT_FOUND');
          err.code = 'NOT_FOUND';
          throw err;
        }
        const session = { id: found.id, name: found.name, email: found.email, phone: found.phone };
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setUser(session);
        return session;
      },

      async logout() {
        await AsyncStorage.removeItem(SESSION_KEY);
        setUser(null);
      },
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}

export default { AuthProvider, useAuth };
