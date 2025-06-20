"use client";

import GoogleRideSharingSystem from "../google-ride-sharing-system"
import AuthGuard from "@/components/AuthGuard";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {onAuthStateChanged, signOut, User} from "firebase/auth";
import {auth} from "@/lib/firebase";
import {FaUserCircle} from "react-icons/fa";

export default function Page() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push('/login');
            } else {
                setUser(currentUser);
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };
  return (
      <AuthGuard>
          <div className="flex justify-between items-center mb-8">
              {/* User Info */}
              {user && (
                  <div className="flex items-center space-x-3">
                      <FaUserCircle size={32} className="text-white" />
                      <span className="text-lg font-medium">
              Welcome, {user.email?.split('@')[0]}
            </span>
                  </div>
              )}

              {/* Logout Button */}
              <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition font-semibold"
              >
                  Logout
              </button>
          </div>
        <GoogleRideSharingSystem />
      </AuthGuard>
  );
}