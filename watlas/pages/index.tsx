import { useEffect, useState } from "react";
import { Page } from "@/types/page";
import PageCard from "@/components/PageCard";

export default function Home() {
    const [pages, setPages] = useState<Page[]>([]);

    useEffect(() => {
        fetch("/api/pages")
            .then((res) => res.json())
            .then(setPages);
    }, []);

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
