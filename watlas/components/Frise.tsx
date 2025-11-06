'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface Page {
    id: string;
    name: string;
    type: string;
    relations?: string[];
    slug?: string;
    univers?: string;
}

export default function Frise() {
    const [allPages, setAllPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUnivers, setSelectedUnivers] = useState<string | null>(null);

    useEffect(() => {
        // lire la sélection depuis localStorage au montage
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('selectedUnivers');
            if (stored === null) setSelectedUnivers(null);
            else setSelectedUnivers(stored);
        }

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'selectedUnivers') {
                setSelectedUnivers(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    useEffect(() => {
        async function fetchPages() {
            const { data, error } = await supabase
                .from('pages')
                .select('id, name, type, relations, univers')
                .order('name', { ascending: true });

            if (error) console.error(error);
            else setAllPages(data as Page[]);
            setLoading(false);
        }

        fetchPages();
    }, []);

    if (loading) return <p className="p-4">Chargement de la frise...</p>;

    if (selectedUnivers === null) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">🕰️ Frise chronologique</h1>
                <p className="text-gray-500">
                    Veuillez sélectionner un univers pour afficher la frise.
                </p>
            </div>
        );
    }

    // filtrer par univers si selectedUnivers non vide
    const pagesToUse =
        selectedUnivers === ''
            ? allPages
            : allPages.filter((p) => (p.univers ?? '') === selectedUnivers);

    const datePages = pagesToUse.filter((p) => p.type === 'année');

    return (
        <div className="p-6 overflow-x-auto">
            <h1 className="text-2xl font-bold mb-6">🕰️ Frise chronologique</h1>

            <div className="space-y-8">
                {datePages.map((yearPage) => {
                    const linkedPages = pagesToUse.filter((p) =>
                        p.relations?.includes(yearPage.id)
                    );

                    return (
                        <div key={yearPage.id}>
                            {/* Trait de la frise */}
                            <div className="flex items-center space-x-4">
                                <div className="w-4 h-4 bg-blue-600 rounded-full shadow-md" />
                                <Link
                                    href={`/page/${yearPage.slug ?? yearPage.id}`}
                                    className="text-lg font-semibold text-blue-700 hover:underline"
                                >
                                    {yearPage.name}
                                </Link>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>

                            {/* Pages liées à cette année */}
                            {linkedPages.length > 0 && (
                                <ul className="ml-8 mt-2 space-y-1">
                                    {linkedPages.map((p) => (
                                        <li key={p.id}>
                                            <Link
                                                href={`/${p.type}/${p.id}`}
                                                className="text-gray-300 hover:underline"
                                            >
                                                🔗 {p.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
