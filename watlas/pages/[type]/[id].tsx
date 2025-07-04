'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Page } from '@/types/page';

export default function PageDetail() {
    const router = useRouter();
    const { type, id } = router.query;

    const [page, setPage] = useState<Page | null>(null);
    const [formData, setFormData] = useState<Page | null>(null);
    const [pages, setPages] = useState<Page[]>([]); // Liste complète pour les relations
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Charger la fiche courante avec gestion correcte des génériques Supabase
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
                setPage(data);
                setFormData(data);
            }

            setLoading(false);
        }

        fetchPage();
    }, [type, id]);

    // Charger toutes les pages pour résoudre les relations
    useEffect(() => {
        async function fetchPages() {
            const { data, error } = await supabase.from('pages').select('*');
            if (!error && data) setPages(data);
        }
        fetchPages();
    }, []);

    if (loading) return <p className="p-8 text-center">Chargement...</p>;
    if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
    if (!page) return <p className="p-8 text-center">Fiche introuvable...</p>;
    if (!formData) return null; // sécurité

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((f) => (f ? { ...f, [name]: value } : null));
    };

    // Edition des relations (checkbox)
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

        const { error: supaError } = await supabase.from('pages').upsert(formData);

        if (supaError) {
            setError('Erreur lors de la sauvegarde.');
        } else {
            setPage(formData);
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

            {error && <p className="mb-4 text-red-600">{error}</p>}

            {!editMode && (
                <div className="space-y-4">
                    <p>
                        <strong>Type :</strong> {page.type}
                    </p>
                    <p>
                        <strong>Description :</strong>
                        <br />
                        {page.description}
                    </p>

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
                                                    router.push(`/${relId}`); // fallback
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

                    <label className="block">
                        Description
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full p-2 border rounded"
                            required
                            disabled={saving}
                        />
                    </label>

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

                    <label className="block font-semibold mt-4">Relations</label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border p-2 rounded">
                        {pages.map((p) => (
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
