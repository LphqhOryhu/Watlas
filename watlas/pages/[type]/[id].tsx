'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Page, PageType } from '@/types/page';

export default function PageDetail() {
    const router = useRouter();
    const { type, id } = router.query;

    const [page, setPage] = useState<Page | null>(null);
    const [formData, setFormData] = useState<Page | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Charger la fiche depuis Supabase à chaque changement de type/id
    useEffect(() => {
        if (!type || !id) return;

        setLoading(true);
        setError(null);

        supabase
            .from<Page>('pages')
            .select('*')
            .eq('id', id)
            .eq('type', type)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    setError('Erreur lors du chargement de la fiche.');
                    setPage(null);
                    setFormData(null);
                } else {
                    setPage(data);
                    setFormData(data);
                }
            })
            .finally(() => setLoading(false));
    }, [type, id]);

    if (loading) return <p className="p-8 text-center">Chargement...</p>;
    if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
    if (!page) return <p className="p-8 text-center">Fiche introuvable...</p>;
    if (!formData) return null; // sécurité

    // Gestion du formulaire
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(f => f ? { ...f, [name]: value } : null);
    };

    // Sauvegarder la fiche dans Supabase
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        setSaving(true);
        setError(null);

        // upsert = insert ou update si déjà existant
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

    // Supprimer la fiche de Supabase
    const handleDelete = async () => {
        if (!confirm('Voulez-vous vraiment supprimer cette fiche ?')) return;
        setSaving(true);
        setError(null);

        const { error: supaError } = await supabase.from('pages').delete().eq('id', page.id).eq('type', page.type);

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
            {/* Actions */}
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

            {/* Affichage erreurs */}
            {error && <p className="mb-4 text-red-600">{error}</p>}

            {/* Vue lecture seule */}
            {!editMode && (
                <div className="space-y-4">
                    <p><strong>Type :</strong> {page.type}</p>
                    <p><strong>Description :</strong><br />{page.description}</p>

                    {page.relations && page.relations.length > 0 && (
                        <div>
                            <h2 className="font-semibold mt-4 mb-2">Relations</h2>
                            <ul className="list-disc list-inside">
                                {page.relations.map(relId => (
                                    <li key={relId} className="text-blue-600 hover:underline cursor-pointer"
                                        onClick={() => router.push(`/${type}/${relId}`)}>
                                        {relId}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Mode édition */}
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
                            {['personnage', 'lieu', 'groupe', 'objet', 'événement', 'période', 'année', 'support_narratif'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </label>

                    {/* TODO : Ajoute l’édition des relations ici */}

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
