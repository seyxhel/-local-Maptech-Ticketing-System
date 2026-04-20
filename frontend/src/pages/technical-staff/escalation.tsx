import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import {
  History,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileSpreadsheet,
  Download,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchTickets,
  fetchEscalationLogs,
  exportEscalationLogs,
  type BackendTicket,
  type EscalationLog,
} from '../../services/api';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import XLSXStyle from 'xlsx-js-style';
import { buildPdfDocument, openPrintWindow } from '../../utils/pdfTemplate';

const ITEMS_PER_PAGE = 4;

export default function TechnicalStaffEscalation() {
  /* ── Data ── */
  const [tickets, setTickets] = useState<BackendTicket[]>([]);
  const [logs, setLogs] = useState<EscalationLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  /* ── Export ── */
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  /* ── Pagination ── */
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [fetchedTickets, fetchedLogs] = await Promise.all([
        fetchTickets(),
        fetchEscalationLogs(),
      ]);
      setTickets(fetchedTickets);
      setLogs(fetchedLogs);
    } catch {
      toast.error('Failed to load tickets or escalation history.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── History pagination ── */
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / ITEMS_PER_PAGE));
  const pagedLogs = sortedLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ── Helpers ── */
  const getStfNo = (ticketId: number) =>
    tickets.find((t) => t.id === ticketId)?.stf_no ?? `#${ticketId}`;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  };

  const exportToXLSX = async () => {
    if (!logs.length) {
      toast.error('No escalation logs to export.');
      return;
    }
    setExporting(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const ws: Record<string, unknown> = {};
      const colWidths = [20, 18, 15, 15, 25, 30, 18];
      ws['!cols'] = colWidths.map((w) => ({ wch: w }));

      // Header
      const headerRow: (string | { t: string; v: string; s: Record<string, unknown> })[] = [
        { t: 's', v: 'Ticket Number', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'Type', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'From User', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'To User', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'External Recipient', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'Notes', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
        { t: 's', v: 'Date', s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: '154734' } }, alignment: { horizontal: 'center' } } },
      ];

      ws['A1'] = headerRow[0];
      ws['B1'] = headerRow[1];
      ws['C1'] = headerRow[2];
      ws['D1'] = headerRow[3];
      ws['E1'] = headerRow[4];
      ws['F1'] = headerRow[5];
      ws['G1'] = headerRow[6];

      // Data rows
      sortedLogs.forEach((log, idx) => {
        const rowNum = idx + 2;
        const stfNo = getStfNo(log.ticket);
        const fromUser = log.from_user ? `${log.from_user.first_name} ${log.from_user.last_name}` : '';
        const toUser = log.to_user ? `${log.to_user.first_name} ${log.to_user.last_name}` : '';

        const bgColor = idx % 2 === 0 ? 'F5F5F5' : 'FFFFFF';
        const cellStyle = {
          fill: { fgColor: { rgb: bgColor } },
          alignment: { horizontal: 'left', wrapText: true },
          border: { bottom: { style: 'thin', color: { rgb: 'D3D3D3' } } },
        };

        ws[`A${rowNum}`] = { t: 's', v: stfNo, s: cellStyle };
        ws[`B${rowNum}`] = { t: 's', v: log.escalation_type === 'internal' ? 'Internal' : 'External', s: cellStyle };
        ws[`C${rowNum}`] = { t: 's', v: fromUser, s: cellStyle };
        ws[`D${rowNum}`] = { t: 's', v: toUser, s: cellStyle };
        ws[`E${rowNum}`] = { t: 's', v: log.to_external || '', s: cellStyle };
        ws[`F${rowNum}`] = { t: 's', v: log.notes || '', s: cellStyle };
        ws[`G${rowNum}`] = { t: 's', v: formatDate(log.created_at), s: cellStyle };
      });

      ws['!ref'] = `A1:G${sortedLogs.length + 1}`;
      const wb = XLSXStyle.utils.book_new();
      XLSXStyle.utils.book_append_sheet(wb, ws, 'Escalation Logs');
      XLSXStyle.writeFile(wb, `escalation_logs_${dateStr}.xlsx`);
      toast.success('Escalation logs exported to Excel.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export to Excel.');
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  const exportToPDF = async () => {
    if (!logs.length) {
      toast.error('No escalation logs to export.');
      return;
    }
    setExporting(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const rows = sortedLogs.map((log) => [
        getStfNo(log.ticket),
        log.escalation_type === 'internal' ? 'Internal' : 'External',
        log.from_user ? `${log.from_user.first_name} ${log.from_user.last_name}` : '',
        log.to_user ? `${log.to_user.first_name} ${log.to_user.last_name}` : '',
        log.to_external || '',
        log.notes || '',
        formatDate(log.created_at),
      ]);

      const tableHtml = `
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
            ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      `;

      const recordSummary = `${logs.length} escalation log(s)`;
      const html = buildPdfDocument(
        'Escalation Logs Report',
        'Escalation Logs Report',
        tableHtml,
        recordSummary
      );
      await openPrintWindow(html, `escalation_logs_${dateStr}.pdf`);
      toast.success('Escalation logs exported to PDF.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export to PDF.');
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  const typeLabel = (log: EscalationLog) =>
    log.escalation_type === 'internal' ? 'Internal' : 'External';

  const toLabel = (log: EscalationLog) =>
    log.to_external || (log.to_user ? `User #${log.to_user}` : 'Supervisor');

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ticket Escalation</h1>
            <p className="text-gray-500 dark:text-gray-400">Escalation history for your tickets</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loadingData}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
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

        {loadingData ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#3BC25B]" />
            <span className="ml-2 text-gray-500 dark:text-gray-400">Loading…</span>
          </div>
        ) : (
          <Card>
            <div className="flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <h3 className="font-bold text-gray-900 dark:text-white">Escalation History</h3>
              <span className="ml-auto text-xs text-gray-400">{logs.length} total</span>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No escalations yet.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {pagedLogs.map((log) => {
                    const isInternal = log.escalation_type === 'internal';
                    return (
                      <div
                        key={log.id}
                        className={`p-4 rounded-lg border ${
                          isInternal
                              ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10'
                              : 'border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/10'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  {getStfNo(log.ticket)}
                                </span>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                    isInternal
                                      ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                                      : 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300'
                                  }`}
                                >
                                  {typeLabel(log)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                To: <span className="font-medium text-gray-800 dark:text-gray-200">{toLabel(log)}</span>
                              </p>
                              {log.notes && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                  &ldquo;{log.notes}&rdquo;
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {formatDate(log.created_at)}
                              </span>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                {isInternal ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-teal-500" />
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {isInternal ? 'Pending reassignment' : 'Externally escalated'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </Card>
          )}
        </div>
    </>
  );
}
