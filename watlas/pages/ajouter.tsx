'use client';

import { useState, useEffect } from "react";
import { PageType, Page } from "@/types/page";
import { supabase } from "@/lib/supabaseClient";

const pageTypes: PageType[] = [
    "personnage",
    "lieu",
    "groupe",
    "objet",
    "événement",
    "période",
    "année",
    "support_narratif"
];

export default function AjouterPage() {
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        type: "personnage" as PageType,
        relations: [] as string[],
        imageUrl: "",
        sections: [] as { title: string; content: string }[],
    });

    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPages() {
            const { data, error } = await supabase.from<'pages', Page>('pages').select('*');
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
            relations: formData.relations,
            imageUrl: formData.imageUrl || null,
            sections: formData.sections,
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
                relations: [],
                imageUrl: "",
                sections: [],
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
                <input
                    name="id"
                    placeholder="ID (ex: illidan)"
                    required
                    className="w-full p-2 border rounded"
                    onChange={handleChange}
                    value={formData.id}
                />
                <input
                    name="name"
                    placeholder="Nom"
                    required
                    className="w-full p-2 border rounded"
                    onChange={handleChange}
                    value={formData.name}
                />
                <select
                    name="type"
                    className="w-full p-2 border rounded"
                    value={formData.type}
                    onChange={handleChange}
                >
                    {pageTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>

                <input
                    type="url"
                    name="imageUrl"
                    placeholder="URL de l&apos;image (ex: https://exemple.com/image.png)"
                    className="w-full p-2 border rounded"
                    onChange={handleChange}
                    value={formData.imageUrl}
                />

                {/* Relations */}
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

                {/* Sections dynamiques */}
                <label className="block font-semibold mt-6 mb-2">Sections</label>
                {formData.sections.map((section, i) => (
                    <div key={i} className="mb-4 border p-2 rounded">
                        <input
                            type="text"
                            placeholder="Titre de la section"
                            value={section.title}
                            onChange={e => {
                                const val = e.target.value;
                                setFormData(f => {
                                    const newSections = [...f.sections];
                                    newSections[i] = { ...newSections[i], title: val };
                                    return { ...f, sections: newSections };
                                });
                            }}
                            className="w-full p-1 border rounded mb-1"
                            required
                        />
                        <textarea
                            placeholder="Contenu de la section"
                            rows={3}
                            value={section.content}
                            onChange={e => {
                                const val = e.target.value;
                                setFormData(f => {
                                    const newSections = [...f.sections];
                                    newSections[i] = { ...newSections[i], content: val };
                                    return { ...f, sections: newSections };
                                });
                            }}
                            className="w-full p-1 border rounded"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setFormData(f => {
                                    const newSections = [...f.sections];
                                    newSections.splice(i, 1);
                                    return { ...f, sections: newSections };
                                });
                            }}
                            className="mt-1 text-red-600 hover:underline"
                        >
                            Supprimer la section
                        </button>
                    </div>
                ))}
                <div className={"flex flex-col gap-2"}>
                    <button
                        type="button"
                        onClick={() =>
                            setFormData(f => ({
                                ...f,
                                sections: [...f.sections, { title: "", content: "" }],
                            }))
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Ajouter une section
                    </button>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Ajouter
                    </button>
                </div>
            </form>
        </main>
    );
}
