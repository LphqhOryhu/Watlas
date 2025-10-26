'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface Backup {
    id: string;
    created_at: string;
    name: string;
    data: Record<string, unknown>[];}

export default function BackupPage() {
    const { user } = useAuth();
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchBackups();
        }
    }, [user]);

    async function fetchBackups() {
        setLoading(true);
        const { data, error } = await supabase
            .from('backups')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) console.error(error);
        else setBackups(data as Backup[]);
        setLoading(false);
    }

    async function createBackup() {
        const { data, error } = await supabase.from('pages').select('*');
        if (error) return alert('Erreur pendant la récupération des données.');

        const backupName = `backup-${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`;
        const { error: insertError } = await supabase.from('backups').insert([
            {
                name: backupName,
                data,
            }
        ]);


        if (insertError) alert('Erreur lors de la création de la backup.');
        else {
            alert('Backup créée avec succès.');
            fetchBackups();
        }
    }

    async function deleteBackup(id: string) {
        if (!confirm('Supprimer cette backup ?')) return;
        const { error } = await supabase.from('backups').delete().eq('id', id);
        if (error) alert('Erreur lors de la suppression.');
        else fetchBackups();
    }

    function downloadBackup(backup: Backup) {
        const blob = new Blob([JSON.stringify(backup.data, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${backup.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function copyBackup(backup: Backup) {
        navigator.clipboard.writeText(JSON.stringify(backup.data, null, 2));
        alert('Backup copiée dans le presse-papier.');
    }

    if (!user) return <p className="p-4">⛔ Vous devez être connecté</p>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">💾 Sauvegardes</h1>
            <button
                onClick={createBackup}
                className="mb-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
                ➕ Créer une backup
            </button>

            {loading ? (
                <p>Chargement...</p>
            ) : (
                <table className="w-full border text-sm">
                    <thead className="bg-gray-900">
                    <tr>
                        <th className="text-left p-2 border">Date</th>
                        <th className="text-left p-2 border">Nom</th>
                        <th className="text-left p-2 border">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {backups.map((b) => (
                        <tr key={b.id} className="border-t">
                            <td className="p-2 border">
                                {format(new Date(b.created_at), 'Pp')}
                            </td>
                            <td className="p-2 border">{b.name}</td>
                            <td className="p-2 border space-x-2">
                                <button
                                    onClick={() => copyBackup(b)}
                                    className="text-blue-600 hover:underline"
                                >
                                    Copier
                                </button>
                                <button
                                    onClick={() => downloadBackup(b)}
                                    className="text-green-600 hover:underline"
                                >
                                    Télécharger
                                </button>
                                <button
                                    onClick={() => deleteBackup(b.id)}
                                    className="text-red-600 hover:underline"
                                >
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
