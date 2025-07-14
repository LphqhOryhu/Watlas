'use client';

import { useState, useEffect } from "react";
import { PageType, Page } from "@/types/page";
import { supabase } from "@/lib/supabaseClient";
import {router} from "next/client";

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
        canon: true,
    });

    const predefinedSectionTitles = [
        "Warcraft I",
        "Warcraft II",
        "Warcraft III",
        "World of Warcraft",
        "Warcraft Le Commencement",
        "Autres"
    ];

    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);

    const filteredRelations = pages.filter(p => p.canon === formData.canon);

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
        const target = e.target;
        const name = target.name;
        const value = target.value;
        const type = target.type;
        const checked = (target as HTMLInputElement).checked;
        setFormData((f) => ({
            ...f,
            [name]: type === "checkbox" ? checked : value,
        }));
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

        const newId = crypto.randomUUID();

        const newPage: Page = {
            id: newId,
            name: formData.name,
            type: formData.type,
            relations: formData.relations,
            imageUrl: formData.imageUrl ? formData.imageUrl : undefined,
            sections: formData.sections,
            canon: formData.canon,
        };

        try {
            const { error } = await supabase.from('pages').insert([newPage]);
            if (error) {
                alert(`Erreur : ${error.message}`);
                return;
            }
            alert("Fiche ajoutée avec succès !");
            await router.push("/");
            setPages((prev) => [...prev, newPage]);
            setFormData({
                id: "",
                name: "",
                type: "personnage",
                relations: [],
                imageUrl: "",
                sections: [],
                canon: true,
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
                    name="name"
                    placeholder="Nom"
                    required
                    className="w-full p-2 border rounded "
                    onChange={handleChange}
                    value={formData.name}
                />
                <select
                    name="type"
                    className="w-full p-2 border rounded bg-black "
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

                <label className="inline-flex items-center gap-2 mt-4">
                    <input
                        type="checkbox"
                        name="canon"
                        checked={formData.canon}
                        onChange={handleChange}
                    />
                    <span>Cette fiche est canon</span>
                </label>

                {/* Relations */}
                <label className="block font-semibold mt-4">Relations (checkbox)</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border p-2 rounded">
                    {filteredRelations.map((p) => (
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
                        <label className="block mb-1 font-semibold">Titre de la section</label>

                        <select
                            className="w-full p-2 border rounded mb-2 bg-black"
                            value={
                                predefinedSectionTitles.includes(section.title)
                                    ? section.title
                                    : "Autres"
                            }
                            onChange={e => {
                                const value = e.target.value;
                                setFormData(f => {
                                    const newSections = [...f.sections];
                                    newSections[i] = {
                                        ...newSections[i],
                                        title: value === "Autres" ? "" : value
                                    };
                                    return { ...f, sections: newSections };
                                });
                            }}
                            required
                        >
                            {predefinedSectionTitles.map((title) => (
                                <option key={title} value={title}>
                                    {title}
                                </option>
                            ))}
                        </select>

                        {(!predefinedSectionTitles.includes(section.title)) || section.title === "" ? (
                            <input
                                type="text"
                                placeholder="Entrez un titre personnalisé"
                                className="w-full p-2 border rounded mb-2"
                                value={section.title}
                                onChange={e => {
                                    const val = e.target.value;
                                    setFormData(f => {
                                        const newSections = [...f.sections];
                                        newSections[i] = { ...newSections[i], title: val };
                                        return { ...f, sections: newSections };
                                    });
                                }}
                                required
                            />
                        ) : null}

                        <label className="block mb-1 font-semibold">Contenu de la section</label>
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
                            className="w-full p-2 border rounded"
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
