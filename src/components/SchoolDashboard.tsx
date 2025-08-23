import React, { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS, getFileUrl } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import ResourceViewModal from './ResourceViewModal';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Grid3X3, 
  List, 
  BookOpen, 
  FileText, 
  Video, 
  Presentation, 
  Image, 
  Archive, 
  Music,
  ChevronDown,
  X,
  LogOut,
  User,
  School,
  Check,
  Home,
  BookOpen as BookOpenIcon,
  Download as DownloadIcon,
  Settings,
  Menu,
  Heart,
  MessageCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface Resource {
  resource_id: number;
  title: string;
  description: string;
  type_id: number;
  subject_id: number;
  grade_id: number;
  created_by: number;
  file_name: string;
  file_size: number;
  status: string;
  created_at: string;
  preview_image?: string;
  tags?: Array<{
    tag_id: number;
    tag_name: string;
  }>;
}

interface FilterState {
  subjects: number[];
  types: number[];
}

// MultiSelect Dropdown Component
interface MultiSelectProps {
  options: Array<{ id: number; name: string }>;
  selectedValues: number[];
  onSelectionChange: (values: number[]) => void;
  placeholder: string;
  label: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  options, 
  selectedValues, 
  onSelectionChange, 
  placeholder, 
  label 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: number) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.id === selectedValues[0]);
      return option ? option.name : placeholder;
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <span className={`${selectedValues.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
          {getDisplayText()}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleOption(option.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                <span className="text-sm text-gray-900">{option.name}</span>
                {selectedValues.includes(option.id) && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Sidebar Component
interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isCollapsed, onToggleCollapse }) => {
  const navigationItems = [
    {
      id: 'overview',
      name: 'Overview',
      icon: Home,
      description: 'Dashboard overview and stats'
    },
    {
      id: 'resources',
      name: 'Resources',
      icon: BookOpenIcon,
      description: 'Browse and download resources'
    },
    {
      id: 'downloads',
      name: 'Downloads',
      icon: DownloadIcon,
      description: 'View download history'
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 transition-all duration-300 z-40 ${
      isCollapsed ? 'w-20' : 'w-80'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">School Portal</h2>
              <p className="text-sm text-gray-600">Resource Access</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : ''}`} />
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-6 left-4 right-4">
        <button
          onClick={() => window.location.href = '/logout'}
          className="w-full flex items-center space-x-3 p-4 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <LogOut className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : ''}`} />
          {!isCollapsed && <span className="font-semibold">Logout</span>}
        </button>
      </div>
    </div>
  );
};

const SchoolDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    subjects: [],
    types: []
  });
  
  // Sidebar state
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  
  // View modal state
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Download history state
  const [downloadHistory, setDownloadHistory] = useState<Array<{
    resource_id: number;
    title: string;
    file_name: string;
    downloaded_at: string;
    file_size: number;
    subject_name: string;
    grade_level: string;
    type_name: string;
  }>>([]);
  
  // Download progress state
  const [downloadProgress, setDownloadProgress] = useState<{
    isDownloading: boolean;
    progress: number;
    fileName: string;
    showSuccess: boolean;
  }>({
    isDownloading: false,
    progress: 0,
    fileName: '',
    showSuccess: false
  });
  
  // Available filter options
  const [availableSubjects, setAvailableSubjects] = useState<Array<{subject_id: number, subject_name: string}>>([]);
  const [availableGrades, setAvailableGrades] = useState<Array<{grade_id: number, grade_level: string}>>([]);
  const [availableTypes, setAvailableTypes] = useState<Array<{type_id: number, type_name: string}>>([]);
  const [availableTags, setAvailableTags] = useState<Array<{tag_id: number, tag_name: string}>>([]);
  
  // Kanban view state
  const kanbanRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch resources and metadata
  useEffect(() => {
    if (token) {
      fetchResources();
      fetchMetadata();
      loadDownloadHistory();
    }
  }, [token]);

  // Apply filters and search
  useEffect(() => {
    applyFilters();
  }, [resources, searchTerm, filters]);

  const fetchResources = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.RESOURCES}?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        const resourcesWithTags = data.data.resources || [];
        setResources(resourcesWithTags);
      } else {
        console.error('Failed to fetch resources:', data.message);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [subjectsRes, gradesRes, typesRes, tagsRes] = await Promise.all([
        fetch(API_ENDPOINTS.SUBJECTS, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(API_ENDPOINTS.GRADES, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(API_ENDPOINTS.RESOURCE_TYPES, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(API_ENDPOINTS.TAGS, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [subjectsData, gradesData, typesData, tagsData] = await Promise.all([
        subjectsRes.json(),
        gradesRes.json(),
        typesRes.json(),
        tagsRes.json()
      ]);

      if (subjectsData.success) setAvailableSubjects(subjectsData.data);
      if (gradesData.success) setAvailableGrades(gradesData.data);
      if (typesData.success) setAvailableTypes(typesData.data);
      if (tagsData.success) setAvailableTags(tagsData.data);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const applyFilters = () => {
    let filtered = resources;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resource => {
        const subjectName = availableSubjects.find(s => s.subject_id === resource.subject_id)?.subject_name || '';
        const gradeLevel = availableGrades.find(g => g.grade_id === resource.grade_id)?.grade_level || '';
        const typeName = availableTypes.find(t => t.type_id === resource.type_id)?.type_name || '';
        
        return resource.title.toLowerCase().includes(term) ||
               resource.description.toLowerCase().includes(term) ||
               subjectName.toLowerCase().includes(term) ||
               gradeLevel.toLowerCase().includes(term) ||
               typeName.toLowerCase().includes(term) ||
               (resource.tags && resource.tags.some(tag => tag.tag_name.toLowerCase().includes(term)));
      });
    }

    if (filters.subjects.length > 0) {
      filtered = filtered.filter(resource => filters.subjects.includes(resource.subject_id));
    }
    if (filters.types.length > 0) {
      filtered = filtered.filter(resource => filters.types.includes(resource.type_id));
    }

    setFilteredResources(filtered);
  };

  const clearAllFilters = () => {
    setFilters({ subjects: [], types: [] });
    setSearchTerm('');
  };

  // Load download history from localStorage
  const loadDownloadHistory = () => {
    try {
      const savedHistory = localStorage.getItem('downloadHistory');
      if (savedHistory) {
        setDownloadHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading download history:', error);
    }
  };

  // Save download history to localStorage
  const saveDownloadHistory = (history: typeof downloadHistory) => {
    try {
      localStorage.setItem('downloadHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving download history:', error);
    }
  };

  // Add download to history
  const addToDownloadHistory = (resource: Resource) => {
    const downloadRecord = {
      resource_id: resource.resource_id,
      title: resource.title,
      file_name: resource.file_name,
      downloaded_at: new Date().toISOString(),
      file_size: resource.file_size,
      subject_name: getSubjectName(resource.subject_id),
      grade_level: getGradeLevel(resource.grade_id),
      type_name: getTypeName(resource.type_id)
    };

    const newHistory = [downloadRecord, ...downloadHistory];
    setDownloadHistory(newHistory);
    saveDownloadHistory(newHistory);
  };

  const getFileIcon = (typeName: string) => {
    const iconMap: { [key: string]: any } = {
      'Document': FileText,
      'Video': Video,
      'Presentation': Presentation,
      'Image': Image,
      'Archive': Archive,
      'Spreadsheet': FileText,
      'Audio': Music
    };
    return iconMap[typeName] || FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = async (resource: Resource) => {
    const downloadUrl = API_ENDPOINTS.RESOURCE_DOWNLOAD(resource.resource_id);
    
    try {
      console.log('Starting download for resource:', resource.resource_id, resource.file_name);
      
      // Start download progress
      setDownloadProgress({
        isDownloading: true,
        progress: 0,
        fileName: resource.file_name,
        showSuccess: false
      });

      console.log('Download URL:', downloadUrl);
      
      // Method 1: Try using window.open with proper headers
      try {
        // Create a hidden iframe to handle the download
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = downloadUrl;
        
                 // Add authorization header via URL parameter (server should handle this)
         const urlWithAuth = `${downloadUrl}?token=${encodeURIComponent(token || '')}`;
        iframe.src = urlWithAuth;
        
        document.body.appendChild(iframe);
        
        // Simulate progress for better UX
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress > 90) progress = 90;
          setDownloadProgress(prev => ({
            ...prev,
            progress: Math.round(progress)
          }));
        }, 200);
        
        // Wait a bit then complete
        setTimeout(() => {
          clearInterval(progressInterval);
          setDownloadProgress(prev => ({
            ...prev,
            progress: 100,
            isDownloading: false,
            showSuccess: true
          }));
          
          // Add to download history
          addToDownloadHistory(resource);
          
          // Remove iframe
          document.body.removeChild(iframe);
          
          // Hide success message after 3 seconds
          setTimeout(() => {
            setDownloadProgress(prev => ({
              ...prev,
              showSuccess: false,
              progress: 0,
              fileName: ''
            }));
          }, 3000);
        }, 2000);
        
      } catch (iframeError) {
        console.warn('Iframe download failed, trying direct link:', iframeError);
        
        // Method 2: Direct link approach
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = resource.file_name;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
                 // Add authorization header via custom attribute
         link.setAttribute('data-auth', `Bearer ${token || ''}`);
        
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress > 90) progress = 90;
          setDownloadProgress(prev => ({
            ...prev,
            progress: Math.round(progress)
          }));
        }, 300);
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Complete after a delay
        setTimeout(() => {
          clearInterval(progressInterval);
          setDownloadProgress(prev => ({
            ...prev,
            progress: 100,
            isDownloading: false,
            showSuccess: true
          }));
          
          // Add to download history
          addToDownloadHistory(resource);
          
          // Hide success message after 3 seconds
          setTimeout(() => {
            setDownloadProgress(prev => ({
              ...prev,
              showSuccess: false,
              progress: 0,
              fileName: ''
            }));
          }, 3000);
        }, 1500);
      }

    } catch (error) {
      console.error('Download error:', error);
      
      // Method 3: Final fallback - window.open
      try {
        console.log('Trying final fallback method - window.open');
        
        // Open in new window/tab
        const newWindow = window.open(downloadUrl, '_blank');
        
        if (newWindow) {
          // Simulate progress
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += Math.random() * 25;
            if (progress > 90) progress = 90;
            setDownloadProgress(prev => ({
              ...prev,
              progress: Math.round(progress)
            }));
          }, 400);
          
          // Complete after a delay
          setTimeout(() => {
            clearInterval(progressInterval);
            setDownloadProgress(prev => ({
              ...prev,
              progress: 100,
              isDownloading: false,
              showSuccess: true
            }));
            
            // Add to download history
            addToDownloadHistory(resource);
            
            // Hide success message after 3 seconds
            setTimeout(() => {
              setDownloadProgress(prev => ({
                ...prev,
                showSuccess: false,
                progress: 0,
                fileName: ''
              }));
            }, 3000);
          }, 1000);
        } else {
          throw new Error('Popup blocked');
        }
        
      } catch (finalError) {
        console.error('All download methods failed:', finalError);
        
        // Reset download progress on error
        setDownloadProgress({
          isDownloading: false,
          progress: 0,
          fileName: '',
          showSuccess: false
        });
        
        alert('Failed to download resource. Please check your browser settings and try again.');
      }
    }
  };

  const handleViewResource = (resource: Resource) => {
    setSelectedResource(resource);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedResource(null);
  };

  const getPreviewImage = (resource: Resource) => {
    if (resource.preview_image) {
      return getFileUrl(resource.preview_image);
    }
    return '/logo.png';
  };

  const getSubjectName = (subjectId: number) => {
    return availableSubjects.find(s => s.subject_id === subjectId)?.subject_name || 'Not specified';
  };

  const getGradeLevel = (gradeId: number) => {
    return availableGrades.find(g => g.grade_id === gradeId)?.grade_level || 'Not specified';
  };

  const getTypeName = (typeId: number) => {
    return availableTypes.find(t => t.type_id === typeId)?.type_name || 'Unknown';
  };

  // Get resources for a specific grade
  const getResourcesForGrade = (gradeId: number) => {
    return filteredResources.filter(resource => resource.grade_id === gradeId);
  };

  // Scroll Kanban board
  const scrollKanban = (direction: 'left' | 'right') => {
    if (kanbanRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = kanbanRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      kanbanRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  // Helper function to get grade colors
  const getGradeColor = (gradeId: number) => {
    const colors = [
      { bg: 'bg-red-500', border: 'border-red-500' },
      { bg: 'bg-orange-500', border: 'border-orange-500' },
      { bg: 'bg-yellow-500', border: 'border-yellow-500' },
      { bg: 'bg-green-500', border: 'border-green-500' },
      { bg: 'bg-blue-500', border: 'border-blue-500' },
      { bg: 'bg-purple-500', border: 'border-purple-500' },
      { bg: 'bg-pink-500', border: 'border-pink-500' },
      { bg: 'bg-indigo-500', border: 'border-indigo-500' }
    ];
    
    return colors[gradeId % colors.length];
  };

  // Helper function to get tag colors
  const getTagColor = (tagId: number) => {
    const colors = [
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-green-100 text-green-700 border-green-200',
      'bg-yellow-100 text-yellow-700 border-yellow-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-red-100 text-red-700 border-red-200',
      'bg-orange-100 text-orange-700 border-orange-200',
      'bg-teal-100 text-teal-700 border-teal-200',
      'bg-cyan-100 text-cyan-700 border-cyan-200',
      'bg-lime-100 text-lime-700 border-lime-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200'
    ];
    
    return colors[tagId % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

             {/* Main Content */}
       <div className={`${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'} transition-all duration-300 ease-in-out min-h-screen`}>
         
         
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center">
                  <img src="/logo.png" alt="Byline Learning Solutions" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Byline Learning Solutions</h1>
                  <p className="text-sm sm:text-base text-gray-600">Byline Resource Sharing</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.name?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{user?.name}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* User Dropdown */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {user?.name?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            logout();
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

                 <div className="px-8 py-12">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.name}!
                </h2>
                <p className="text-gray-600">
                  Discover and download educational resources shared by the admin.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Available Resources</p>
                      <p className="text-3xl font-bold text-gray-900">{resources.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Subjects</p>
                      <p className="text-3xl font-bold text-green-600">{availableSubjects.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Grade Levels</p>
                      <p className="text-3xl font-bold text-purple-600">{availableGrades.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Resource Types</p>
                      <p className="text-3xl font-bold text-orange-600">{availableTypes.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Archive className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

                             {/* Recent Resources Kanban */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-semibold text-gray-900">Recent Resources</h3>
                   <button
                     onClick={() => setActiveTab('resources')}
                     className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                   >
                     View All →
                   </button>
                 </div>
                 
                 {/* Mini Kanban for Recent Resources */}
                 <div className="flex space-x-6 overflow-x-auto pb-4 kanban-scroll">
                   {availableGrades.slice(0, 4).map((grade) => {
                     const gradeResources = getResourcesForGrade(grade.grade_id).slice(0, 3);
                     const gradeColor = getGradeColor(grade.grade_id);
                     
                     if (gradeResources.length === 0) return null;
                     
                     return (
                       <div key={grade.grade_id} className="flex-shrink-0 w-72">
                         {/* Grade Column Header */}
                         <div className={`${gradeColor.bg} ${gradeColor.border} rounded-t-xl p-3 mb-3`}>
                           <div className="flex items-center justify-between">
                             <div>
                               <h4 className="text-sm font-bold text-white">{grade.grade_level}</h4>
                               <p className="text-xs text-white/80">{gradeResources.length} recent</p>
                             </div>
                             <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                               <BookOpen className="w-4 h-4 text-white" />
                             </div>
                           </div>
                         </div>

                         {/* Resources in this grade */}
                         <div className="space-y-2">
                           {gradeResources.map((resource) => {
                             const typeName = availableTypes.find(t => t.type_id === resource.type_id)?.type_name || 'Unknown';
                             const IconComponent = getFileIcon(typeName);
                             
                             return (
                               <div 
                                 key={resource.resource_id} 
                                 className="group bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-200 transform hover:-translate-y-0.5"
                               >
                                 {/* Thumbnail Image */}
                                 <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                                   <img
                                     src={getPreviewImage(resource)}
                                     alt={resource.title}
                                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                     onError={(e) => {
                                       const target = e.target as HTMLImageElement;
                                       target.style.display = 'none';
                                     }}
                                   />
                                 </div>

                                 {/* Content */}
                                 <div className="p-3">
                                   {/* Title */}
                                   <h4 className="font-bold text-gray-900 text-xs mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                     {resource.title}
                                   </h4>
                                   
                                   {/* Description */}
                                   <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed mb-2">
                                     {(() => {
                                       // Strip HTML tags and get plain text
                                       const plainText = resource.description.replace(/<[^>]*>/g, '');
                                                                               // Take first 20 letters
                                        const firstTwentyLetters = plainText.trim().substring(0, 20);
                                        return firstTwentyLetters + (plainText.trim().length > 20 ? '...' : '');
                                     })()}
                                   </p>

                                   {/* Subject and Type */}
                                   <div className="flex items-center justify-between mb-2">
                                     <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                                       {getSubjectName(resource.subject_id)}
                                     </span>
                                     <span className="text-xs text-gray-500">{typeName}</span>
                                   </div>

                                   {/* Action Button */}
                                   <button
                                     onClick={() => handleViewResource(resource)}
                                     className="w-full flex items-center justify-center space-x-1 px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] text-xs"
                                   >
                                     <Eye className="w-3 h-3" />
                                     <span>View</span>
                                   </button>
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
            </div>
          )}

                     {/* Resources Tab */}
           {activeTab === 'resources' && (
             <div className="space-y-8">
                                             <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Educational Resources</h2>
                    <p className="text-gray-600">Browse and download resources shared by the admin</p>
                  </div>
                  
                  {/* Search and Filters */}
                  <div className="flex items-center space-x-4">
                    {/* Search Bar */}
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    {/* Filter Toggle */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                        showFilters || Object.values(filters).some(f => f.length > 0)
                          ? 'bg-blue-100 text-blue-600 border border-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <Filter className="w-5 h-5" />
                      <span>Filters</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                               {/* Filter Options */}
                {showFilters && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <MultiSelect
                        options={availableSubjects.map(s => ({ id: s.subject_id, name: s.subject_name }))}
                        selectedValues={filters.subjects}
                        onSelectionChange={(values) => setFilters(prev => ({ ...prev, subjects: values }))}
                        placeholder="Select subjects..."
                        label="Subjects"
                      />

                      <MultiSelect
                        options={availableTypes.map(t => ({ id: t.type_id, name: t.type_name }))}
                        selectedValues={filters.types}
                        onSelectionChange={(values) => setFilters(prev => ({ ...prev, types: values }))}
                        placeholder="Select resource types..."
                        label="Resource Types"
                      />
                    </div>
                  </div>
                )}

              {/* Results Count */}
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing {filteredResources.length} of {resources.length} resources
                </p>
              </div>

                             {/* Kanban Board */}
               {filteredResources.length > 0 ? (
                 <div className="relative min-h-[800px]">
                  {/* Scroll Controls */}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
                    <button
                      onClick={() => scrollKanban('left')}
                      className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
                    <button
                      onClick={() => scrollKanban('right')}
                      className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                                     {/* Kanban Board */}
                                       <div 
                      ref={kanbanRef}
                      className="flex space-x-8 overflow-x-auto pb-6 kanban-scroll"
                      style={{ 
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#CBD5E1 #F1F5F9'
                      }}
                    >
                     {availableGrades.map((grade) => {
                       const gradeResources = getResourcesForGrade(grade.grade_id);
                       const gradeColor = getGradeColor(grade.grade_id);
                       
                       return (
                                                   <div key={grade.grade_id} className="flex-shrink-0 w-80">
                          {/* Grade Column Header */}
                          <div className={`${gradeColor.bg} ${gradeColor.border} rounded-t-xl p-4 mb-4`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-bold text-white">{grade.grade_level}</h3>
                                <p className="text-sm text-white/80">{gradeResources.length} resources</p>
                              </div>
                              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </div>

                                                     {/* Resources in this grade */}
                           <div className="space-y-3 max-h-[1000px] overflow-y-auto">
                            {gradeResources.map((resource) => {
                              const typeName = availableTypes.find(t => t.type_id === resource.type_id)?.type_name || 'Unknown';
                              const IconComponent = getFileIcon(typeName);
                              
                              return (
                                <div 
                                  key={resource.resource_id} 
                                  className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                                >
                                  

                                  {/* Thumbnail Image */}
                                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                                    <img
                                      src={getPreviewImage(resource)}
                                      alt={resource.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  </div>

                                                                     {/* Content */}
                                   <div className="p-3">
                                                                         {/* Title */}
                                     <h4 className="font-bold text-gray-900 text-xs mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                       {resource.title}
                                     </h4>
                                     
                                     {/* Description */}
                                     <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-2">
                                       {resource.description}
                                     </p>

                                                                                                               {/* Tags */}
                                      {resource.tags && resource.tags.length > 0 && (
                                        <div className="mb-2">
                                         <div className="flex flex-wrap gap-1">
                                           {resource.tags.slice(0, 3).map(tag => (
                                             <span
                                               key={tag.tag_id}
                                               className={`px-2 py-1 text-xs font-medium rounded-full border ${getTagColor(tag.tag_id)}`}
                                             >
                                               {tag.tag_name}
                                             </span>
                                           ))}
                                         </div>
                                       </div>
                                     )}

                                                                         {/* Author and Date */}
                                     <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                          {resource.created_by.toString().slice(0, 1)}
                                        </div>
                                        <div>
                                          <p className="text-xs font-medium text-gray-900">Admin</p>
                                          <p className="text-xs text-gray-500">{formatDate(resource.created_at)}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs font-medium text-gray-700">{getSubjectName(resource.subject_id)}</p>
                                      </div>
                                    </div>

                                                                         {/* Action Button */}
                                     <button
                                       onClick={() => handleViewResource(resource)}
                                       className="w-full flex items-center justify-center space-x-2 px-2 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] text-xs"
                                     >
                                      <Eye className="w-3 h-3" />
                                      <span>View Details</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Empty State
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl text-gray-400">🔍</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || Object.values(filters).some(f => f.length > 0)
                      ? "Try adjusting your search terms or filters."
                      : "No resources are available yet. Check back later!"
                    }
                  </p>
                  {(searchTerm || Object.values(filters).some(f => f.length > 0)) && (
                    <button
                      onClick={clearAllFilters}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

                     {/* Downloads Tab */}
           {activeTab === 'downloads' && (
             <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <div>
                   <h2 className="text-2xl font-bold text-gray-900">Download History</h2>
                   <p className="text-gray-600">Track your downloaded resources</p>
                 </div>
                 {downloadHistory.length > 0 && (
                   <button
                     onClick={() => {
                       setDownloadHistory([]);
                       localStorage.removeItem('downloadHistory');
                     }}
                     className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                   >
                     Clear History
                   </button>
                 )}
               </div>
               
               {downloadHistory.length > 0 ? (
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full">
                       <thead className="bg-gray-50 border-b border-gray-200">
                         <tr>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Resource
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Subject
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Grade
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Type
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             File Size
                           </th>
                           <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Downloaded
                           </th>
                         </tr>
                       </thead>
                       <tbody className="bg-white divide-y divide-gray-200">
                         {downloadHistory.map((download, index) => (
                           <tr key={index} className="hover:bg-gray-50 transition-colors">
                             <td className="px-6 py-4">
                               <div className="flex items-center space-x-3">
                                 <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                   <DownloadIcon className="w-5 h-5 text-blue-600" />
                                 </div>
                                 <div>
                                   <div className="text-sm font-medium text-gray-900">{download.title}</div>
                                   <div className="text-xs text-gray-500">{download.file_name}</div>
                                 </div>
                               </div>
                             </td>
                             <td className="px-6 py-4 text-sm text-gray-900">{download.subject_name}</td>
                             <td className="px-6 py-4 text-sm text-gray-900">{download.grade_level}</td>
                             <td className="px-6 py-4 text-sm text-gray-900">{download.type_name}</td>
                             <td className="px-6 py-4 text-sm text-gray-900">{formatFileSize(download.file_size)}</td>
                             <td className="px-6 py-4 text-sm text-gray-900">
                               {formatDate(download.downloaded_at)}
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </div>
               ) : (
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <div className="text-center py-12">
                     <DownloadIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                     <h3 className="text-lg font-medium text-gray-900 mb-2">No downloads yet</h3>
                     <p className="text-gray-600">Start downloading resources to see your history here.</p>
                   </div>
                 </div>
               )}
             </div>
           )}

          
        </div>
      </div>

             {/* Resource View Modal */}
       <ResourceViewModal
         isOpen={isViewModalOpen}
         onClose={handleCloseViewModal}
         resource={selectedResource}
         onDownload={handleDownload}
         getSubjectName={getSubjectName}
         getGradeLevel={getGradeLevel}
         getTypeName={getTypeName}
         formatFileSize={formatFileSize}
         formatDate={formatDate}
         downloadProgress={downloadProgress}
       />
    </div>
  );
};

export default SchoolDashboard;
