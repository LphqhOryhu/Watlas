import React from 'react';
import { Page } from '@/types/page';
import Link from 'next/link';

interface PageCardProps {
    page: Page;
}

export default function PageCard({ page }: PageCardProps) {
    return (
        <Link
            href={`/${page.type}/${page.id}`}
            className="border rounded shadow p-4 flex flex-col cursor-pointer hover:shadow-lg"
        >
            {page.imageUrl ? (
                <img
                    src={page.imageUrl}
                    alt={page.name}
                    className="w-full h-48 object-cover rounded mb-4"
                />
            ) : (
                <div className="w-full h-48 bg-gray-200 rounded mb-4 flex items-center justify-center text-gray-400">
                    Pas d'image
                </div>
            )}
            <h2 className="text-xl font-semibold">{page.name}</h2>
            <p className="text-gray-600 truncate">{page.description || 'Pas de description'}</p>
        </Link>
    );
}
