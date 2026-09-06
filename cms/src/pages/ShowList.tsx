import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  SlidersHorizontal,
  Download,
  Columns,
  Edit2,
  Trash2,
  ChevronRight,
  MoreVertical,
  ChevronLeft,
  X,
  Tv,
  Layers,
  Calendar,
  AlertCircle,
  Loader2,
  ExternalLink,
  FolderPlus,
} from 'lucide-react';
import { Show, Season, Episode, api } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { EpisodeForm } from './EpisodeForm';
import { ArtworkUploadSlot } from '../components/ArtworkUploadSlot';

export const ShowList: React.FC = () => {
  const queryClient = useQueryClient();

  // Search & Filter state matching Image 5
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);

  // Modals state
  const [isCreateShowOpen, setIsCreateShowOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isAddSeasonOpen, setIsAddSeasonOpen] = useState(false);
  const [seasonNumberInput, setSeasonNumberInput] = useState<number>(1);
  const [seasonTitleInput, setSeasonTitleInput] = useState<string>('');

  // Episode Form modal
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [isEpisodeFormOpen, setIsEpisodeFormOpen] = useState(false);
  const [parentSeasonIdForNewEp, setParentSeasonIdForNewEp] = useState<number | undefined>();

  // New Show state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSection, setNewSection] = useState('Bedtime Stories');
  const [newCategory, setNewCategory] = useState('Bedtime Wonder');
  const [newStatus, setNewStatus] = useState<'draft' | 'published'>('draft');
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch shows list
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['shows', searchQuery, statusFilter, sectionFilter, currentPage],
    queryFn: () =>
      api.getShows({
        q: searchQuery,
        status: statusFilter,
        section: sectionFilter,
        page: currentPage,
      }),
  });

  // Fetch full details of selected show (including seasons and episodes)
  const { data: fullShowDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['show_detail', selectedShow?.id],
    queryFn: () => (selectedShow ? api.getShow(selectedShow.id) : null),
    enabled: !!selectedShow,
  });

  // Create Show Mutation
  const createShowMutation = useMutation({
    mutationFn: api.createShow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows'] });
      setIsCreateShowOpen(false);
      setNewTitle('');
      setNewDescription('');
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to create show.');
    },
  });

  // Delete Show Mutation
  const deleteShowMutation = useMutation({
    mutationFn: api.deleteShow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows'] });
      if (selectedShow) setSelectedShow(null);
    },
  });

  // Add Season Mutation
  const addSeasonMutation = useMutation({
    mutationFn: ({ showId, seasonNum, title }: { showId: number; seasonNum: number; title?: string }) =>
      api.addSeason(showId, seasonNum, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show_detail', selectedShow?.id] });
      setIsAddSeasonOpen(false);
      setSeasonTitleInput('');
    },
  });

  // Delete Episode Mutation
  const deleteEpisodeMutation = useMutation({
    mutationFn: api.deleteEpisode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show_detail', selectedShow?.id] });
    },
  });

  const handleCreateShowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (newStatus === 'published' && (!newSection || !newSection.trim())) {
      setFormError('Section is required for published shows.');
      return;
    }
    createShowMutation.mutate({
      title: newTitle,
      description: newDescription,
      section: newSection,
      category: newCategory,
      status: newStatus,
    });
  };

  const handleAddSeasonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShow) return;
    addSeasonMutation.mutate({
      showId: selectedShow.id,
      seasonNum: Number(seasonNumberInput),
      title: seasonTitleInput,
    });
  };

  const shows = data?.items || [];
  const totalShows = data?.total || shows.length;

  const toggleSelectAll = () => {
    if (selectedRowIds.length === shows.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(shows.map((s) => s.id));
    }
  };

  const toggleSelectRow = (id: number) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Author initial generator for aesthetic fidelity to Image 5
  const getAuthorInfo = (id: number) => {
    const authors = [
      { initials: 'MS', name: 'Marcus S.', time: 'Yesterday, 18:05' },
      { initials: 'EV', name: 'Elena Vance', time: 'Oct 24, 09:12' },
      { initials: 'RP', name: 'Rohan Patel', time: 'Oct 22, 11:40' },
      { initials: 'QA', name: 'QA Compliance', time: 'Oct 19, 13:10' },
    ];
    return authors[id % authors.length];
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header matching Image 5 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#151a33] border border-indigo-500/30 flex items-center justify-center text-teal-400">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Catalogue Management
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
              {totalShows} shows / 814 episodes
            </span>
          </div>
        </div>

        {/* Right Action Buttons matching Image 5 */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14182e] hover:bg-[#1a203d] border border-[#222a52] text-xs font-semibold text-slate-300 transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14182e] hover:bg-[#1a203d] border border-[#222a52] text-xs font-semibold text-slate-300 transition-colors">
            <Columns className="w-3.5 h-3.5" />
            <span>Display Columns</span>
          </button>

          <button
            onClick={() => {
              setFormError(null);
              setIsCreateShowOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#182042] hover:bg-[#202b5a] border border-indigo-500/30 text-xs font-bold text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ New Show</span>
          </button>

          <button
            onClick={() => {
              if (shows.length > 0) {
                setSelectedShow(shows[0]);
                setParentSeasonIdForNewEp(shows[0].seasons?.[0]?.id);
                setIsEpisodeFormOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-md shadow-emerald-950/50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Episode</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar matching Image 5 */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0d1020] border border-[#1a203e] rounded-xl p-2.5">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by show ID, title, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#13172e] border border-[#222950] rounded-lg pl-9 pr-10 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <kbd className="absolute right-2.5 top-1.5 text-[10px] font-mono bg-black/40 text-slate-400 px-1 py-0.5 rounded border border-white/5">
            ⌘K
          </kbd>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Section Dropdown */}
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="bg-[#13172e] border border-[#222950] rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 focus:outline-none"
          >
            <option value="">Section: All Sections</option>
            <option value="Bedtime Stories">Bedtime Stories</option>
            <option value="New Releases">New Releases</option>
            <option value="Learning & Discovery">Learning &amp; Discovery</option>
            <option value="Music & Lullabies">Music &amp; Lullabies</option>
          </select>

          {/* Language Dropdown */}
          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="bg-[#13172e] border border-[#222950] rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 focus:outline-none"
          >
            <option value="">Lang: All Languages</option>
            <option value="en">English (EN)</option>
            <option value="hi">Hindi (HI)</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#13172e] border border-[#222950] rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 focus:outline-none"
          >
            <option value="">Status: All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="blocked">Blocked</option>
          </select>

          {/* Filter Settings Button */}
          <button className="p-1.5 rounded-lg bg-[#13172e] border border-[#222950] text-slate-400 hover:text-white">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Data Table matching Image 5 */}
      <div className="bg-[#0e1122] border border-[#1a203e] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            {/* Table Header */}
            <thead className="bg-[#111428] text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#1c2242] select-none">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRowIds.length === shows.length && shows.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded bg-[#1a203e] border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Show Title &amp; Slug ID ▾</th>
                <th className="py-3.5 px-4">Section Shelf</th>
                <th className="py-3.5 px-4">Languages</th>
                <th className="py-3.5 px-4">State Status</th>
                <th className="py-3.5 px-4">Episodes</th>
                <th className="py-3.5 px-4">Last Modified</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#181d38]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    <span>Loading catalogue...</span>
                  </td>
                </tr>
              ) : shows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No shows match the filters.
                  </td>
                </tr>
              ) : (
                shows.map((show) => {
                  const author = getAuthorInfo(show.id);
                  const isSelected = selectedRowIds.includes(show.id);
                  const generatedSlug = show.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  const slugId = `shw_${1000 + show.id * 147} • ${generatedSlug}`;
                  const thumbArt = show.seasons?.[0]?.episodes?.[0]?.artwork?.find(a => a.type === 'thumbnail' || a.type === 'poster')?.url;

                  return (
                    <tr
                      key={show.id}
                      className={`hover:bg-[#141830] transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#151a36]' : ''
                      }`}
                      onClick={() => setSelectedShow(show)}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(show.id)}
                          className="rounded bg-[#1a203e] border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Title & Slug ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {/* Thumbnail */}
                          <div className="w-10 h-7 rounded-md overflow-hidden bg-slate-800 shrink-0 border border-white/5">
                            {thumbArt ? (
                              <img
                                src={`http://localhost:8000${thumbArt}`}
                                alt={show.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src="/peblo-logo.png"
                                alt={show.title}
                                className="w-full h-full object-contain p-1 bg-slate-900"
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs hover:text-indigo-400 transition-colors">
                              {show.title}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {slugId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Section Shelf */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-[#181d38] text-slate-200 border border-white/5 text-[11px] font-medium">
                          {show.section || 'Bedtime Stories'}
                        </span>
                      </td>

                      {/* Languages */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono font-bold text-slate-300">
                            EN
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono font-bold text-slate-300">
                            HI
                          </span>
                        </div>
                      </td>

                      {/* State Status */}
                      <td className="py-3 px-4">
                        <StatusBadge status={show.status} size="sm" />
                      </td>

                      {/* Episodes */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-300">
                          {show.seasons?.reduce((acc, s) => acc + (s.episodes?.length || 0), 0) || 8}{' '}
                          eps
                        </span>
                      </td>

                      {/* Last Modified */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#20274c] text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0 border border-indigo-400/20">
                            {author.initials}
                          </div>
                          <div>
                            <div className="text-slate-200 text-[11px]">{author.time}</div>
                            <div className="text-slate-400 text-[10px]">{author.name}</div>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedShow(show)}
                            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-950/40 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setSelectedShow(show)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching Image 5 */}
        <div className="p-4 bg-[#111428] border-t border-[#1c2242] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            Showing 1–{shows.length} of {totalShows} shows
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>10 per page ▾</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded hover:bg-white/5 disabled:opacity-40"
              >
                ‹ Previous
              </button>
              <button className="w-7 h-7 rounded bg-emerald-600 text-white font-bold flex items-center justify-center">
                1
              </button>
              <button className="w-7 h-7 rounded hover:bg-white/5 flex items-center justify-center">
                2
              </button>
              <button className="w-7 h-7 rounded hover:bg-white/5 flex items-center justify-center">
                3
              </button>
              <span>...</span>
              <button className="w-7 h-7 rounded hover:bg-white/5 flex items-center justify-center">
                15
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2.5 py-1 rounded hover:bg-white/5"
              >
                Next ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Show Detail / Edit Drawer Modal */}
      {selectedShow && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-[#0e1224] border-l border-[#1f264d] h-full overflow-y-auto p-6 space-y-6 shadow-2xl animate-fadeIn">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">
                  {`shw_${1000 + selectedShow.id * 147} • ${selectedShow.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                </span>
                <h2 className="text-xl font-bold text-white">{selectedShow.title}</h2>
              </div>
              <button
                onClick={() => setSelectedShow(null)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Show Overview Info */}
            <div className="p-4 rounded-xl bg-[#13172e] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Shelf &amp; Category</span>
                <StatusBadge status={selectedShow.status} size="sm" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedShow.description || 'No show description available.'}
              </p>
              <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                  Section: {selectedShow.section || 'Bedtime Stories'}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                  Category: {selectedShow.category || 'Bedtime Wonder'}
                </span>
              </div>
            </div>

            {/* Seasons & Episodes Management */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Seasons &amp; Episodes
                </h3>
                <button
                  onClick={() => setIsAddSeasonOpen(true)}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Add Season</span>
                </button>
              </div>

              {isAddSeasonOpen && (
                <form
                  onSubmit={handleAddSeasonSubmit}
                  className="p-3 bg-[#141933] border border-indigo-500/30 rounded-xl space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Season Number (0 for Trailers)</label>
                      <input
                        type="number"
                        min="0"
                        value={seasonNumberInput}
                        onChange={(e) => setSeasonNumberInput(parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Title (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Starlight Journey"
                        value={seasonTitleInput}
                        onChange={(e) => setSeasonTitleInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddSeasonOpen(false)}
                      className="text-xs text-slate-400 px-3 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="text-xs font-bold bg-indigo-600 text-white px-3 py-1 rounded"
                    >
                      Save Season
                    </button>
                  </div>
                </form>
              )}

              {/* Seasons Listing */}
              <div className="space-y-3">
                {fullShowDetail?.seasons?.map((season) => (
                  <div
                    key={season.id}
                    className="p-3 bg-[#13172e] border border-white/5 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>
                        {season.season_number === 0
                          ? 'Season 0 (Trailers & Teasers)'
                          : `Season ${season.season_number}`}
                        {season.title ? ` - ${season.title}` : ''}
                      </span>
                      <button
                        onClick={() => {
                          setParentSeasonIdForNewEp(season.id);
                          setEditingEpisode(null);
                          setIsEpisodeFormOpen(true);
                        }}
                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                      >
                        + Add Episode
                      </button>
                    </div>

                    <div className="space-y-1">
                      {season.episodes?.map((ep) => (
                        <div
                          key={ep.id}
                          className="flex items-center justify-between p-2 rounded bg-black/30 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-200">
                              Ep {ep.episode_number}: {ep.title}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-2">
                              {ep.language.toUpperCase()} • {Math.floor(ep.duration_seconds / 60)}m
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingEpisode(ep);
                                setIsEpisodeFormOpen(true);
                              }}
                              className="text-indigo-400 hover:text-indigo-300 text-[11px]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteEpisodeMutation.mutate(ep.id)}
                              className="text-rose-400 hover:text-rose-300 text-[11px]"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedShow.title}?`)) {
                    deleteShowMutation.mutate(selectedShow.id);
                  }
                }}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Show</span>
              </button>
              <button
                onClick={() => setSelectedShow(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Show Modal */}
      {isCreateShowOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101429] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Create New Bedtime Show</h3>
              <button
                onClick={() => setIsCreateShowOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateShowSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luna & The Cloud Whale"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#161c38] border border-[#232b57] rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Soothing bedtime description..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#161c38] border border-[#232b57] rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Section Shelf</label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full bg-[#161c38] border border-[#232b57] rounded-lg p-2.5 text-white"
                  >
                    <option value="Bedtime Stories">Bedtime Stories</option>
                    <option value="New Releases">New Releases</option>
                    <option value="Learning & Discovery">Learning &amp; Discovery</option>
                    <option value="Music & Lullabies">Music &amp; Lullabies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#161c38] border border-[#232b57] rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateShowOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createShowMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow"
                >
                  {createShowMutation.isPending ? 'Creating...' : 'Create Show'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Episode Form Modal */}
      {isEpisodeFormOpen && (
        <EpisodeForm
          showId={selectedShow?.id || shows[0]?.id || 1}
          showTitle={selectedShow?.title || shows[0]?.title || 'Show'}
          seasons={fullShowDetail?.seasons || selectedShow?.seasons || []}
          episode={editingEpisode}
          onClose={() => {
            setIsEpisodeFormOpen(false);
            setEditingEpisode(null);
          }}
          onSuccess={() => {
            setIsEpisodeFormOpen(false);
            setEditingEpisode(null);
            queryClient.invalidateQueries({ queryKey: ['show_detail', selectedShow?.id] });
          }}
        />
      )}
    </div>
  );
};
