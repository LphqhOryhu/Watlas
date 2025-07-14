'use client';

import { useEffect, useState } from "react";
import {Page, PageType} from "@/types/page";
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
        "personnage",
        "lieu",
        "groupe",
        "objet",
        "événement",
        "période",
        "année",
        "support_narratif",
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
    const filteredPages = pages.filter(p =>
        (p.canon ?? false) === showCanon &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        selectedTypes.includes(p.type)
    );
    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold mb-6">Watlas</h1>

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
                <input
                    type="search"
                    placeholder="Rechercher par nom..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-1 p-2 border rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-400"
                />
                <div className="flex flex-wrap gap-4 items-center max-w-lg">
                    {allPageTypes.map((type) => (
                        <label
                            key={type}
                            className="flex items-center gap-2 cursor-pointer select-none"
                        >
                            <input
                                type="checkbox"
                                checked={selectedTypes.includes(type)}
                                onChange={() => toggleType(type)}
                                className="w-4 h-4 cursor-pointer"
                            />
                            <span>{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            {filteredPages.length === 0 ? (
                <p>Aucun résultat trouvé.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPages.map((page) => (
                        <PageCard key={page.id} page={page} />
                    ))}
                </div>
            )}

        </main>
    );
}
