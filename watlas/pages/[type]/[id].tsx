'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Page } from '@/types/page';
import Image from 'next/image';

export default function PageDetail() {
    const router = useRouter();
    const { type, id } = router.query;

    const [page, setPage] = useState<Page | null>(null);
    const [formData, setFormData] = useState<Page | null>(null);
    const [pages, setPages] = useState<Page[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const predefinedSectionTitles = [
        "Warcraft I",
        "Warcraft II",
        "Warcraft III",
        "World of Warcraft",
        "Warcraft Le Commencement",
        "Autres",
    ];


    // Charger la fiche courante
    useEffect(() => {
        if (!type || !id) return;

        async function fetchPage() {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('id', id)
                .eq('type', type)
                .single();

            if (error) {
                setError('Erreur lors du chargement de la fiche.');
                setPage(null);
                setFormData(null);
            } else {
                // si sections absentes ou null, on les remplace par []
                const pageData = {
                    ...data,
                    sections: data.sections ?? [],
                };
                setPage(pageData);
                setFormData(pageData);
            }

            setLoading(false);
        }
        fetchPage();
    }, [type, id]);


    // Charger toutes les pages (pour les relations)
    useEffect(() => {
        async function fetchPages() {
            const { data, error } = await supabase.from('pages').select('*');
            if (!error && data) setPages(data);
        }
        fetchPages();
    }, []);

    if (loading) return <p className="p-8 text-center">Chargement...</p>;
    if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
    if (!page || !formData) return <p className="p-8 text-center">Fiche introuvable...</p>;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((f) => (f ? { ...f, [name]: value } : null));
    };

    const handleRelationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        const value = e.target.value;
        setFormData((f) => ({
            ...f!,
            relations: checked
                ? [...(f?.relations || []), value]
                : (f?.relations || []).filter((id) => id !== value),
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        setSaving(true);
        setError(null);

        // Préparer les données à envoyer sans modifier l'image si non changée
        const dataToSave: Partial<Page> = { ...formData };

        // Si l'imageUrl n'a pas changé, on la retire pour ne pas l'écraser
        if (page?.imageUrl === formData.imageUrl) {
            delete dataToSave.imageUrl;
        }

        const { error: supaError } = await supabase.from('pages').upsert(dataToSave);

        if (supaError) {
            setError('Erreur lors de la sauvegarde.');
        } else {
            // Mise à jour locale de la page avec ce qu'on a envoyé
            setPage((prev) => (prev ? { ...prev, ...dataToSave } : dataToSave as Page));
            setEditMode(false);
            alert('Fiche mise à jour avec succès.');
        }
        setSaving(false);
    };


    const handleDelete = async () => {
        if (!confirm('Voulez-vous vraiment supprimer cette fiche ?')) return;
        setSaving(true);
        setError(null);

        const { error: supaError } = await supabase
            .from('pages')
            .delete()
            .eq('id', page.id)
            .eq('type', page.type);

        if (supaError) {
            setError('Erreur lors de la suppression.');
            setSaving(false);
        } else {
            alert('Fiche supprimée.');
            router.push('/');
        }
    };

    return (
        <main className="p-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{page.name}</h1>
                {!editMode && (
                    <button
                        onClick={() => setEditMode(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        disabled={saving}
                    >
                        Modifier
                    </button>
                )}
            </div>

            {!editMode && (
                <p
                    className={`inline-block px-3 py-1 rounded-full font-semibold mb-4 
          ${page.canon ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                    {page.canon ? 'Lore canon' : 'Lore non canon'}
                </p>
            )}

            {error && <p className="mb-4 text-red-600">{error}</p>}

            {!editMode && (
                <div className="space-y-4">
                    {formData.imageUrl && (
                        <Image
                            src={formData.imageUrl}
                            alt={page.name}
                            width={600}
                            height={400}
                            className="rounded mb-4"
                            unoptimized
                        />
                    )}
                    <p>
                        <strong>Type :</strong> {page.type}
                    </p>
                    {formData.sections && formData.sections.length > 0 ? (
                        formData.sections.map((section, i) => (
                            <section key={i} className="mb-6">
                                <h3 className="text-xl font-semibold">{section.title}</h3>
                                <p>{section.content}</p>
                            </section>
                        ))
                    ) : (
                        <p>Aucune section disponible.</p>
                    )}


                    {page.relations && page.relations.length > 0 && (
                        <div>
                            <h2 className="font-semibold mt-4 mb-2">Relations</h2>
                            <ul className="list-disc list-inside">
                                {page.relations.map((relId) => {
                                    const relPage = pages.find((p) => p.id === relId);
                                    return (
                                        <li
                                            key={relId}
                                            className="text-blue-600 hover:underline cursor-pointer"
                                            onClick={() => {
                                                if (relPage) {
                                                    router.push(`/${relPage.type}/${relPage.id}`);
                                                } else {
                                                    router.push(`/${relId}`);
                                                }
                                            }}
                                        >
                                            {relPage ? relPage.name : relId}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            )}


            {editMode && (
                <form onSubmit={handleSave} className="space-y-4">
                    <label className="block">
                        Nom
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                            disabled={saving}
                        />
                    </label>

                    <div>
                        <label className="block font-semibold mb-2">Sections</label>
                        {formData.sections?.map((section, i) => (
                            <div key={i} className="mb-4 border p-2 rounded">
                                <select
                                    className="w-full p-2 border rounded mb-2 bg-black"
                                    value={
                                        predefinedSectionTitles.includes(section.title)
                                            ? section.title
                                            : "Autres"
                                    }
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData((f) => {
                                            if (!f) return null;
                                            const newSections = [...f.sections];
                                            newSections[i] = {
                                                ...newSections[i],
                                                title: value === "Autres" ? "" : value,
                                            };
                                            return { ...f, sections: newSections };
                                        });
                                    }}
                                    required
                                    disabled={saving}
                                >
                                    {predefinedSectionTitles.map((title) => (
                                        <option key={title} value={title}>
                                            {title}
                                        </option>
                                    ))}
                                </select>

                                {(!predefinedSectionTitles.includes(section.title) || section.title === "") && (
                                    <input
                                        type="text"
                                        placeholder="Entrez un titre personnalisé"
                                        className="w-full p-2 border rounded mb-2"
                                        value={section.title}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData((f) => {
                                                if (!f) return null;
                                                const newSections = [...f.sections];
                                                newSections[i] = { ...newSections[i], title: val };
                                                return { ...f, sections: newSections };
                                            });
                                        }}
                                        required
                                        disabled={saving}
                                    />
                                )}

                                <textarea
                                    name={`section-content-${i}`}
                                    value={section.content}
                                    placeholder="Contenu de la section"
                                    rows={3}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData((f) => {
                                            if (!f) return null;
                                            const newSections = [...(f.sections || [])];
                                            newSections[i] = { ...newSections[i], content: value };
                                            return { ...f, sections: newSections };
                                        });
                                    }}
                                    className="w-full p-1 border rounded"
                                    required
                                    disabled={saving}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData((f) => {
                                            if (!f) return null;
                                            const newSections = [...(f.sections || [])];
                                            newSections.splice(i, 1);
                                            return { ...f, sections: newSections };
                                        });
                                    }}
                                    className="mt-1 text-red-600 hover:underline"
                                    disabled={saving}
                                >
                                    Supprimer la section
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => {
                                setFormData((f) => ({
                                    ...f!,
                                    sections: [...(f?.sections || []), { title: "", content: "" }],
                                }));
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            disabled={saving}
                        >
                            Ajouter une section
                        </button>
                    </div>



                    <label className="block">
                        Type
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            disabled={saving}
                        >
                            {[
                                'personnage',
                                'lieu',
                                'groupe',
                                'objet',
                                'événement',
                                'période',
                                'année',
                                'support_narratif',
                            ].map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        URL de l’image
                        <input
                            type="url"
                            name="imageUrl"
                            value={formData.imageUrl || ''}
                            onChange={handleChange}
                            placeholder="https://exemple.com/monimage.png"
                            className="w-full p-2 border rounded"
                            disabled={saving}
                        />
                    </label>

                    <label className="block font-semibold mt-4 flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="canon"
                            checked={formData.canon}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData((f) => (f ? { ...f, canon: checked } : null));
                            }}
                            disabled={saving}
                        />
                        <span>Cette fiche est canon</span>
                    </label>

                    <label className="block font-semibold mt-2">Relations (filtrées par canon)</label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border p-2 rounded">
                        {pages
                            .filter((p) => p.canon === formData.canon && p.id !== page.id)
                            .map((p) => (
                                <label key={p.id} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        value={p.id}
                                        checked={formData.relations?.includes(p.id) ?? false}
                                        onChange={handleRelationChange}
                                        disabled={saving}
                                    />
                                    {p.name} <span className="text-gray-500">({p.type})</span>
                                </label>
                            ))}
                    </div>


                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                            disabled={saving}
                        >
                            Enregistrer
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditMode(false);
                                setFormData(page);
                                setError(null);
                            }}
                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                            disabled={saving}
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="ml-auto bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                            disabled={saving}
                        >
                            Supprimer
                        </button>
                    </div>
                </form>
            )}
        </main>
    );

}
