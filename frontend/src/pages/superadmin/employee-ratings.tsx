import { useState, useEffect } from 'react';
import { Star, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { fetchUsers, fetchFeedbackRatings, fetchTickets } from '../../services/api';
import type { BackendTicket, BackendUser, FeedbackRating } from '../../services/api';
import { Card } from '../../components/ui/Card';

interface EmployeeRatingsData {
  employee: {
    id: number;
    name: string;
    email: string;
  };
  ratings: FeedbackRating[];
  averageRating: number;
  totalRatings: number;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};

const RATING_COLORS: Record<number, string> = {
  1: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
  2: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
  3: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
  4: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  5: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
};

function getRatingStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-4 h-4 ${
        i < rating
          ? 'fill-yellow-400 text-yellow-400'
          : 'text-gray-300 dark:text-gray-600'
      }`}
    />
  ));
}

export default function EmployeeRatingsPage() {
  const [employees, setEmployees] = useState<EmployeeRatingsData[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRatingsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generalAverage, setGeneralAverage] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  useEffect(() => {
    void loadEmployeeRatings();
  }, []);

  const loadEmployeeRatings = async () => {
    setLoading(true);
    try {
      const [usersData, ratingsData, ticketsData] = await Promise.all([
        fetchUsers().catch(() => [] as BackendUser[]),
        fetchFeedbackRatings(),
        fetchTickets().catch(() => [] as BackendTicket[]),
      ]);

      const ticketRatings = ticketsData
        .map((ticket) => ticket.feedback_rating)
        .filter((rating): rating is FeedbackRating => Boolean(rating));

      const combinedRatings = [...ratingsData];
      const seenTicketIds = new Set(combinedRatings.map((rating) => rating.ticket));
      for (const rating of ticketRatings) {
        if (!seenTicketIds.has(rating.ticket)) {
          combinedRatings.push(rating);
          seenTicketIds.add(rating.ticket);
        }
      }

      const employeeLookup = new Map<number, BackendUser>();
      for (const user of usersData) {
        if (String(user.role || '').toLowerCase() === 'employee') {
          employeeLookup.set(user.id, user);
        }
      }

      const aggregateTotal = combinedRatings.reduce((sum, rating) => sum + rating.rating, 0);
      setTotalRatings(combinedRatings.length);
      setGeneralAverage(combinedRatings.length > 0 ? aggregateTotal / combinedRatings.length : 0);

      // Group ratings by employee
      const employeeRatingsMap: Record<number, FeedbackRating[]> = {};
      combinedRatings.forEach((rating) => {
        if (!employeeRatingsMap[rating.employee]) {
          employeeRatingsMap[rating.employee] = [];
        }
        employeeRatingsMap[rating.employee].push(rating);
      });

      // Create employee ratings data
      const reviewers: EmployeeRatingsData[] = Object.entries(employeeRatingsMap)
        .map(([employeeId, ratings]) => {
          const user = employeeLookup.get(Number(employeeId));
          const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
          const averageRating = totalRating / ratings.length;

          return {
            employee: {
              id: Number(employeeId),
              name: user
                ? `${user.first_name} ${user.last_name}`.trim() || user.username
                : ratings[0]?.employee_name || `Employee #${employeeId}`,
              email: user?.email || '',
            },
            ratings: ratings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
            averageRating,
            totalRatings: ratings.length,
          };
        })
        .sort((a, b) => b.averageRating - a.averageRating);

      setEmployees(reviewers);
      if (reviewers.length > 0) {
        setSelectedEmployee(reviewers[0]);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to load technical staff ratings';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Technical Staff Ratings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Performance feedback from resolved tickets
          </p>
        </div>
        <button
          onClick={loadEmployeeRatings}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Employees List */}
        <Card className="lg:col-span-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Employees ({employees.length})
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : employees.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No technical staff ratings yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {employees.map((emp) => (
                <button
                  key={emp.employee.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className={`w-full p-3 text-left rounded-lg transition-colors ${
                    selectedEmployee?.employee.id === emp.employee.id
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {emp.employee.name}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 dark:text-yellow-400">
                      <Star className="w-3.5 h-3.5 fill-yellow-400" />
                      {emp.averageRating.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {emp.totalRatings} rating{emp.totalRatings !== 1 ? 's' : ''}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Card>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">General Average</p>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {generalAverage.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Across all rated STFs</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Total Feedback Ratings</p>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalRatings}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Saved feedback records</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Rated Employees</p>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{employees.length}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Technical staff with ratings</p>
          </Card>
        </div>

        {/* Details View */}
        <Card className="lg:col-span-3">
          {selectedEmployee ? (
            <div className="space-y-6">
              {/* Summary Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedEmployee.employee.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedEmployee.employee.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {selectedEmployee.averageRating.toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Average Rating
                    </p>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1">
                    {getRatingStars(Math.round(selectedEmployee.averageRating))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {RATING_LABELS[Math.round(selectedEmployee.averageRating)]}
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-green-200 dark:border-green-800">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedEmployee.totalRatings}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Total Ratings
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedEmployee.ratings.filter((r) => r.rating >= 4).length}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Good/Excellent
                    </p>
                  </div>
                </div>
              </div>

              {/* Ratings List */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recent Ratings History
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedEmployee.ratings.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No ratings yet
                    </p>
                  ) : (
                    selectedEmployee.ratings.map((rating) => (
                      <div
                        key={rating.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex gap-0.5">
                                {getRatingStars(rating.rating)}
                              </div>
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded ${RATING_COLORS[rating.rating]}`}
                              >
                                {rating.rating}/5
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {RATING_LABELS[rating.rating]}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              <strong>Ticket:</strong> {rating.stf_no}
                            </p>
                            {rating.comments && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                                {rating.comments}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(rating.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              by {rating.admin_name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 py-12">
              <AlertCircle className="w-8 h-8 mr-2 opacity-50" />
              <span>Select an employee to view ratings</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
