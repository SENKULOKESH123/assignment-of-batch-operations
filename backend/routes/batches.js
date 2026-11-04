import { Router } from 'express';
import { batches } from '../data/batches.js';

const router = Router();

router.get('/', (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 5));
  const search = String(req.query.search ?? '').trim().toLowerCase();
  const status = String(req.query.status ?? '').trim().toLowerCase();
  const centre = String(req.query.centre ?? '').trim().toLowerCase();

  const matching = batches.filter((batch) => {
    const matchesSearch = !search || batch.batchCode.toLowerCase().includes(search) || batch.courseName.toLowerCase().includes(search);
    const matchesStatus = !status || batch.status.toLowerCase() === status;
    const matchesCentre = !centre || batch.centreName.toLowerCase() === centre;
    return matchesSearch && matchesStatus && matchesCentre;
  });

  const totalRecords = matching.length;
  const totalPages = Math.ceil(totalRecords / limit);
  const safePage = totalPages ? Math.min(page, totalPages) : 1;
  const start = (safePage - 1) * limit;

  res.json({
    success: true,
    data: matching.slice(start, start + limit),
    pagination: { page: safePage, limit, totalRecords, totalPages, from: totalRecords ? start + 1 : 0, to: Math.min(start + limit, totalRecords) }
  });
});

export default router;
