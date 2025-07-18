'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'

interface UserProfile {
    id: string;
    email: string;
    role: 'viewer' | 'editor' | 'admin';
}

export default function AdminPage() {
    const { role, loading } = useAuth()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [refresh, setRefresh] = useState(false)

    useEffect(() => {
        if (role === 'admin') {
            const fetchUsers = async () => {
                const { data, error } = await supabase.from('profiles').select('*')
                if (!error) setUsers(data)
            }
            fetchUsers()
        }
    }, [role, refresh])

    const handleRoleChange = async (id: string, newRole: string) => {
        await supabase.from('profiles').update({ role: newRole }).eq('id', id)
        setRefresh(r => !r)
    }

    if (loading) return <p>Chargement...</p>
    if (role !== 'admin') return <p className="text-center mt-8 text-red-500">Accès interdit</p>

    return (
        <main className="p-8 max-w-4xl mx-auto text-white">
            <h1 className="text-2xl font-bold mb-6">Administration des utilisateurs</h1>
            <div className="overflow-x-auto rounded shadow-lg">
                <table className="w-full border border-gray-700 border-collapse">
                    <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="p-3 text-left border-b border-gray-600">Email</th>
                        <th className="p-3 text-left border-b border-gray-600">Rôle</th>
                        <th className="p-3 text-left border-b border-gray-600">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-gray-900">
                    {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-800 transition">
                            <td className="p-3">{user.email}</td>
                            <td className="p-3 capitalize">{user.role}</td>
                            <td className="p-3">
                                <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    className="bg-gray-700 text-white border border-gray-600 px-2 py-1 rounded"
                                >
                                    <option value="viewer">viewer</option>
                                    <option value="editor">editor</option>
                                    <option value="admin">admin</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </main>

    )
}
