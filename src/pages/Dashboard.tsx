import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatsCards from '../components/StatsCards';
import FilterBar from '../components/FilterBar';
import LeadTable from '../components/LeadTable';
import Pagination from '../components/Pagination';
import AddLeadModal from '../components/AddLeadModal';
import CreateUserModal from '../components/CreateUserModal';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { getLeadsApi, createLeadApi, updateLeadApi, deleteLeadApi } from '../services/api';
import { exportToCSV } from '../utils/exportCSV';
import { Lead } from '../types/lead';

interface DashboardProps {
  dark: boolean;
  onToggleDark: () => void;
}

const LEADS_PER_PAGE = 10;

const Dashboard: React.FC<DashboardProps> = ({ dark, onToggleDark }) => {
  const { user } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [createUserOpen, setCreateUserOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getLeadsApi({
        search: debouncedSearch || undefined,
        status: status || undefined,
        source: source || undefined,
        sort: sort || undefined,
        page,
      });
      // Support both array and paginated object response
      const data = res.data;
      if (Array.isArray(data)) {
        setLeads(data);
        setTotalPages(Math.ceil(data.length / LEADS_PER_PAGE) || 1);
      } else {
        setLeads(data.leads || data.data || []);
        setTotalPages(data.totalPages || data.pages || 1);
      }
    } catch {
      setError('Failed to load leads. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, source, sort, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSaveLead = async (formData: Omit<Lead, '_id' | 'createdAt'>) => {
    if (editLead?._id) {
      await updateLeadApi(editLead._id, formData);
    } else {
      await createLeadApi(formData);
    }
    await fetchLeads();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this lead? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteLeadApi(id);
      await fetchLeads();
    } catch {
      alert('Failed to delete lead.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditLead(lead);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditLead(null);
    setModalOpen(true);
  };

  const handleExport = () => {
    exportToCSV(leads, 'smart-leads-export');
  };

  const handleStatusChange = (v: string) => { setStatus(v); setPage(1); };
  const handleSourceChange = (v: string) => { setSource(v); setPage(1); };
  const handleSortChange = (v: string) => { setSort(v); setPage(1); };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar dark={dark} onToggleDark={onToggleDark} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Leads
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              Manage and track your sales pipeline
            </p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setCreateUserOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <svg className="h-3.5 w-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              Create User
            </button>
          )}
        </div>

        {/* Stats */}
        <StatsCards leads={leads} />

        {/* Filter bar */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
          <FilterBar
            search={search}
            onSearch={setSearch}
            status={status}
            onStatus={handleStatusChange}
            source={source}
            onSource={handleSourceChange}
            sort={sort}
            onSort={handleSortChange}
            onAdd={handleAddNew}
            onExport={handleExport}
          />
        </div>

        {/* Table area */}
        <div>
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-800 dark:bg-rose-900/10 animate-fade-in">
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>
              <button
                onClick={fetchLeads}
                className="mt-3 rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : leads.length === 0 ? (
            <EmptyState
              title={debouncedSearch || status || source ? 'No matching leads' : 'No leads yet'}
              description={
                debouncedSearch || status || source
                  ? 'Try adjusting your filters or search query.'
                  : 'Add your first lead to get started.'
              }
              action={
                !debouncedSearch && !status && !source ? (
                  <button
                    onClick={handleAddNew}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Lead
                  </button>
                ) : undefined
              }
            />
          ) : (
            <>
              <LeadTable
                leads={leads}
                isAdmin={user?.role === 'admin'}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </>
          )}
        </div>
      </main>

      <AddLeadModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditLead(null); }}
        onSave={handleSaveLead}
        initial={editLead}
      />

      <CreateUserModal
        isOpen={createUserOpen}
        onClose={() => setCreateUserOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
