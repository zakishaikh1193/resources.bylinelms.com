import React, { useState, useEffect } from 'react';
import { Search, Download, Globe, FileText, RefreshCw, School, Calendar, LogIn, Eye, Upload, Activity, LogOut } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

interface ActivityLog {
  log_id: number;
  school_name: string;
  school_email: string;
  school_organization: string;
  activity_type: 'login' | 'resource_download' | 'resource_view' | 'resource_upload' | 'resource_edit' | 'logout' | 'school_created' | 'other';
  resource_id?: number;
  resource_name?: string;
  downloaded_file_name?: string;
  file_name?: string;
  resource_type?: string;
  subject_name?: string;
  grade_level?: string;
  ip_address?: string;
  user_agent?: string;
  login_time?: string;
  activity_timestamp: string;
  file_size?: number;
  file_extension?: string;
  created_at: string;
  activity_id?: string;
}

interface ActivityLogProps {
  token: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ token }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSchool, setFilterSchool] = useState<string>('all');
  const [filterActivityType, setFilterActivityType] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [schools, setSchools] = useState<Array<{school_name: string, school_organization: string}>>([]);

  const { user } = useAuth();

  useEffect(() => {
    fetchActivityLogs();
    fetchSchools();
  }, [token, currentPage, filterSchool, filterActivityType, startDate, endDate]);

  const fetchSchools = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}?role=school`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setSchools(data.data.users.map((user: any) => ({
          school_name: user.name,
          school_organization: user.organization || user.name
        })));
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const fetchActivityLogs = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filterSchool !== 'all' && { school_name: filterSchool }),
        ...(filterActivityType !== 'all' && { action: filterActivityType }),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      });

      console.log('Fetching activity logs with URL:', `${API_ENDPOINTS.ACTIVITY_LOGS}?${params}`);
      
      const response = await fetch(`${API_ENDPOINTS.ACTIVITY_LOGS}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Activity logs response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Activity logs response data:', data);
      
      if (data.success) {
        // Process logs to ensure proper data structure
        const processedLogs = data.data.logs.map((log: any) => ({
          ...log,
          // Ensure all required fields have fallback values
          school_name: log.school_name || 'Unknown School',
          school_email: log.school_email || 'No email',
          school_organization: log.school_organization || log.school_name || 'Unknown Organization',
          activity_type: log.activity_type || 'other',
          activity_timestamp: log.activity_timestamp || log.created_at || new Date().toISOString(),
          resource_name: log.resource_name || log.downloaded_file_name || log.file_name || null,
          resource_type: log.resource_type || null,
          subject_name: log.subject_name || null,
          grade_level: log.grade_level || null,
          file_size: log.file_size || null,
          file_extension: log.file_extension || null,
          ip_address: log.ip_address || null,
          user_agent: log.user_agent || null,
          login_time: log.login_time || null
        }));
        
        console.log('Processed logs:', processedLogs);
        setLogs(processedLogs);
        setTotalPages(data.data.pagination?.pages || 1);
        setTotalLogs(data.data.pagination?.total || processedLogs.length);
      } else {
        console.error('Failed to fetch activity logs:', data.message);
        // Try fallback endpoint
        await fetchActivityLogsFallback();
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      // Try fallback endpoint
      await fetchActivityLogsFallback();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback function to try alternative endpoint
  const fetchActivityLogsFallback = async () => {
    try {
      console.log('Trying fallback activity data endpoint...');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filterSchool !== 'all' && { user_id: filterSchool }),
        ...(filterActivityType !== 'all' && { action: filterActivityType }),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      });

      const response = await fetch(`${API_ENDPOINTS.ACTIVITY_DATA}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fallback activity data response:', data);
        
        if (data.success && data.data.logs) {
          // Transform the data to match our expected format
          const transformedLogs = data.data.logs.map((log: any) => ({
            log_id: log.activity_id || Math.random().toString(36).substr(2, 9),
            school_name: log.user_name || log.school_name || 'Unknown School',
            school_email: log.user_email || 'No email',
            school_organization: log.school_name || log.user_name || 'Unknown Organization',
            activity_type: log.action || log.activity_type || 'other',
            resource_id: log.resource_id || null,
            resource_name: log.resource_title || log.resource_name || null,
            downloaded_file_name: log.resource_title || null,
            file_name: log.resource_title || null,
            resource_type: log.resource_type || null,
            subject_name: log.subject_name || null,
            grade_level: log.grade_level || null,
            ip_address: log.ip_address || null,
            user_agent: log.details?.user_agent || null,
            login_time: log.activity_type === 'user_login' ? log.created_at : null,
            activity_timestamp: log.created_at || new Date().toISOString(),
            file_size: log.details?.file_size || null,
            file_extension: log.details?.file_extension || null,
            created_at: log.created_at || new Date().toISOString(),
            activity_id: log.activity_id || null
          }));
          
          setLogs(transformedLogs);
          setTotalPages(data.data.pagination?.pages || 1);
          setTotalLogs(data.data.pagination?.total || transformedLogs.length);
          return;
        }
      }
      
      // If fallback also fails, set empty state
      console.log('Fallback also failed, setting empty state');
      setLogs([]);
      setTotalPages(1);
      setTotalLogs(0);
    } catch (error) {
      console.error('Fallback fetch error:', error);
      setLogs([]);
      setTotalPages(1);
      setTotalLogs(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
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

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'login':
        return <LogIn className="w-4 h-4 text-green-600" />;
      case 'logout':
        return <LogOut className="w-4 h-4 text-red-600" />;
      case 'resource_download':
        return <Download className="w-4 h-4 text-blue-600" />;
      case 'resource_view':
        return <Eye className="w-4 h-4 text-purple-600" />;
      case 'resource_upload':
        return <Upload className="w-4 h-4 text-orange-600" />;
      case 'resource_edit':
        return <FileText className="w-4 h-4 text-yellow-600" />;
      case 'school_created':
        return <School className="w-4 h-4 text-green-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityTypeLabel = (activityType: string) => {
    switch (activityType) {
      case 'login':
        return 'Login';
      case 'logout':
        return 'Logout';
      case 'resource_download':
        return '📥 Resource Download';
      case 'resource_view':
        return '👁️ Resource View';
      case 'resource_upload':
        return '📤 Resource Upload';
      case 'resource_edit':
        return '✏️ Resource Edited';
      case 'school_created':
        return '🏫 School Created';
      default:
        return 'Other Activity';
    }
  };

  const getActivityTypeColor = (activityType: string) => {
    switch (activityType) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-red-100 text-red-800';
      case 'resource_download':
        return 'bg-blue-200 text-blue-900 border border-blue-300';
      case 'resource_view':
        return 'bg-purple-100 text-purple-800';
      case 'resource_upload':
        return 'bg-orange-100 text-orange-800';
      case 'resource_edit':
        return 'bg-yellow-100 text-yellow-800';
      case 'school_created':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced function to get resource details display
  const getResourceDetailsDisplay = (log: ActivityLog) => {
    if (!log.resource_name) {
      return {
        hasResource: false,
        displayText: log.activity_type === 'login' ? 'User logged in' : 
                     log.activity_type === 'school_created' ? 'School created' : 'No resource associated',
        icon: log.activity_type === 'login' ? LogIn : 
              log.activity_type === 'school_created' ? School : Activity
      };
    }

    return {
      hasResource: true,
      fileName: log.resource_name,
      resourceType: log.resource_type,
      subject: log.subject_name,
      grade: log.grade_level,
      fileSize: log.file_size,
      fileExtension: log.file_extension,
      activityType: log.activity_type
    };
  };

  // Function to format file name for better display
  const formatFileName = (fileName: string) => {
    if (fileName.length > 40) {
      return fileName.substring(0, 37) + '...';
    }
    return fileName;
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchActivityLogs();
  };

  const handleExport = () => {
    // Export functionality can be implemented here
    console.log('Export functionality to be implemented');
  };

  const handleDownloadFromActivityLog = async (log: any, event?: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Full log object:', log);
    console.log('Available fields:', Object.keys(log));
    console.log('Resource ID value:', log.resource_id);
    console.log('Activity type:', log.activity_type);
    
    // Try to find resource_id from different possible fields
    const resourceId = log.resource_id || log.activity_id?.split('_')[1] || null;
    
    if (!resourceId) {
      console.error('No resource ID found for download. Available fields:', Object.keys(log));
      console.error('Log details:', {
        resource_id: log.resource_id,
        activity_id: log.activity_id,
        activity_type: log.activity_type,
        resource_name: log.resource_name
      });
      alert(`No resource ID found for download.\n\nActivity Type: ${log.activity_type}\nResource Name: ${log.resource_name}\n\nPlease check the activity log data.`);
      return;
    }

    // Use the proper API endpoint for resource download
    const downloadUrl = API_ENDPOINTS.RESOURCE_DOWNLOAD(resourceId);
    
    try {
      console.log('Admin downloading resource from activity log:', resourceId, log.resource_name);
      console.log('Download URL:', downloadUrl);
      console.log('Token available:', !!token);
      
      // Show loading state if event is available
      let originalText = '';
      let target: HTMLButtonElement | null = null;
      if (event && event.target) {
        target = event.target as HTMLButtonElement;
        originalText = target.textContent || '';
        target.textContent = 'Downloading...';
        target.disabled = true;
      }
      
      // Method 1: Try fetch first to check if resource exists and get proper response
      try {
        const response = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          // If response is OK, trigger download using blob
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          
          // Extract filename from response headers or use resource name
          const contentDisposition = response.headers.get('content-disposition');
          let filename = log.resource_name || `resource_${resourceId}`;
          
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
              filename = filenameMatch[1];
            }
          }
          
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          console.log('✅ Download completed successfully');
          alert(`Download started: ${filename}`);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (fetchError) {
        const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
        console.log('Fetch method failed, trying direct URL method:', errorMessage);
        
        // Fallback: Direct window.open with token parameter
        const urlWithAuth = `${downloadUrl}?token=${encodeURIComponent(token || '')}`;
        console.log('URL with auth:', urlWithAuth);
        
        // Open in new window/tab to trigger download
        const downloadWindow = window.open(urlWithAuth, '_blank');
        
        if (!downloadWindow) {
          // If popup blocked, try iframe method
          console.log('Popup blocked, trying iframe method');
          
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.src = urlWithAuth;
          
          document.body.appendChild(iframe);
          
          // Remove iframe after download starts
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            console.log('Download initiated via iframe');
            alert('Download initiated. Check your downloads folder.');
          }, 3000);
        } else {
          console.log('Download window opened successfully');
          alert('Download window opened. Check your downloads folder.');
          // Close the window after a short delay
          setTimeout(() => {
            if (downloadWindow && !downloadWindow.closed) {
              downloadWindow.close();
            }
          }, 2000);
        }
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Admin download from activity log error:', error);
      alert(`Failed to download resource: ${errorMessage}. Please try again.`);
    } finally {
      // Restore button state if event is available
      if (target) {
        target.textContent = originalText;
        target.disabled = false;
      }
    }
  };



  const filteredLogs = logs.filter(log => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.school_name.toLowerCase().includes(searchLower) ||
        log.school_organization.toLowerCase().includes(searchLower) ||
        (log.resource_name && log.resource_name.toLowerCase().includes(searchLower)) ||
        (log.downloaded_file_name && log.downloaded_file_name.toLowerCase().includes(searchLower)) ||
        (log.file_name && log.file_name.toLowerCase().includes(searchLower)) ||
        (log.subject_name && log.subject_name.toLowerCase().includes(searchLower)) ||
        (log.grade_level && log.grade_level.toLowerCase().includes(searchLower)) ||
        (log.resource_type && log.resource_type.toLowerCase().includes(searchLower)) ||
        (log.file_extension && log.file_extension.toLowerCase().includes(searchLower)) ||
        log.activity_type.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

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
          <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
          <p className="text-gray-600">Monitor all school activities including logins, downloads, views, and uploads</p>
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


      {/* Activity Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {logs.filter(log => log.activity_type === 'resource_download').length}
              </div>
              <div className="text-sm text-gray-600">Downloads</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <LogIn className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {logs.filter(log => log.activity_type === 'login').length}
              </div>
              <div className="text-sm text-gray-600">Logins</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {logs.filter(log => log.activity_type === 'resource_view').length}
              </div>
              <div className="text-sm text-gray-600">Views</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Upload className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {logs.filter(log => log.activity_type === 'resource_upload').length}
              </div>
              <div className="text-sm text-gray-600">Uploads</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {logs.filter(log => log.activity_type === 'resource_edit').length}
              </div>
              <div className="text-sm text-gray-600">Edits</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by file name, downloaded file name, resource name, school, subject, grade, or organization"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* School Filter */}
          <div>
            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Schools</option>
              {schools.map((school, index) => (
                <option key={index} value={school.school_name}>
                  {school.school_organization}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Type Filter */}
          <div>
            <select
              value={filterActivityType}
              onChange={(e) => setFilterActivityType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Activities</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="resource_download">Downloads</option>
              <option value="resource_view">Views</option>
              <option value="resource_upload">Uploads</option>
              <option value="resource_edit">Edits</option>
            </select>
          </div>

          {/* Timezone */}
          <div>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Asia/Kolkata">Timezone: IST</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">EST</option>
              <option value="Europe/London">GMT</option>
            </select>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setFilterSchool('all');
                setFilterActivityType('all');
                setSearchTerm('');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SCHOOL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIVITY</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RESOURCE DETAILS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TECHNICAL INFO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log, index) => (
                <tr key={log.log_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {((currentPage - 1) * 20) + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {log.school_name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {log.school_name}
                        </div>
                        <div className="text-sm text-gray-500">{log.school_organization}</div>
                        <div className="text-xs text-gray-400">{log.school_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getActivityIcon(log.activity_type)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityTypeColor(log.activity_type)}`}>
                        {getActivityTypeLabel(log.activity_type)}
                      </span>
                    </div>
                                         {log.login_time && log.activity_type === 'login' && (
                       <div className="text-xs text-gray-500 mt-1">
                         Login: {formatDate(log.login_time)}
                       </div>
                     )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.resource_name ? (
                      <div className="space-y-2">
                        {/* Download Activity - Compact Display */}
                        {log.activity_type === 'resource_download' ? (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 space-y-1">
                            {/* Download Header */}
                            <div className="flex items-center space-x-2">
                              <Download className="w-4 h-4 text-blue-600" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadFromActivityLog(log, e);
                                }}
                                className="text-sm font-semibold text-blue-900 hover:text-blue-700 hover:underline cursor-pointer transition-colors duration-200"
                                title="Click to download this resource"
                              >
                                Resource Downloaded
                              </button>
                            </div>
                            
                            {/* Resource Information - Compact */}
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={log.resource_name}>
                                {log.resource_name}
                              </div>
                              
                              {/* Educational Information - Inline */}
                              <div className="flex flex-wrap gap-1 text-xs">
                                {log.resource_type && (
                                  <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs">
                                    {log.resource_type}
                                  </span>
                                )}
                                {log.subject_name && (
                                  <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">
                                    {log.subject_name}
                                  </span>
                                )}
                                {log.grade_level && (
                                  <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-xs">
                                    G{log.grade_level}
                                  </span>
                                )}
                              </div>
                              
                              {/* File Details with Timestamp - Compact */}
                              <div className="flex items-center space-x-2">
                                <div className="text-xs text-gray-500 flex items-center space-x-2">
                                  {log.file_size && (
                                    <>
                                      <span>{formatFileSize(log.file_size)}</span>
                                      {log.file_extension && (
                                        <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">
                                          {log.file_extension.toUpperCase()}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                                <span className="text-xs text-blue-600 font-medium">{formatDate(log.activity_timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Other Resource Activities - Compact */
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                              {log.activity_type === 'resource_view' ? (
                                <Eye className="w-4 h-4 text-green-500" />
                              ) : log.activity_type === 'resource_edit' ? (
                                <FileText className="w-4 h-4 text-yellow-500" />
                              ) : (
                                <FileText className="w-4 h-4 text-blue-500" />
                              )}
                              <span className="truncate max-w-xs" title={log.resource_name}>
                                {log.resource_name}
                              </span>
                            </div>
                            
                            {/* Resource Type and Educational Info - Compact */}
                            <div className="flex flex-wrap gap-1 text-xs">
                              {log.resource_type && (
                                <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs">
                                  {log.resource_type}
                                </span>
                              )}
                              {log.subject_name && (
                                <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs">
                                  {log.subject_name}
                                </span>
                              )}
                              {log.grade_level && (
                                <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs">
                                  G{log.grade_level}
                                </span>
                              )}
                            </div>
                            
                            {/* File Details - Compact */}
                            {log.file_size && (
                              <div className="text-xs text-gray-400 flex items-center space-x-1">
                                <span>{formatFileSize(log.file_size)}</span>
                                {log.file_extension && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono text-xs">{log.file_extension.toUpperCase()}</span>
                                  </>
                                )}
                              </div>
                            )}
                            
                            {/* Activity Status - Compact */}
                            <div className="text-xs font-medium">
                              {log.activity_type === 'resource_view' ? (
                                <span className="text-green-600 flex items-center space-x-1">
                                  <Eye className="w-3 h-3" />
                                  <span>Viewed</span>
                                </span>
                              ) : log.activity_type === 'resource_edit' ? (
                                <span className="text-yellow-600 flex items-center space-x-1">
                                  <FileText className="w-3 h-3" />
                                  <span>Edited</span>
                                </span>
                              ) : (
                                <span className="text-gray-600 text-xs">
                                  {getActivityTypeLabel(log.activity_type)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Non-Resource Activities */
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        {log.activity_type === 'login' ? (
                          <>
                            <LogIn className="w-4 h-4 text-gray-400" />
                            <span>User logged in</span>
                          </>
                        ) : log.activity_type === 'school_created' ? (
                          <>
                            <School className="w-4 h-4 text-gray-400" />
                            <span>School created</span>
                          </>
                        ) : log.activity_type === 'logout' ? (
                          <>
                            <LogOut className="w-4 h-4 text-gray-400" />
                            <span>User logged out</span>
                          </>
                        ) : (
                          <>
                            <Activity className="w-4 h-4 text-gray-400" />
                            <span>No resource associated</span>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {log.ip_address && (
                        <div className="flex items-center space-x-2 text-sm text-gray-900">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span>IP: {log.ip_address}</span>
                        </div>
                      )}
                      {log.user_agent && (
                        <div className="text-xs text-gray-500 max-w-xs truncate" title={log.user_agent}>
                          {log.user_agent}
                        </div>
                      )}
                      {log.user_agent && (
                        <div className="text-xs text-gray-400">
                          User Agent: {log.user_agent.substring(0, 50)}...
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>{formatDate(log.activity_timestamp)}</div>
                      {log.login_time && log.activity_type === 'login' && (
                        <div className="text-xs text-gray-500">
                          Login: {formatDate(log.login_time)}
                        </div>
                      )}
                    </div>
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
      {filteredLogs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activity records found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || startDate || endDate || filterSchool !== 'all' || filterActivityType !== 'all'
              ? "Try adjusting your search terms or filters."
              : "No activities have been recorded yet."
            }
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Data</span>
            </button>
            <button
              onClick={() => {
                setSearchTerm('');
                setStartDate('');
                setEndDate('');
                setFilterSchool('all');
                setFilterActivityType('all');
                setCurrentPage(1);
                fetchActivityLogs();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span>Clear All Filters</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
