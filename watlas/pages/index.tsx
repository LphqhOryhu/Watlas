'use client';

import { useEffect, useState } from "react";
import { Page, PageType } from "@/types/page";
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
    const [searchTerm, setSearchTerm] = useState("");

    const allPageTypes: PageType[] = [
        "personnage", "lieu", "groupe", "objet", "événement", "période", "année", "support_narratif"
    ];
    const [selectedTypes, setSelectedTypes] = useState<PageType[]>([...allPageTypes]);

    const toggleType = (type: PageType) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    useEffect(() => {
        async function fetchPages() {
            const { data, error } = await supabase.from<'pages', Page>('pages').select('*');
            if (error) console.error(error);
            else setPages(data);
            setLoading(false);
        }
        fetchPages();
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("showCanon", showCanon.toString());
        }
    }, [showCanon]);

    const filteredPages = pages.filter(p =>
        (p.canon ?? false) === showCanon &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        selectedTypes.includes(p.type)
    );

    if (loading) return <p>Chargement...</p>;

    return (
        <main className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Watlas</h1>

            {/* Filtres */}
            <div className="mb-6 space-y-4">
                {/* Ligne filtres + toggle */}
                <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                    {/* Filtres de type */}
                    <div className="flex flex-wrap gap-2">
                        {allPageTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => toggleType(type)}
                                className={`px-4 py-1 rounded-full text-sm border transition ${
                                    selectedTypes.includes(type)
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Toggle canon */}
                    <div className="flex items-center gap-3">
                        <label className="relative inline-block w-14 h-7">
                            <input
                                type="checkbox"
                                checked={showCanon}
                                onChange={() => setShowCanon((s) => !s)}
                                className="sr-only peer"
                            />
                            <div className="w-full h-full bg-gray-400 rounded-full peer-checked:bg-green-500 transition-colors duration-300" />
                            <div className="absolute top-0.5 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 peer-checked:translate-x-6" />
                        </label>
                        <span className="text-sm select-none">
      {showCanon ? 'Lore canon' : 'Lore non-canon'}
    </span>
                    </div>
                </div>


                {/* Barre de recherche */}
                <div className="w-full">
                    <input
                        type="search"
                        placeholder="🔍 Rechercher une fiche..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* Résultats */}
            {filteredPages.length === 0 ? (
                <p className="text-center text-gray-500">Aucune fiche trouvée.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPages.map((page) => (
                        <PageCard key={page.id} page={page} />
                    ))}
                </div>
            )}
        </main>

    );
}
