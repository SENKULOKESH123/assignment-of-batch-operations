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

router.post('/', (req, res) => {
  const { batchCode, courseName, centreName, startDate, enrolled, totalCapacity, status } = req.body ?? {};
  const normalizedCode = String(batchCode ?? '').trim().toUpperCase();
  const normalizedCourse = String(courseName ?? '').trim();
  const normalizedCentre = String(centreName ?? '').trim();
  const normalizedDate = String(startDate ?? '').trim();
  const parsedEnrolled = Number(enrolled);
  const parsedCapacity = Number(totalCapacity);
  const allowedStatuses = ['Running', 'Upcoming', 'Completed'];

  if (!normalizedCode || !normalizedCourse || !normalizedCentre || !normalizedDate || !allowedStatuses.includes(status) ||
      !Number.isInteger(parsedEnrolled) || parsedEnrolled < 0 ||
      !Number.isInteger(parsedCapacity) || parsedCapacity < 1 || parsedEnrolled > parsedCapacity) {
    return res.status(400).json({ success: false, message: 'Provide valid batch details.' });
  }

  if (batches.some((batch) => batch.batchCode.toLowerCase() === normalizedCode.toLowerCase())) {
    return res.status(409).json({ success: false, message: 'That batch code already exists.' });
  }

  const batch = {
    batchCode: normalizedCode,
    courseName: normalizedCourse,
    centreName: normalizedCentre,
    startDate: normalizedDate,
    enrolled: parsedEnrolled,
    totalCapacity: parsedCapacity,
    status
  };
  batches.push(batch);
  return res.status(201).json({ success: true, data: batch });
});

router.delete('/:batchCode', (req, res) => {
  const index = batches.findIndex((batch) => batch.batchCode.toLowerCase() === req.params.batchCode.toLowerCase());
  if (index === -1) return res.status(404).json({ success: false, message: 'Batch not found.' });
  const [deleted] = batches.splice(index, 1);
  return res.json({ success: true, data: deleted });
});

export default router;
