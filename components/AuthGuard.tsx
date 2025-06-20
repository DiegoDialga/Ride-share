'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push('/login'); // 🚫 Not logged in → redirect to login
            } else {
                setChecking(false); // ✅ Logged in → show content
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (checking) return <p>Loading...</p>;

    return <>{children}</>;
}
