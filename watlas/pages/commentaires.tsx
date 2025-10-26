'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

interface Comment {
    id: string;
    content: string;
    created_at: string;
    author_id: string | null;
}

export default function CommentPage() {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAdminView, setIsAdminView] = useState(false);

    useEffect(() => {
        fetchComments();
    }, []);

    async function fetchComments() {
        setLoading(true);
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setComments(data);
        setLoading(false);
    }

    async function postComment() {
        if (!newComment.trim()) return;
        const { error } = await supabase.from('comments').insert({
            content: newComment,
            author_id: user?.id || null,
        });
        if (!error) {
            setNewComment('');
            fetchComments();
        }
    }

    async function deleteComment(id: string) {
        if (!confirm('Supprimer ce commentaire ?')) return;
        await supabase.from('comments').delete().eq('id', id);
        fetchComments();
    }

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">💬 Commentaires</h1>

            {user && (
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={isAdminView}
                        onChange={() => setIsAdminView(!isAdminView)}
                    />
                    <span>Vue administrateur</span>
                </label>
            )}

            {!isAdminView && (
                <div className="space-y-4">
          <textarea
              className="w-full p-2 border rounded"
              placeholder="Écris ton commentaire ici..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
          />
                    <button
                        onClick={postComment}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Envoyer
                    </button>
                </div>
            )}

            {loading ? (
                <p>Chargement...</p>
            ) : (
                <div className="space-y-2">
                    {comments.map((c) => (
                        <div
                            key={c.id}
                            className="p-3 border rounded bg-white dark:bg-gray-900"
                        >
                            <div className="text-sm text-gray-500">
                                {new Date(c.created_at).toLocaleString()}
                            </div>
                            <p>{c.content}</p>
                            {isAdminView && (
                                <button
                                    onClick={() => deleteComment(c.id)}
                                    className="text-red-600 text-sm mt-1 hover:underline"
                                >
                                    Supprimer
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
