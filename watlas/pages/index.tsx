'use client';

import { useEffect, useState } from "react";
import { Page } from "@/types/page";
import PageCard from "@/components/PageCard";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCanon, setShowCanon] = useState<boolean>(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("showCanon");
            return stored === null ? true : stored === "true";
        }
        return true;
    });

    useEffect(() => {
        async function fetchPages() {
            const { data, error } = await supabase.from<'pages', Page>('pages').select('*');
            if (error) {
                console.error(error);
            } else if (data) {
                setPages(data);
            }
            setLoading(false);
        }
        fetchPages();
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("showCanon", showCanon.toString());
        }
    }, [showCanon]);

    if (loading) return <p>Chargement...</p>;
    if (pages.length === 0) return <p>Aucune fiche trouvée.</p>;

    // Filtrer les pages selon le choix
    const filteredPages = pages.filter(p => (p.canon ?? false) === showCanon);

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold mb-6">📚 Watlas — Atlas Warcraft</h1>

            <div className="mb-6 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={showCanon}
                        onChange={() => setShowCanon(s => !s)}
                        className="w-5 h-5 cursor-pointer"
                    />
                    <span>Afficher {showCanon ? 'le lore canon' : 'le lore non-canon'}</span>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPages.map((page) => (
                    <PageCard key={page.id} page={page} />
                ))}
            </div>
        </main>
    );
}
