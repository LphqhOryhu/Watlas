import Link from 'next/link';
import { Page } from '@/types/page';

interface Props {
    page: Page;
}

export default function PageCard({ page }: Props) {
    return (
        <Link href={`/${page.type}/${page.id}`}>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition duration-200 cursor-pointer">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {page.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {page.type}
                </p>
                {page.description && (
                    <p className="mt-2 text-gray-800 dark:text-gray-200 text-sm">
                        {page.description}
                    </p>
                )}
            </div>
        </Link>
    );
}
