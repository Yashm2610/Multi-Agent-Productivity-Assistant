import React from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, LogOut, User } from 'lucide-react';
import { cn } from '../lib/utils';

export function Auth() {
  const [user, setUser] = React.useState(auth.currentUser);

  React.useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const logout = () => signOut(auth);

  if (!user) {
    return (
      <button
        onClick={login}
        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
      >
        <LogIn size={18} />
        Sign In with Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <User size={16} />
        )}
        <span className="text-sm font-medium hidden sm:inline">{user.displayName}</span>
      </div>
      <button
        onClick={logout}
        className="p-2 glass rounded-full hover:bg-white/10 transition-colors"
        title="Sign Out"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}
