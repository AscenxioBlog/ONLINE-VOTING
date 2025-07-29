import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { validateComputerScienceStudentId } from '../utils/validation';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set auth persistence to keep user logged in
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Auth persistence error:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Validate that user is from Computer Science department (skip for existing users without department field)
            if (userData.department && userData.department !== 'Computer Science') {
              await signOut(auth);
              setCurrentUser(null);
              setUserRole(null);
              setLoading(false);
              return;
            }
            
            if (userData.studentId && !validateComputerScienceStudentId(userData.studentId)) {
              await signOut(auth);
              setCurrentUser(null);
              setUserRole(null);
              setLoading(false);
              return;
            }
            
            setCurrentUser(user);
            setUserRole(userData.role);
          } else {
            // User document doesn't exist, sign out
            await signOut(auth);
            setCurrentUser(null);
            setUserRole(null);
          }
        } else {
          setCurrentUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    userRole,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};