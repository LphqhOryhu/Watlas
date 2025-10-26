// pages/login.tsx
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) return alert(error.message)
            router.push('/')
        } else {
            const { data, error } = await supabase.auth.signUp({ email, password })

            if (error) return alert(error.message)
            if (data.user) {
                router.push('/')
            }
        }
    }

    return (
        <div className="max-w-md mx-auto mt-12">
            <h2 className="text-2xl font-bold mb-4">{isLogin ? 'Connexion' : 'Inscription'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="email"
                    placeholder="Email"
                    className="border px-4 py-2 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    className="border px-4 py-2 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="bg-blue-600 text-white py-2 rounded">
                    {isLogin ? 'Se connecter' : 'Créer un compte'}
                </button>
            </form>
            <p className="mt-4 text-sm text-center">
                {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}{' '}
                <button onClick={() => setIsLogin(!isLogin)} className="text-blue-500 underline">
                    {isLogin ? 'Créer un compte' : 'Se connecter'}
                </button>
            </p>
        </div>
    )
}
