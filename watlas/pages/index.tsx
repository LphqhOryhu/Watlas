import { useEffect, useState } from "react";
import { Page } from "@/types/page";
import PageCard from "@/components/PageCard";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPages = async () => {
            const { data, error } = await supabase.from<'pages', Page>('pages').select('*');
            if (error) {
                console.error(error);
            } else if (data) {
                setPages(data);
            }
            setLoading(false);
        };
        fetchPages();
    }, []);

    if (loading) return <p>Chargement...</p>;
    if (pages.length === 0) return <p>Aucune fiche trouvée.</p>;

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold mb-6">📚 Watlas — Atlas Warcraft</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map((page) => (
                    <PageCard key={page.id} page={page} />
                ))}
            </div>
        </main>
    );
}
