// context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type User = {
    id: string
    email: string
}

type Role = 'viewer' | 'editor' | 'admin' | null

interface AuthContextType {
    user: User | null
    role: Role
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [role, setRole] = useState<Role>(null)
    const [loading, setLoading] = useState(true)

    const fetchUserAndRole = async () => {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
            const currentUser = session.user
            setUser({ id: currentUser.id, email: currentUser.email! })

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', currentUser.id)
                .single()

            const userRole = profile?.role || 'viewer'
            setRole(userRole)

            // ⚠️ Pour le middleware : met à jour le cookie côté client
            document.cookie = `role=${userRole}; path=/`
        } else {
            setUser(null)
            setRole(null)
            document.cookie = 'role=viewer; path=/'
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchUserAndRole()

        const { data: listener } = supabase.auth.onAuthStateChange(() => {
            fetchUserAndRole()
        })

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, role, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
