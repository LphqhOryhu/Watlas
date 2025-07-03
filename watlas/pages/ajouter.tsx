'use client';

import { useState, useEffect } from "react";
import { PageType, Page } from "@/types/page";
import { supabase } from "@/lib/supabaseClient";

const pageTypes: PageType[] = [
    "personnage", "lieu", "groupe", "objet", "événement", "période", "année", "support_narratif"
];

export default function AjouterPage() {
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        type: "personnage" as PageType,
        description: "",
        relations: [] as string[],
    });

    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);

    // Charger les pages depuis Supabase au chargement
    useEffect(() => {
        async function fetchPages() {
            const { data, error } = await supabase.from<Page>('pages').select('*');
            if (error) {
                console.error("Erreur chargement pages:", error.message);
            } else if (data) {
                setPages(data);
            }
            setLoading(false);
        }
        fetchPages();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((f) => ({ ...f, [name]: value }));
    };

    const handleRelationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        const value = e.target.value;
        setFormData((f) => ({
            ...f,
            relations: checked
                ? [...f.relations, value]
                : f.relations.filter((id) => id !== value),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newPage: Page = {
            id: formData.id.toLowerCase().replace(/\s+/g, '-'),
            name: formData.name,
            type: formData.type,
            description: formData.description,
            relations: formData.relations,
        };

        try {
            const { error } = await supabase.from('pages').insert([newPage]);
            if (error) {
                alert(`Erreur : ${error.message}`);
                return;
            }
            alert("Fiche ajoutée avec succès !");
            setPages((prev) => [...prev, newPage]);
            setFormData({
                id: "",
                name: "",
                type: "personnage",
                description: "",
                relations: [],
            });
        } catch {
            alert("Erreur lors de l’ajout de la fiche.");
        }
    };

    if (loading) return <p>Chargement des pages...</p>;

    return (
        <main className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">➕ Ajouter une fiche</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="id" placeholder="ID (ex: illidan)" required className="w-full p-2 border rounded" onChange={handleChange} value={formData.id} />
                <input name="name" placeholder="Nom" required className="w-full p-2 border rounded" onChange={handleChange} value={formData.name} />
                <select name="type" className="w-full p-2 border rounded" value={formData.type} onChange={handleChange}>
                    {pageTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <textarea name="description" placeholder="Description" rows={3} className="w-full p-2 border rounded" onChange={handleChange} value={formData.description} />

                <label className="block font-semibold mt-4">Relations (checkbox)</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border p-2 rounded">
                    {pages.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                value={p.id}
                                checked={formData.relations.includes(p.id)}
                                onChange={handleRelationChange}
                            />
                            {p.name} <span className="text-gray-500">({p.type})</span>
                        </label>
                    ))}
                </div>

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Ajouter
                </button>
            </form>
        </main>
    );
}
