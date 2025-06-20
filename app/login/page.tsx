'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLogin, setIsLogin] = useState(true); // toggle between login/signup

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) router.push('/');
        });
        return () => unsub();
    }, [router]);

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSignUp = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleForgotPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, email);
            alert('Password reset email sent!');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="h-screen w-screen bg-gradient-to-t from-[#2e005f] to-[#9a4eff] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/forest-bg.png')] bg-cover bg-center opacity-60" />
            <div className="flex justify-center items-center h-full relative z-10">
                <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-8 w-[90%] max-w-md text-white">
                    <h2 className="text-3xl font-bold text-center mb-6">{isLogin ? 'Login' : 'Sign Up'}</h2>

                    <input
                        type="email"
                        placeholder="Username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mb-4 p-3 rounded-full bg-white/20 text-white placeholder-white/70 focus:outline-none"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mb-4 p-3 rounded-full bg-white/20 text-white placeholder-white/70 focus:outline-none"
                    />

                    <div className="flex justify-between text-sm mb-4">
                        <label className="flex items-center gap-1">
                            <input type="checkbox" className="accent-purple-400" />
                            Remember Me
                        </label>
                        {isLogin && (
                            <button onClick={handleForgotPassword} className="hover:underline text-white">
                                Forgot Password?
                            </button>
                        )}
                    </div>

                    <button
                        onClick={isLogin ? handleLogin : handleSignUp}
                        className="w-full bg-white text-purple-800 font-semibold py-2 rounded-full hover:bg-gray-100 transition"
                    >
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>

                    {error && <p className="text-red-300 mt-4 text-sm text-center">{error}</p>}

                    <p className="mt-4 text-center text-sm">
                        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-white font-semibold underline"
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
