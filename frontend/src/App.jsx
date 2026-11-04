import { useEffect, useMemo, useState } from 'react';
import { Activity, BookOpen, Building2, ChevronLeft, ChevronRight, CircleHelp, ClipboardList, Filter, GraduationCap, LayoutDashboard, LogOut, Search, Users } from 'lucide-react';
import { createBatch, deleteBatch, getBatches } from './services/batches.js';

const PAGE_SIZE = 5;
const emptyBatch = { batchCode: '', courseName: '', centreName: '', startDate: '', enrolled: '', totalCapacity: '', status: 'Upcoming' };
const navItems = [
  { label: 'Franchise Management', icon: Building2, active: true },
  { label: 'Student Management', icon: GraduationCap },
  { label: 'LMS', icon: BookOpen },
  { label: 'Finance', icon: ClipboardList },
  { label: 'HRMS', icon: Users },
  { label: 'Centers', icon: LayoutDashboard },
  { label: 'Assets', icon: Activity },
  { label: 'Support', icon: CircleHelp }
];

function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00`));
}

export default function App() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [centre, setCentre] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: { page: 1, limit: PAGE_SIZE, totalRecords: 0, totalPages: 0, from: 0, to: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [batchForm, setBatchForm] = useState(emptyBatch);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const next = await getBatches({ page, limit: PAGE_SIZE, search, status, centre }, controller.signal);
        setResult(next);
        if (next.pagination.page !== page) setPage(next.pagination.page);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Something went wrong while loading batches.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, search ? 250 : 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [page, search, status, centre]);

  const centres = useMemo(() => ['London-HQ', 'Birmingham', 'Manchester', 'Leeds', 'Bristol'], []);
  const { data, pagination } = result;

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function resetFilters() {
    setSearch('');
    setStatus('');
    setCentre('');
    setPage(1);
  }

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await createBatch({ ...batchForm, enrolled: Number(batchForm.enrolled), totalCapacity: Number(batchForm.totalCapacity) });
      setShowCreate(false);
      setBatchForm(emptyBatch);
      setPage(1);
      setError('');
      const next = await getBatches({ page: 1, limit: PAGE_SIZE, search, status, centre });
      setResult(next);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(batchCode) {
    if (!window.confirm(`Delete ${batchCode}?`)) return;
    try {
      await deleteBatch(batchCode);
      setPage(1);
      const next = await getBatches({ page: 1, limit: PAGE_SIZE, search, status, centre });
      setResult(next);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Batchwise home"><span className="brand-mark">B</span><span>batchwise<span className="brand-dot">.</span></span></a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon, active }) => <a key={label} className={`nav-item ${active ? 'active' : ''}`} href="#top" onClick={(event) => event.preventDefault()}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{active && <span className="nav-caret">›</span>}</a>)}
        </nav>
        <div className="sidebar-bottom"><div className="user-card"><div className="avatar">AC</div><div className="user-copy"><strong>Alex Carter</strong><span>Administrator</span></div><button className="icon-button" aria-label="Log out"><LogOut size={16} /></button></div><div className="version">BATCHWISE ADMIN <span>v2.4.0</span></div></div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>Franchise Management</strong></div><div className="topbar-right"><span className="online-dot" /> All systems operational <div className="avatar small">AC</div></div></header>
        <section className="page-wrap">
          <div className="page-heading"><div><div className="eyebrow">FRANCHISE MANAGEMENT <span>•</span> OPERATIONS</div><h1>Batch Operations</h1><p className="subtitle">Manage and monitor your training batches across all centres.</p></div><button className="create-button" type="button" onClick={() => { setFormError(''); setShowCreate(true); }}><span>＋</span> Create Batch</button></div>

          <section className="content-card" aria-label="Batch list">
            <div className="toolbar">
              <label className="search-box"><Search size={17} /><span className="sr-only">Search by batch code or course name</span><input value={search} onChange={(e) => updateFilter(setSearch, e.target.value)} placeholder="Search by batch code or course name" /></label>
              <label className="select-wrap"><span className="sr-only">Filter by status</span><select value={status} onChange={(e) => updateFilter(setStatus, e.target.value)}><option value="">All Status</option><option>Running</option><option>Upcoming</option><option>Completed</option></select></label>
              <label className="select-wrap"><span className="sr-only">Filter by centre</span><select value={centre} onChange={(e) => updateFilter(setCentre, e.target.value)}><option value="">All Centres</option>{centres.map((item) => <option key={item}>{item}</option>)}</select></label>
              <button className="filter-button" type="button" aria-label="Reset filters" title="Reset filters" onClick={resetFilters}><Filter size={17} /></button>
            </div>

            <div className="table-scroll"><table><thead><tr><th>Batch Code</th><th>Course</th><th>Centre</th><th>Start Date</th><th>Capacity</th><th>Status</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {loading && <tr><td className="table-message" colSpan="7"><span className="spinner" /> Loading batches…</td></tr>}
                {!loading && error && <tr><td className="table-message error-message" colSpan="7"><strong>Could not load batches.</strong><br />{error}<br /><span>Check that the backend is running at http://localhost:4000.</span></td></tr>}
                {!loading && !error && data.length === 0 && <tr><td className="table-message" colSpan="7"><div className="empty-icon"><Search size={19} /></div><strong>No batches found</strong><span>Try adjusting your search or filters.</span></td></tr>}
                {!loading && !error && data.map((batch) => <tr key={batch.batchCode}><td><span className="batch-code">{batch.batchCode}</span></td><td className="course-cell">{batch.courseName}</td><td><span className="centre-cell"><Building2 size={14} />{batch.centreName}</span></td><td className="date-cell">{formatDate(batch.startDate)}</td><td><div className="capacity"><span>{batch.enrolled}<span className="muted"> / {batch.totalCapacity}</span></span><span className="capacity-track"><span style={{ width: `${Math.min(100, Math.round(batch.enrolled / batch.totalCapacity * 100))}%` }} /></span></div></td><td><span className={`status-badge ${batch.status.toLowerCase()}`}><i />{batch.status}</span></td><td><button className="more-button" aria-label={`Delete ${batch.batchCode}`} title="Delete batch" onClick={() => handleDelete(batch.batchCode)}>×</button></td></tr>)}
              </tbody></table></div>

            <footer className="table-footer"><div className="record-count">Showing <strong>{pagination.from}–{pagination.to}</strong> of <strong>{pagination.totalRecords}</strong> batches</div><div className="pagination" aria-label="Pagination"><button type="button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={16} /></button>{Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((number) => <button type="button" key={number} className={page === number ? 'current' : ''} disabled={loading} aria-current={page === number ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button>)}<button type="button" aria-label="Next page" disabled={page >= pagination.totalPages || loading || pagination.totalPages === 0} onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}><ChevronRight size={16} /></button></div></footer>
          </section>
          <div className="page-note"><span className="note-dot" /> Data refreshes from your connected workspace <span>•</span> Last updated just now</div>
        </section>
      </main>
      {showCreate && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCreate(false); }}><form className="modal" onSubmit={handleCreate}><div className="modal-heading"><div><h2>Create batch</h2><p>Add a new training batch to the workspace.</p></div><button type="button" className="modal-close" aria-label="Close" onClick={() => setShowCreate(false)}>×</button></div><div className="form-grid"><label>Batch code<input required value={batchForm.batchCode} onChange={(e) => setBatchForm({ ...batchForm, batchCode: e.target.value })} placeholder="B-2413" /></label><label>Course name<input required value={batchForm.courseName} onChange={(e) => setBatchForm({ ...batchForm, courseName: e.target.value })} placeholder="Course name" /></label><label>Centre<select required value={batchForm.centreName} onChange={(e) => setBatchForm({ ...batchForm, centreName: e.target.value })}><option value="">Select centre</option>{centres.map((item) => <option key={item}>{item}</option>)}</select></label><label>Start date<input required type="date" value={batchForm.startDate} onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })} /></label><label>Enrolled<input required type="number" min="0" value={batchForm.enrolled} onChange={(e) => setBatchForm({ ...batchForm, enrolled: e.target.value })} /></label><label>Total capacity<input required type="number" min="1" value={batchForm.totalCapacity} onChange={(e) => setBatchForm({ ...batchForm, totalCapacity: e.target.value })} /></label><label>Status<select value={batchForm.status} onChange={(e) => setBatchForm({ ...batchForm, status: e.target.value })}><option>Running</option><option>Upcoming</option><option>Completed</option></select></label></div>{formError && <p className="form-error">{formError}</p>}<div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="create-button" disabled={saving}>{saving ? 'Saving…' : 'Create batch'}</button></div></form></div>}
    </div>
  );
}
