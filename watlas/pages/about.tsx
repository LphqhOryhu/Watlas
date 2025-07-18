'use client';

export default function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">🙋‍♂️ À propos de moi</h1>

            <section className="space-y-2">
                <p>
                    Salut ! Je m'appelle Hugo DE BRABANDER. Je suis actuellement étudiant en ingénierie informatique en alternance, passionné par le développement web, les systèmes distribués et la sécurité.
                </p>
                <p>
                    En parallèle de mes études, je travaille sur plusieurs projets personnels : simulateurs techniques, visualisations interactives, RPG narratif en ligne, outils de supervision, et plus récemment un wiki dynamique sur le lore de Warcraft.
                </p>
                <p>
                    J'aime apprendre en construisant, améliorer mes outils au fil du temps, et documenter ce que je fais pour le partager avec d'autres développeurs.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">🔧 Stack actuelle</h2>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                    <li>Frontend : React / Next.js 15, Angular, Tailwind CSS</li>
                    <li>Backend : Node.js, Express, MongoDB, Supabase, WebSocket</li>
                    <li>DevOps : Docker, GitHub Actions, Architecture microservices</li>
                </ul>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">🎯 Objectifs</h2>
                <p>
                    Mon objectif est de devenir un développeur complet, capable de concevoir, sécuriser et faire évoluer un projet logiciel du début à la fin. Je m'intéresse aussi à la pédagogie et à l'accessibilité numérique.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">📬 Me contacter</h2>
                <p>
                    Tu peux me retrouver sur GitHub, LinkedIn, ou simplement me laisser un commentaire sur la page dédiée du site.
                </p>
            </section>
        </div>
    );
}
