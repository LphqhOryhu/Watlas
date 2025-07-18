'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { user, role } = useAuth();
    const { open, toggle } = useSidebar();

    const linkClass = (path: string) =>
        `block px-4 py-2 rounded hover:bg-gray-700 transition ${
            pathname === path ? 'bg-gray-800 text-white font-semibold' : 'text-gray-300'
        }`;

    return (
        <aside
            className={`fixed top-14 left-0 h-[calc(100vh-64px)] z-40 transition-all duration-300 ${
                open ? 'w-64' : 'w-16'
            } bg-gray-900 text-white overflow-hidden`}
        >
            <div className="h-full flex flex-col p-2">
                <button
                    onClick={toggle}
                    className="self-end mb-4 px-2 text-gray-400 hover:text-white"
                    aria-label="Réduire la barre latérale"
                >
                    {open ? '«' : '»'}
                </button>

                {/* Liens */}
                <nav className="flex-1 space-y-1 text-sm">
                    {(role === 'admin' || role === 'editor') && (
                        <Link href="/ajouter" className={linkClass('/ajouter')}>
                            ➕ {open && 'Ajouter une fiche'}
                        </Link>
                    )}

                    {role === 'admin' && (
                        <>
                            <Link href="/admin" className={linkClass('/admin')}>👑 {open && 'Vue admin'}</Link>
                            <Link href="/backup" className={linkClass('/backup')}>💾 {open && 'Backup'}</Link>
                        </>
                    )}

                    <Link href="/timeline" className={linkClass('/timeline')}>📅 {open && 'Frise'}</Link>
                    <Link href="/commentaires" className={linkClass('/commentaire')}>💬 {open && 'Commentaire'}</Link>
                    <Link href="/about" className={linkClass('/about')}>📜 {open && 'À propos'}</Link>
                </nav>

                {/* Infos utilisateur */}
                {user && open && (
                    <div className="mt-4 text-xs text-gray-400 px-2">
                        Connecté : <span className="text-white">{user.email}</span>
                    </div>
                )}
            </div>
        </aside>
    );
}
