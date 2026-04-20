import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import {
  ArrowUpRight,
  Share2,
  History,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  RefreshCw,
  User,
  GitBranch,
  FileDown,
  FileSpreadsheet,
  Download,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchTickets,
  fetchEscalationLogs,
  fetchAuditLogs,
  type EscalationLog,
  type AuditLogEntry,
} from '../../services/api';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import XLSXStyle from 'xlsx-js-style';
import { buildPdfDocument, openPrintWindow } from '../../utils/pdfTemplate';

const ITEMS_PER_PAGE = 4;
type FilterType = 'All' | 'Internal' | 'External';

function userName(u: { first_name: string; last_name: string; username: string } | null): string {
  if (!u) return 'Unknown';
  return `${u.first_name} ${u.last_name}`.trim() || u.username;
}

export default function AdminEscalation() {
  const [logs, setLogs] = useState<EscalationLog[]>([]);
  const [reassignLogs, setReassignLogs] = useState<AuditLogEntry[]>([]);
  const [ticketMap, setTicketMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [reassignPage, setReassignPage] = useState(1);

  /* ── Export ── */
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tickets, escalationLogs, assignLogs, passLogs] = await Promise.all([
        fetchTickets(),
        fetchEscalationLogs(),
        fetchAuditLogs({ action: 'ASSIGN' }).catch(() => [] as AuditLogEntry[]),
        fetchAuditLogs({ action: 'PASS' }).catch(() => [] as AuditLogEntry[]),
      ]);
      setLogs(escalationLogs);

      const combined = [...assignLogs, ...passLogs].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setReassignLogs(combined);

      const map: Record<number, string> = {};
      tickets.forEach((t) => { map[t.id] = t.stf_no; });
      setTicketMap(map);
    } catch {
      toast.error('Failed to load escalation data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  };

  const exportToXLSX = async () => {
    if (!logs.length && !reassignLogs.length) {
      toast.error('No escalation or reassign logs to export.');
      return;
    }
    setExporting(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const wb = XLSXStyle.utils.book_new();

      // ── Sheet 1: Escalation Logs ──
      const ws1: Record<string, unknown> = {};
      const colWidths1 = [20, 18, 15, 15, 25, 30, 18];
      ws1['!cols'] = colWidths1.map((w) => ({ wch: w }));

      const headerRow1: (string | { t: string; v: string; s: Record<string, unknown> })[] = [
        { t: 's', v: 'Ticket Number', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'Type', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'From User', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'To User', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'External Recipient', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'Notes', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'Date', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
      ];

      ws1['A1'] = headerRow1[0];
      ws1['B1'] = headerRow1[1];
      ws1['C1'] = headerRow1[2];
      ws1['D1'] = headerRow1[3];
      ws1['E1'] = headerRow1[4];
      ws1['F1'] = headerRow1[5];
      ws1['G1'] = headerRow1[6];

      logs.forEach((log, idx) => {
        const rowNum = idx + 2;
        const stfNo = ticketMap[log.ticket] || `Ticket #${log.ticket}`;
        const fromUser = log.from_user ? userName(log.from_user) : '';
        const toUser = log.to_user ? userName(log.to_user) : '';

        const bgColor = idx % 2 === 0 ? 'F5F5F5' : 'FFFFFF';
        const cellStyle = {
          fill: { fgColor: { rgb: bgColor } },
          alignment: { horizontal: 'left', wrapText: true },
          border: { bottom: { style: 'thin', color: { rgb: 'D3D3D3' } } },
        };

        ws1[`A${rowNum}`] = { t: 's', v: stfNo, s: cellStyle };
        ws1[`B${rowNum}`] = { t: 's', v: log.escalation_type === 'internal' ? 'Internal' : 'External', s: cellStyle };
        ws1[`C${rowNum}`] = { t: 's', v: fromUser, s: cellStyle };
        ws1[`D${rowNum}`] = { t: 's', v: toUser, s: cellStyle };
        ws1[`E${rowNum}`] = { t: 's', v: log.to_external || '', s: cellStyle };
        ws1[`F${rowNum}`] = { t: 's', v: log.notes || '', s: cellStyle };
        ws1[`G${rowNum}`] = { t: 's', v: formatDate(log.created_at), s: cellStyle };
      });

      ws1['!ref'] = `A1:G${logs.length + 1}`;
      XLSXStyle.utils.book_append_sheet(wb, ws1, 'Escalation Logs');

      // ── Sheet 2: Reassign Logs ──
      const ws2: Record<string, unknown> = {};
      const colWidths2 = [20, 15, 15, 30, 18];
      ws2['!cols'] = colWidths2.map((w) => ({ wch: w }));

      const headerRow2: (string | { t: string; v: string; s: Record<string, unknown> })[] = [
        { t: 's', v: 'Ticket Number', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'Action', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'Actor', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'Activity', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'Date', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
      ];

      ws2['A1'] = headerRow2[0];
      ws2['B1'] = headerRow2[1];
      ws2['C1'] = headerRow2[2];
      ws2['D1'] = headerRow2[3];
      ws2['E1'] = headerRow2[4];

      reassignLogs.forEach((log, idx) => {
        const rowNum = idx + 2;
        const stfNo = ticketMap[log.entity_id!] || `Ticket #${log.entity_id}`;

        const bgColor = idx % 2 === 0 ? 'F5F5F5' : 'FFFFFF';
        const cellStyle = {
          fill: { fgColor: { rgb: bgColor } },
          alignment: { horizontal: 'left', wrapText: true },
          border: { bottom: { style: 'thin', color: { rgb: 'D3D3D3' } } },
        };

        ws2[`A${rowNum}`] = { t: 's', v: stfNo, s: cellStyle };
        ws2[`B${rowNum}`] = { t: 's', v: log.action, s: cellStyle };
        ws2[`C${rowNum}`] = { t: 's', v: log.actor_email || 'System', s: cellStyle };
        ws2[`D${rowNum}`] = { t: 's', v: log.activity, s: cellStyle };
        ws2[`E${rowNum}`] = { t: 's', v: new Date(log.timestamp).toLocaleString(), s: cellStyle };
      });

      ws2['!ref'] = `A1:E${reassignLogs.length + 1}`;
      XLSXStyle.utils.book_append_sheet(wb, ws2, 'Reassign Logs');

      XLSXStyle.writeFile(wb, `escalation_logs_${dateStr}.xlsx`);
      toast.success('Escalation and reassign logs exported to Excel.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export to Excel.');
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  const exportToPDF = async () => {
    if (!logs.length && !reassignLogs.length) {
      toast.error('No escalation or reassign logs to export.');
      return;
    }
    setExporting(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];

      // Escalation logs table
      const escalationRows = logs.map((log) => [
        ticketMap[log.ticket] || `Ticket #${log.ticket}`,
        log.escalation_type === 'internal' ? 'Internal' : 'External',
        log.from_user ? userName(log.from_user) : '',
        log.to_user ? userName(log.to_user) : '',
        log.to_external || '',
        log.notes || '',
        formatDate(log.created_at),
      ]);

      const escalationTableHtml = `
        <h2 style="color: #154734; margin-top: 20px;">Escalation Logs</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Ticket Number</th>
              <th>Type</th>
              <th>From User</th>
              <th>To User</th>
              <th>External Recipient</th>
              <th>Notes</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${escalationRows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      `;

      // Reassign logs table
      const reassignRows = reassignLogs.map((log) => [
        ticketMap[log.entity_id!] || `Ticket #${log.entity_id}`,
        log.action,
        log.actor_email || 'System',
        log.activity,
        new Date(log.timestamp).toLocaleString(),
      ]);

      const reassignTableHtml = `
        <h2 style="color: #154734; margin-top: 20px;">Reassign Logs</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Ticket Number</th>
              <th>Action</th>
              <th>Actor</th>
              <th>Activity</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${reassignRows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      `;

      const recordSummary = `${logs.length} escalation log(s) and ${reassignLogs.length} reassign log(s)`;
      const bodyContent = escalationTableHtml + reassignTableHtml;
      const html = buildPdfDocument(
        'Escalation & Reassign Logs Report',
        'Escalation & Reassign Logs Report',
        bodyContent,
        recordSummary
      );
      await openPrintWindow(html, `escalation_logs_${dateStr}.pdf`);
      toast.success('Escalation and reassign logs exported to PDF.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export to PDF.');
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  const filtered = logs.filter((item) => {
    if (filterType === 'Internal') return item.escalation_type === 'internal';
    if (filterType === 'External') return item.escalation_type === 'external';
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const totalReassignPages = Math.max(1, Math.ceil(reassignLogs.length / ITEMS_PER_PAGE));
  const pagedReassign = reassignLogs.slice((reassignPage - 1) * ITEMS_PER_PAGE, reassignPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ticket Escalation</h1>
          <p className="text-gray-500 dark:text-gray-400">View escalation and reassign logs</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          {logs.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting}
                className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Export"
              >
                <Download className="w-4 h-4" />
                Export
                <ChevronDown className="w-3 h-3" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[150px]">
                  <button
                    onClick={exportToXLSX}
                    disabled={exporting}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel (XLSX)
                  </button>
                  <button
                    onClick={exportToPDF}
                    disabled={exporting}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors last:rounded-b-lg disabled:opacity-50"
                  >
                    <FileDown className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <h3 className="font-bold text-gray-900 dark:text-white">Reassign Logs</h3>
            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{reassignLogs.length} total</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#3BC25B]"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {pagedReassign.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center flex flex-col items-center gap-3">
                <GitBranch className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No reassignment records yet.</p>
              </div>
            ) : (
              pagedReassign.map((log) => (
                <div key={log.id} className="p-3.5 rounded-lg border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-900/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            log.action === 'PASS'
                              ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                              : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          <GitBranch className="w-3 h-3" />
                          {log.action === 'PASS' ? 'Passed' : 'Assigned'}
                        </span>
                        {log.entity_id && (
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {ticketMap[log.entity_id] ?? `Ticket #${log.entity_id}`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{log.activity}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
                        <User className="w-3 h-3" />
                        <span>{log.actor_email || 'System'}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {totalReassignPages > 1 && (
          <div className="flex items-center gap-1 mt-4">
            <button
              onClick={() => setReassignPage((p) => Math.max(1, p - 1))}
              disabled={reassignPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-[#3BC25B] hover:text-white text-gray-600 dark:text-gray-400 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalReassignPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setReassignPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  reassignPage === page
                    ? 'bg-[#3BC25B] text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setReassignPage((p) => Math.min(totalReassignPages, p + 1))}
              disabled={reassignPage === totalReassignPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-[#3BC25B] hover:text-white text-gray-600 dark:text-gray-400 disabled:opacity-40 transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="font-bold text-gray-900 dark:text-white">Escalation History</h3>
          </div>
          <div className="flex items-center gap-2">
            {(['All', 'Internal', 'External'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilterType(f);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  filterType === f
                    ? f === 'Internal'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : f === 'External'
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-[#3BC25B] text-white border-[#3BC25B]'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {f}
              </button>
            ))}
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">{filtered.length} total</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#3BC25B]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {paged.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center flex flex-col items-center gap-3">
                <History className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No escalations yet.</p>
              </div>
            ) : (
              paged.map((item) => {
                const isInternal = item.escalation_type === 'internal';
                const stfNo = ticketMap[item.ticket] || `Ticket #${item.ticket}`;
                const toLabel = isInternal
                  ? (item.to_user ? userName(item.to_user) : 'Supervisor')
                  : (item.to_external || 'External Party');

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border ${
                      isInternal
                        ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10'
                        : 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{stfNo}</span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              isInternal
                                ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                                : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                            }`}
                          >
                            {isInternal ? <ArrowUpRight className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                            {isInternal ? 'Internal' : 'External'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 mb-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium">From:</span> {userName(item.from_user)}
                          <span className="mx-1 text-gray-300">→</span>
                          <span className="font-medium">To:</span> {toLabel}
                        </div>

                        {item.notes && <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.notes}</div>}
                        <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(item.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center gap-1 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-[#3BC25B] hover:text-white text-gray-600 dark:text-gray-400 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-[#3BC25B] text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-[#3BC25B] hover:text-white text-gray-600 dark:text-gray-400 disabled:opacity-40 transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
