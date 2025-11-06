'use client';

import { useEffect, useState, useMemo } from "react";
import { Page, PageType } from "@/types/page";
import PageCard from "@/components/PageCard";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingUniverses, setLoadingUniverses] = useState(true);
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

    // selectedUnivers contient la valeur telle qu'en base (ex: 'wow') ou null si non sélectionné
    const [selectedUnivers, setSelectedUnivers] = useState<string | null>(null);

    // initialiser selectedUnivers depuis localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stored = localStorage.getItem('selectedUnivers');
        if (stored === null) setSelectedUnivers(null);
        else setSelectedUnivers(stored);
    }, []);

    // centraliser la sélection d'univers pour persister en localStorage
    const selectUnivers = (u: string | null) => {
        setSelectedUnivers(u);
        if (typeof window === 'undefined') return;
        if (u === null) localStorage.removeItem('selectedUnivers');
        else localStorage.setItem('selectedUnivers', u);
    };

    // liste d'univers récupérée séparément (pour afficher les boutons avant le chargement complet des fiches)
    const [universList, setUniversList] = useState<string[]>([]);

    // mapping technique -> label lisible
    const universLabels: Record<string, string> = {
        wow: 'World of Warcraft',
        warcraft: 'Warcraft',
        doctor_who: 'Doctor Who',
        star_wars: 'Star Wars',
        other: 'Autre',
    };

    // Calculer la liste unique des univers présents dans `pages` (non vides) si besoin secondaire
    const universesFromPages = useMemo(() => {
        const setVals = new Set<string>();
        for (const p of pages) {
            if (typeof p.univers === 'string' && p.univers.trim() !== '') {
                setVals.add(p.univers);
            }
        }
        return Array.from(setVals);
    }, [pages]);

    // afficher les univers disponibles pour les boutons : priorité à la liste fetchée,
    // fallback sur universesFromPages puis sur les clés de universLabels
    const displayUniverses = useMemo(() => {
        if (loadingUniverses) {
            return universesFromPages.length ? universesFromPages : Object.keys(universLabels);
        }
        if (universList && universList.length > 0) return universList;
        if (universesFromPages.length) return universesFromPages;
        return Object.keys(universLabels);
    }, [loadingUniverses, universList, universesFromPages]);

    // calculer comptage par univers (utilisé pour afficher les compteurs)
    const countsByUnivers = useMemo(() => {
        const map = new Map<string, number>();
        for (const p of pages) {
            const u = (p.univers ?? '').trim();
            if (u === '') continue;
            map.set(u, (map.get(u) ?? 0) + 1);
        }
        return map;
    }, [pages]);

    useEffect(() => {
        // Fetch univers distincts (léger) pour afficher les boutons immédiatement
        async function fetchUniverses() {
            setLoadingUniverses(true);
            try {
                const { data, error } = await supabase.from('pages').select('univers');
                if (error) throw error;
                if (data) {
                    const uniques = Array.from(new Set(
                        data
                            .map((r: any) => (r.univers ?? '').toString().trim())
                            .filter((u: string) => u !== '')
                    ));
                    // trier par label lisible
                    uniques.sort((a: string, b: string) => {
                        const la = universLabels[a] ?? a;
                        const lb = universLabels[b] ?? b;
                        return la.localeCompare(lb, 'fr');
                    });
                    setUniversList(uniques);
                } else {
                    setUniversList([]);
                }
            } catch (err) {
                console.error('Erreur fetch univers:', err);
                setUniversList([]);
            }
            setLoadingUniverses(false);
        }
        fetchUniverses();
    }, []);

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
        selectedTypes.includes(p.type) &&
        // Si selectedUnivers non null, filtrer par p.univers === selectedUnivers
        (selectedUnivers === null || selectedUnivers === '' || (p.univers ?? '') === selectedUnivers)
    );

    // Ne pas empêcher le rendu des boutons d'univers pendant le chargement des fiches.
    const resultsLoading = loading;

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


                {/* Barre de recherche et boutons d'univers (dynamiques) */}
                <div className="w-full flex flex-col sm:flex-row gap-4">
                    <input
                        type="search"
                        placeholder="🔍 Rechercher une fiche..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-400"
                    />

                    <div className="flex flex-wrap gap-2 items-center">
                        <button
                            onClick={() => selectUnivers('')}
                            className={`px-3 py-1 rounded ${selectedUnivers === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            Tous les univers
                        </button>

                        {/* afficher la liste d'univers calculée (displayUniverses) */}
                        {displayUniverses.map((u) => (
                            <button
                                key={u}
                                onClick={() => selectUnivers(u)}
                                className={`px-3 py-1 rounded ${selectedUnivers === u ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                {universLabels[u] ?? u} {countsByUnivers.get(u) ? `(${countsByUnivers.get(u)})` : ''}
                            </button>
                        ))}

                        {loadingUniverses && (
                            <span className="text-sm text-gray-500 ml-2">Chargement univers…</span>
                        )}

                        {/* bouton réinitialiser */}
                        {selectedUnivers !== null && (
                            <button
                                onClick={() => selectUnivers(null)}
                                className="px-3 py-1 rounded bg-red-100 text-red-700"
                            >
                                Réinitialiser
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Résultats : n'afficher que si un univers a été sélectionné (ou 'Tous les univers' = '') */}
            {selectedUnivers === null ? (
                <p className="text-center text-gray-500">Veuillez sélectionner un univers pour afficher les fiches.</p>
            ) : resultsLoading ? (
                <p className="text-center text-gray-500">Chargement des fiches...</p>
            ) : filteredPages.length === 0 ? (
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
