import React from 'react';
import { Page } from '@/types/page';
import Link from 'next/link';
import Image from 'next/image';

interface PageCardProps {
    page: Page;
}

export default function PageCard({ page }: PageCardProps) {
    // Récupérer un résumé à afficher
    const firstSectionTitle = page.sections && page.sections.length > 0 ? page.sections[0].title : null;
    const firstSectionContentPreview =
        page.sections && page.sections.length > 0
            ? page.sections[0].content.slice(0, 100) + (page.sections[0].content.length > 100 ? '...' : '')
            : null;

    return (
        <Link
            href={`/${page.type}/${page.id}`}
            className="border rounded shadow p-4 flex flex-col cursor-pointer hover:shadow-lg"
        >
            {page.imageUrl ? (
                <Image
                    src={page.imageUrl}
                    alt={page.name}
                    width={600}
                    height={400}
                    className="max-w-full max-h-80 object-cover rounded"
                    unoptimized={true} // si tu as besoin de désactiver l'optimisation Next.js
                />
            ) : (
                <div className="w-full h-48 bg-gray-200 rounded mb-4 flex items-center justify-center text-gray-400">
                    Pas d&apos;image
                </div>
            )}
            <h2 className="text-xl font-semibold">{page.name}</h2>

            {firstSectionTitle ? (
                <>
                    <h3 className="text-gray-700 font-semibold truncate">{firstSectionTitle}</h3>
                    {firstSectionContentPreview && (
                        <p className="text-gray-600 truncate">{firstSectionContentPreview}</p>
                    )}
                </>
            ) : (
                <p className="text-gray-600 italic">Pas de description</p>
            )}
        </Link>
    );
}
