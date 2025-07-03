// pages/api/add-page.ts
import { promises as fs } from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Page } from '@/types/page';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const newPage: Page = req.body;

        const filePath = path.join(process.cwd(), 'data/pages.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const pages: Page[] = JSON.parse(fileContent);

        // Vérifie si l'ID existe déjà
        if (pages.find((p) => p.id === newPage.id)) {
            return res.status(400).json({ error: 'ID déjà existant' });
        }

        // Ajout de la nouvelle page
        pages.push(newPage);
        await fs.writeFile(filePath, JSON.stringify(pages, null, 2));

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
}
