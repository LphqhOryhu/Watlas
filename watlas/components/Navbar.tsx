import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white">
            <Link href="/" className="text-xl font-bold">📚 Watlas</Link>
            <Link href="/ajouter" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
                ➕ Ajouter une fiche
            </Link>
        </nav>
    );
}
