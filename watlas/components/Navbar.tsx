import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
    const { user, loading } = useAuth();

    // Debug logs
    console.log('Navbar - loading:', loading, 'user:', user);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-gray-800 text-white shadow">
            <Link href="/" className="text-xl font-bold">Watlas</Link>

            <div className="flex items-center gap-4">
                {!loading && user ? (
                    <button
                        onClick={handleLogout}
                        title="Déconnexion"
                        className="text-xl hover:text-red-400"
                    >
                        ⏻
                    </button>
                ) : (
                    <Link
                        href="/login"
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                    >
                        Connexion
                    </Link>
                )}
            </div>
        </nav>
    );
}
