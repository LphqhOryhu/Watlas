import { NextApiRequest, NextApiResponse } from 'next';
import pages from '../../data/pages.json';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json(pages);
}
