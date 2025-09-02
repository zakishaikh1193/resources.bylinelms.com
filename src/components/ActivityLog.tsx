import React, { useState, useEffect } from 'react';
import { Search, Download, Globe, FileText, RefreshCw, School, Calendar } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

interface ActivityLog {
  log_id: number;
  user_id: number;
  resource_id: number;
  ip_address: string;
  user_agent?: string;
  created_at: string;
  school_name: string;
  school_email: string;
  school_organization: string;
  user_role: string;
  resource_title: string;
  resource_description?: string;
  file_name: string;
  file_size: number;
  file_extension: string;
  resource_type: string;
  subject_name: string;
  grade_level: string;
  details: any;
}

interface ActivityLogProps {
  token: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ token }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSchool, setFilterSchool] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const { user } = useAuth();

  useEffect(() => {
    fetchActivityLogs();
  }, [token, currentPage, filterSchool, startDate, endDate]);

  const fetchActivityLogs = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filterSchool !== 'all' && { school_id: filterSchool }),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      });

      const response = await fetch(`${API_ENDPOINTS.ACTIVITY_SCHOOL_DOWNLOADS}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        // Process logs to extract school names and resource information
        const processedLogs = data.data.logs.map((log: any) => ({
          ...log,
          log_id: log.download_id, // Map download_id to log_id for compatibility
          school_name: log.school_organization || log.school_name,
          details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details
        }));
        
        setLogs(processedLogs);
        setTotalPages(data.data.pagination.pages);
        setTotalLogs(data.data.pagination.total);
      } else {
        console.error('Failed to fetch activity logs:', data.message);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchActivityLogs();
  };

  const handleExport = () => {
    // Export functionality can be implemented here
    console.log('Export functionality to be implemented');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">School Resource Downloads</h2>
          <p className="text-gray-600">Monitor which schools downloaded which resources and when</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by school name or resource title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Asia/Kolkata">Timezone: IST (Asia/Kolkata)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">EST (America/New_York)</option>
              <option value="Europe/London">GMT (Europe/London)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SCHOOL NAME</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">RESOURCE DOWNLOADED</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">DETAILS</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">DOWNLOAD TIME</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log, index) => (
                <tr key={log.log_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {((currentPage - 1) * 20) + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {log.school_name}
                        </div>
                        <div className="text-sm text-gray-500">{log.school_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {log.resource_title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.subject_name} • {log.grade_level} • {log.resource_type}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatFileSize(log.file_size)} • {log.file_extension.toUpperCase()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span>IP: {log.ip_address || 'N/A'}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        File: {log.file_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {formatDate(log.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalLogs)} of {totalLogs} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {logs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Download className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No download records found</h3>
          <p className="text-gray-600">
            {searchTerm || startDate || endDate
              ? "Try adjusting your search terms or filters."
              : "No resources have been downloaded yet."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
