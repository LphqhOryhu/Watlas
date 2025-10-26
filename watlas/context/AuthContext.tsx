// context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type User = {
    id: string
    email: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchUser = async () => {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
            const currentUser = session.user
            setUser({ id: currentUser.id, email: currentUser.email! })
        } else {
            setUser(null)
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchUser()

        const { data: listener } = supabase.auth.onAuthStateChange(() => {
            fetchUser()
        })

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
