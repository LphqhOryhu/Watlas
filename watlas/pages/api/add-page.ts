import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const newPage = req.body;

        const { data, error } = await supabase.from('pages').insert(newPage);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ success: true, data });
    } catch (_error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
}
