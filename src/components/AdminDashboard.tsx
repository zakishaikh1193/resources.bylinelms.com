import React, { useState, useEffect, useRef } from 'react';
import { Users, Shield, Search, Edit, Trash2, Eye, BookOpen, FileText, BarChart3, UserPlus, Upload, Download, Tag, Grid3X3, List, Video, Image, Archive, Music, Presentation, ChevronDown, LogOut, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CreateSchoolModal from './CreateSchoolModal';
import CreateAdminModal from './CreateAdminModal';
import { AddResourceModal } from './AddResourceModal';
import { ResourceCard } from './ResourceCard';
import GradeModal from './GradeModal';
import SubjectModal from './SubjectModal';
import ResourceViewModal from './ResourceViewModal';
import ResourceEditModal from './ResourceEditModal';
import TagModal from './TagModal';
import SchoolViewModal from './SchoolViewModal';
import SchoolEditModal from './SchoolEditModal';
import ProfileEditModal from './ProfileEditModal';
import AdminViewModal from './AdminViewModal';
import AdminEditModal from './AdminEditModal';
import Sidebar from './Sidebar';
import { API_ENDPOINTS, getFileUrl } from '../config/api';

interface User {
  user_id: number;
  name: string;
  email: string;
  role: 'admin' | 'school';
  organization?: string;
  designation?: string;
  phone?: string;
  address?: string;
  status: string;
  created_at: string;
}

interface Resource {
  resource_id: number;
  title: string;
  description: string;
  type_name: string;
  subject_name: string;
  grade_level: string;
  file_name: string;
  file_size: number;
  status: string;
  created_at: string;
  author_name: string;
  download_count: number;
  view_count: number;
  likes: number;
  preview_image?: string;
  icon?: string;
  tags?: Array<{
    tag_id: number;
    tag_name: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceSearchTerm, setResourceSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'school'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');
  const [filterResourceStatus, setFilterResourceStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showResourceViewModal, setShowResourceViewModal] = useState(false);
  const [showResourceEditModal, setShowResourceEditModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [resourceTypes, setResourceTypes] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [gradeModalMode, setGradeModalMode] = useState<'create' | 'edit'>('create');
  const [subjectModalMode, setSubjectModalMode] = useState<'create' | 'edit'>('create');
  const [tagModalMode, setTagModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'metadata' | 'settings'>('overview');
  
  // School management state
  const [selectedSchool, setSelectedSchool] = useState<User | null>(null);
  const [showSchoolViewModal, setShowSchoolViewModal] = useState(false);
  const [showSchoolEditModal, setShowSchoolEditModal] = useState(false);
  
  // Settings state
  const [settingsMode, setSettingsMode] = useState<'profile' | 'admins'>('profile');
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [showAdminViewModal, setShowAdminViewModal] = useState(false);
  const [showAdminEditModal, setShowAdminEditModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  
  // Dashboard statistics state
  const [dashboardStats, setDashboardStats] = useState<{
    totalUsers: number;
    totalSchools: number;
    totalResources: number;
    totalDownloads: number;
    totalViews: number;
  }>({
    totalUsers: 0,
    totalSchools: 0,
    totalResources: 0,
    totalDownloads: 0,
    totalViews: 0
  });
  
  // Content management mode state
  const [contentMode, setContentMode] = useState<'view' | 'edit'>('view');
  
  // Kanban view state
  const kanbanRef = useRef<HTMLDivElement>(null);
  const contentKanbanRef = useRef<HTMLDivElement>(null);
  
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

  useEffect(() => {
    fetchUsers();
    fetchResources();
    fetchGrades();
    fetchSubjects();
    fetchResourceTypes();
    fetchTags();
    fetchDashboardStats();
  }, [token]);

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

  const fetchUsers = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(API_ENDPOINTS.USERS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      } else {
        console.error('Failed to fetch users:', data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.DASHBOARD_STATS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setDashboardStats(data.data.stats);
      } else {
        console.error('Failed to fetch dashboard stats:', data.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchGrades = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.GRADES, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setGrades(data.data);
      } else {
        console.error('Failed to fetch grades:', data.message);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchSubjects = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.SUBJECTS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setSubjects(data.data);
      } else {
        console.error('Failed to fetch subjects:', data.message);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchResourceTypes = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.RESOURCE_TYPES, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setResourceTypes(data.data);
      } else {
        console.error('Failed to fetch resource types:', data.message);
      }
    } catch (error) {
      console.error('Error fetching resource types:', error);
    }
  };

  const fetchTags = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.TAGS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setTags(data.data);
      } else {
        console.error('Failed to fetch tags:', data.message);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  // School management functions
  const handleViewSchool = (school: User) => {
    setSelectedSchool(school);
    setShowSchoolViewModal(true);
  };

  const handleEditSchool = (school: User) => {
    setSelectedSchool(school);
    setShowSchoolEditModal(true);
  };

  const handleDeleteSchool = async (school: User) => {
    if (!confirm(`Are you sure you want to delete ${school.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${school.user_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        // Remove the school from the users list
        setUsers(users.filter(u => u.user_id !== school.user_id));
        alert('School deleted successfully');
      } else {
        alert('Failed to delete school: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting school:', error);
      alert('Error deleting school');
    }
  };

  const handleUpdateSchool = async (updatedSchool: User) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${updatedSchool.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSchool),
      });

      const data = await response.json();
      if (data.success) {
        // Update the school in the users list
        setUsers(users.map(u => u.user_id === updatedSchool.user_id ? updatedSchool : u));
        setShowSchoolEditModal(false);
        setSelectedSchool(null);
        alert('School updated successfully');
      } else {
        alert('Failed to update school: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating school:', error);
      alert('Error updating school');
    }
  };

  // Admin management functions
  const handleViewAdmin = (admin: User) => {
    setSelectedAdmin(admin);
    setShowAdminViewModal(true);
  };

  const handleEditAdmin = (admin: User) => {
    setSelectedAdmin(admin);
    setShowAdminEditModal(true);
  };

  const handleDeleteAdmin = async (admin: User) => {
    if (!confirm(`Are you sure you want to delete ${admin.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${admin.user_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        // Remove the admin from the users list
        setUsers(users.filter(u => u.user_id !== admin.user_id));
        alert('Admin deleted successfully');
      } else {
        alert('Failed to delete admin: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Error deleting admin');
    }
  };

  const handleUpdateAdmin = async (updatedAdmin: User) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${updatedAdmin.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAdmin),
      });

      const data = await response.json();
      if (data.success) {
        // Update the admin in the users list
        setUsers(users.map(u => u.user_id === updatedAdmin.user_id ? updatedAdmin : u));
        setShowAdminEditModal(false);
        setSelectedAdmin(null);
        alert('Admin updated successfully');
      } else {
        alert('Failed to update admin: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      alert('Error updating admin');
    }
  };

  const handleUpdateProfile = async (updatedProfile: User) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${updatedProfile.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      const data = await response.json();
      if (data.success) {
        // Update the profile in the users list
        setUsers(users.map(u => u.user_id === updatedProfile.user_id ? updatedProfile : u));
        setShowProfileEditModal(false);
        alert('Profile updated successfully');
      } else {
        alert('Failed to update profile: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handleCreateAdmin = async (adminData: any) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/admins`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      });

      const data = await response.json();
      if (data.success) {
        // Add the new admin to the users list
        setUsers([...users, data.data]);
        setShowCreateAdminModal(false);
        return { success: true, message: 'Admin created successfully!' };
      } else {
        return { success: false, message: data.message || 'Failed to create admin' };
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const fetchResources = async () => {
    if (!token) return;
    
    setIsLoadingResources(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.RESOURCES_ALL}?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        console.log('Fetched resources with tags:', data.data.resources);
        setResources(data.data.resources || []);
      } else {
        console.error('Failed to fetch resources:', data.message);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoadingResources(false);
    }
  };

  // Filter users based on current tab
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    // In School Management tab, show only schools
    if (activeTab === 'users') {
      return user.role === 'school' && matchesSearch && matchesRole && matchesStatus;
    }
    
    // In Settings tab, show only admins
    if (activeTab === 'settings') {
      return user.role === 'admin' && matchesSearch && matchesRole && matchesStatus;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Separate lists for different contexts
  const schoolUsers = users.filter(user => user.role === 'school');
  const adminUsers = users.filter(user => user.role === 'admin');

  const filteredResources = resources.filter(resource => {
    const searchTerm = resourceSearchTerm.toLowerCase();
    
    // Search in title, description, subject, grade, and tags
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm) ||
                         resource.description.toLowerCase().includes(searchTerm) ||
                         (resource.subject_name && resource.subject_name.toLowerCase().includes(searchTerm)) ||
                         (resource.grade_level && resource.grade_level.toLowerCase().includes(searchTerm)) ||
                         (resource.tags && resource.tags.some(tag => tag.tag_name.toLowerCase().includes(searchTerm)));
    
    const matchesStatus = filterResourceStatus === 'all' || resource.status === filterResourceStatus;
    const matchesGrade = filterGrade === 'all' || resource.grade_level === filterGrade;
    const matchesSubject = filterSubject === 'all' || resource.subject_name === filterSubject;

    return matchesSearch && matchesStatus && matchesGrade && matchesSubject;
  });

  const stats = {
    total: dashboardStats.totalUsers,
    admins: users.filter(u => u.role === 'admin').length,
    schools: dashboardStats.totalSchools,
    active: users.filter(u => u.status === 'active').length,
    activeSchools: users.filter(u => u.role === 'school' && u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    banned: users.filter(u => u.status === 'banned').length,
  };

  const resourceStats = {
    total: dashboardStats.totalResources,
    published: resources.filter(r => r.status === 'published').length,
    draft: resources.filter(r => r.status === 'draft').length,
    totalDownloads: dashboardStats.totalDownloads,
    totalViews: dashboardStats.totalViews,
  };

  const handleCreateSchool = async (schoolData: any) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/schools`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schoolData),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        fetchUsers();
        return { success: true, message: 'School account created successfully!' };
      } else {
        return { success: false, message: data.message || 'Failed to create school account' };
      }
    } catch (error) {
      console.error('Error creating school:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const handleCreateResource = async (resourceData: any) => {
    // Resource is already created by the modal, just refresh the list
    await fetchResources();
    return { success: true, message: 'Resource created successfully!' };
  };

  // Grade CRUD operations
  const handleCreateGrade = async (gradeData: any) => {
    try {
      const response = await fetch(API_ENDPOINTS.GRADES, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradeData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchGrades();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error creating grade:', error);
      throw error;
    }
  };

  const handleUpdateGrade = async (gradeData: any) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.GRADES}/${selectedGrade.grade_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradeData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchGrades();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating grade:', error);
      throw error;
    }
  };

  const handleDeleteGrade = async (gradeId: number) => {
    if (!confirm('Are you sure you want to delete this grade?')) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.GRADES}/${gradeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        await fetchGrades();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting grade:', error);
      alert('Failed to delete grade');
    }
  };

  // Subject CRUD operations
  const handleCreateSubject = async (subjectData: any) => {
    try {
      const response = await fetch(API_ENDPOINTS.SUBJECTS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subjectData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchSubjects();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  };

  const handleUpdateSubject = async (subjectData: any) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.SUBJECTS}/${selectedSubject.subject_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subjectData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchSubjects();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.SUBJECTS}/${subjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        await fetchSubjects();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject');
    }
  };

  // Tag CRUD operations
  const handleCreateTag = async (tagData: any) => {
    try {
      const response = await fetch(API_ENDPOINTS.TAGS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchTags();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Failed to create tag');
    }
  };

  const handleUpdateTag = async (tagData: any) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.TAGS}/${selectedTag.tag_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchTags();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating tag:', error);
      alert('Failed to update tag');
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.TAGS}/${tagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        await fetchTags();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('Failed to delete tag');
    }
  };

  // Resource CRUD operations
  const handleUpdateResource = async (resourceData: any) => {
    try {
      const headers: any = {
        'Authorization': `Bearer ${token}`,
      };

      // If resourceData is FormData (has files), don't set Content-Type
      // If it's a regular object, set Content-Type to application/json
      if (!(resourceData instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        resourceData = JSON.stringify(resourceData);
      }

      const response = await fetch(API_ENDPOINTS.RESOURCE_BY_ID(selectedResource.resource_id), {
        method: 'PUT',
        headers,
        body: resourceData,
      });

      const data = await response.json();
      if (data.success) {
        await fetchResources();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(API_ENDPOINTS.RESOURCE_BY_ID(resourceId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        await fetchResources();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource');
    }
  };

  // Modal handlers
  const openGradeModal = (mode: 'create' | 'edit', grade?: any) => {
    setGradeModalMode(mode);
    setSelectedGrade(grade || null);
    setShowGradeModal(true);
  };

  const openSubjectModal = (mode: 'create' | 'edit', subject?: any) => {
    setSubjectModalMode(mode);
    setSelectedSubject(subject || null);
    setShowSubjectModal(true);
  };

  const openTagModal = (mode: 'create' | 'edit', tag?: any) => {
    setTagModalMode(mode);
    setSelectedTag(tag || null);
    setShowTagModal(true);
  };

  const openResourceViewModal = (resource: any) => {
    setSelectedResource(resource);
    setShowResourceViewModal(true);
  };

  const openResourceEditModal = (resource: any) => {
    console.log('Opening edit modal for resource:', resource);
    console.log('Resource tags:', resource.tags);
    setSelectedResource(resource);
    setShowResourceEditModal(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (typeName: string) => {
    const iconMap: { [key: string]: any } = {
      'video': Video,
      'document': FileText,
      'presentation': Presentation,
      'image': Image,
      'archive': Archive,
      'spreadsheet': BarChart3,
      'audio': Music
    };
    
    return iconMap[typeName.toLowerCase()] || FileText;
  };

  const getPreviewImage = (resource: Resource) => {
    if (resource.preview_image) {
      return getFileUrl(resource.preview_image);
    }
    return '/logo.png'; // Default logo
  };

  // Helper functions for Kanban view
  const getResourcesForGrade = (gradeLevel: string) => {
    return filteredResources.filter(resource => resource.grade_level === gradeLevel);
  };

  // Scroll Kanban board
  const scrollKanban = (direction: 'left' | 'right', ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const scrollAmount = 400;
      const newScrollLeft = ref.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      ref.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  // Helper function to get grade colors
  const getGradeColor = (gradeLevel: string) => {
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
    
    // Use grade level string to generate consistent color
    const index = gradeLevel.length % colors.length;
    return colors[index];
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

  // Convert backend resource format to ResourceCard format
  const convertToResourceCardFormat = (resource: Resource) => {
    return {
      id: resource.resource_id.toString(),
      title: resource.title,
      description: resource.description,
      type: resource.type_name?.toLowerCase() as 'document' | 'video' | 'presentation' | 'interactive' | 'assessment',
      subject: resource.subject_name,
      grade: parseInt(resource.grade_level) || 1,
      author: {
        id: '1',
        name: resource.author_name || 'Admin',
        avatar: '',
        subject: resource.subject_name,
        school: 'Admin School'
      },
      createdAt: resource.created_at,
      tags: resource.tags?.map(tag => tag.tag_name) || [],
      fileUrl: getFileUrl(resource.file_name),
      previewImage: getPreviewImage(resource),
      status: resource.status as 'submitted' | 'review' | 'approved' | 'published',
      likes: resource.likes || 0,
      comments: 0
    };
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
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm sm:text-base text-gray-600">Manage content and schools</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
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
                            {user?.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
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

        <div className="px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Schools</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.schools}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Schools</p>
                    <p className="text-3xl font-bold text-green-600">{stats.activeSchools}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Resources</p>
                    <p className="text-3xl font-bold text-purple-600">{resourceStats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                    <p className="text-3xl font-bold text-orange-600">{resourceStats.totalDownloads}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Add New School</p>
                    <p className="text-sm text-gray-500">Create school account</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowResourceModal(true)}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Upload Resource</p>
                    <p className="text-sm text-gray-500">Share new educational content</p>
                  </div>
                </button>


              </div>
            </div>

            {/* Recent Resources Kanban */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Resources</h3>
                <button
                  onClick={() => setActiveTab('content')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All →
                </button>
              </div>
              
              {/* Mini Kanban for Recent Resources */}
              <div className="flex space-x-6 overflow-x-auto pb-4 kanban-scroll">
                {grades.slice(0, 4).map((grade) => {
                  const gradeResources = getResourcesForGrade(grade.grade_level).slice(0, 3);
                  const gradeColor = getGradeColor(grade.grade_level);
                  
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
                          const IconComponent = getFileIcon(resource.type_name);
                          
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
                                    {resource.subject_name}
                                  </span>
                                  <span className="text-xs text-gray-500">{resource.type_name}</span>
                                </div>

                                {/* Action Button */}
                                <button
                                  onClick={() => openResourceViewModal(resource)}
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

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">School Management</h2>
                <p className="text-gray-600">Manage school accounts and their access</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add School</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search schools..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                              {user.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'admin' ? (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              <>
                                <Users className="w-3 h-3 mr-1" />
                                School
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.organization || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : user.status === 'inactive'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleViewSchool(user)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditSchool(user)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Edit School"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSchool(user)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete School"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Management Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Content Management
                  {contentMode === 'edit' && (
                    <span className="ml-3 text-sm font-normal text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                      Edit Mode
                    </span>
                  )}
                </h2>
                <p className="text-gray-600">Create and manage educational resources for schools</p>
              </div>
              <div className="flex items-center space-x-4">
                {/* View/Edit Mode Toggle */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setContentMode('view')}
                    className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                      contentMode === 'view' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Eye className="w-4 h-4 inline mr-2" />
                    View
                  </button>
                  <button
                    onClick={() => setContentMode('edit')}
                    className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                      contentMode === 'edit' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Edit
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedGrade(null); // Reset selected grade for general upload
                    setShowResourceModal(true);
                  }}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Resource</span>
                </button>
              </div>
            </div>

            {/* Mode Indicator */}
            {contentMode === 'edit' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Edit className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">Edit Mode Active</span>
                  <span className="text-yellow-600 text-sm">You can now edit grades, add resources to specific grades, and edit individual resources.</span>
                </div>
              </div>
            )}

            {/* Resource Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Resources</p>
                    <p className="text-3xl font-bold text-gray-900">{resourceStats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-3xl font-bold text-green-600">{resourceStats.published}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Drafts</p>
                    <p className="text-3xl font-bold text-yellow-600">{resourceStats.draft}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                    <p className="text-3xl font-bold text-purple-600">{resourceStats.totalDownloads}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search resources..."
                      value={resourceSearchTerm}
                      onChange={(e) => setResourceSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Status Filter */}
                <select
                  value={filterResourceStatus}
                  onChange={(e) => setFilterResourceStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>

                {/* Grade Filter */}
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Grades</option>
                  {grades.map(grade => (
                    <option key={grade.grade_id} value={grade.grade_level}>{grade.grade_level}</option>
                  ))}
                </select>

                {/* Subject Filter */}
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject.subject_id} value={subject.subject_name}>{subject.subject_name}</option>
                  ))}
                </select>

                {/* View Toggle */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Grid View"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Kanban Board */}
            {filteredResources.length > 0 ? (
              <div className="relative min-h-[800px]">
                {/* Scroll Controls */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
                  <button
                    onClick={() => scrollKanban('left', contentKanbanRef)}
                    className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
                  <button
                    onClick={() => scrollKanban('right', contentKanbanRef)}
                    className="w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Kanban Board */}
                <div 
                  ref={contentKanbanRef}
                  className="flex space-x-8 overflow-x-auto pb-6 kanban-scroll"
                  style={{ 
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#CBD5E1 #F1F5F9'
                  }}
                >
                  {grades.map((grade) => {
                    const gradeResources = getResourcesForGrade(grade.grade_level);
                    const gradeColor = getGradeColor(grade.grade_level);
                    
                    return (
                      <div key={grade.grade_id} className="flex-shrink-0 w-96">
                        {/* Grade Column Header */}
                        <div className={`${gradeColor.bg} ${gradeColor.border} rounded-t-xl p-4 mb-4`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-white">{grade.grade_level}</h3>
                              <p className="text-sm text-white/80">{gradeResources.length} resources</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {contentMode === 'edit' && (
                                <>
                                  <button
                                    onClick={() => {
                                      // Set the grade context for adding a resource
                                      setSelectedGrade(grade);
                                      setShowResourceModal(true);
                                    }}
                                    className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                                    title="Add Resource to this Grade"
                                  >
                                    <span className="text-white font-bold text-sm">+</span>
                                  </button>
                                  <button
                                    onClick={() => openGradeModal('edit', grade)}
                                    className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                                    title="Edit Grade"
                                  >
                                    <span className="text-white font-bold text-sm">⋯</span>
                                  </button>
                                </>
                              )}
                              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Resources in this grade */}
                        <div className="space-y-3 max-h-[1000px] overflow-y-auto">
                          {gradeResources.length === 0 && contentMode === 'edit' && (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                                 onClick={() => {
                                   setSelectedGrade(grade);
                                   setShowResourceModal(true);
                                 }}>
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-blue-600 font-bold text-xl">+</span>
                              </div>
                              <p className="text-sm font-medium text-gray-700">Add Resource</p>
                              <p className="text-xs text-gray-500 mt-1">Click to add a new resource</p>
                            </div>
                          )}
                          {gradeResources.map((resource) => (
                            <ResourceCard
                              key={resource.resource_id}
                              resource={convertToResourceCardFormat(resource)}
                              viewMode={contentMode}
                              onView={() => openResourceViewModal(resource)}
                              onEdit={() => openResourceEditModal(resource)}
                              onDelete={() => handleDeleteResource(resource.resource_id)}
                            />
                          ))}
                          
                          {/* Add Resource Card - Always shown in Edit mode */}
                          {contentMode === 'edit' && (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                                 onClick={() => {
                                   setSelectedGrade(grade);
                                   setShowResourceModal(true);
                                 }}>
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <span className="text-blue-600 font-bold text-lg">+</span>
                              </div>
                              <p className="text-xs font-medium text-gray-700">Add Resource</p>
                              <p className="text-xs text-gray-500 mt-1">Add to {grade.grade_level}</p>
                            </div>
                          )}
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
                  {resourceSearchTerm || filterResourceStatus !== 'all' || filterGrade !== 'all' || filterSubject !== 'all'
                    ? "Try adjusting your search terms or filters."
                    : "No resources are available yet. Upload your first resource to get started!"
                  }
                </p>
                {resourceSearchTerm || filterResourceStatus !== 'all' || filterGrade !== 'all' || filterSubject !== 'all' ? (
                  <button
                    onClick={() => {
                      setResourceSearchTerm('');
                      setFilterResourceStatus('all');
                      setFilterGrade('all');
                      setFilterSubject('all');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <button
                    onClick={() => setShowResourceModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload Your First Resource
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Grades & Subjects Tab */}
        {activeTab === 'metadata' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Grades & Subjects Management</h2>
              <p className="text-gray-600">Manage grades and subjects for educational resources</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grades Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Grades</h3>
                  <button 
                    onClick={() => openGradeModal('create')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Add Grade
                  </button>
                </div>
                <div className="space-y-2">
                  {grades.map(grade => (
                    <div key={grade.grade_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{grade.grade_level}</span>
                        <p className="text-sm text-gray-500">{grade.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openGradeModal('edit', grade)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteGrade(grade.grade_id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subjects Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Subjects</h3>
                  <button 
                    onClick={() => openSubjectModal('create')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Add Subject
                  </button>
                </div>
                <div className="space-y-2">
                  {subjects.map(subject => (
                    <div key={subject.subject_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{subject.subject_name}</span>
                        <p className="text-sm text-gray-500">{subject.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openSubjectModal('edit', subject)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSubject(subject.subject_id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Tags Section - Separate Row */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                <button 
                  onClick={() => openTagModal('create')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Add Tag
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tags.map(tag => (
                  <div key={tag.tag_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{tag.tag_name}</span>
                      {tag.description && (
                        <p className="text-sm text-gray-500">{tag.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openTagModal('edit', tag)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTag(tag.tag_id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-gray-600">Manage your profile and admin accounts</p>
              </div>
            </div>

            {/* Settings Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSettingsMode('profile')}
                  className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                    settingsMode === 'profile' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Profile Management
                </button>
                <button
                  onClick={() => setSettingsMode('admins')}
                  className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                    settingsMode === 'admins' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Admin Management
                </button>
              </div>
            </div>

            {/* Profile Management */}
            {settingsMode === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Your Profile</h3>
                    <button
                      onClick={() => setShowProfileEditModal(true)}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Name</label>
                        <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Role</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Organization</label>
                        <p className="text-lg font-semibold text-gray-900">{user?.organization || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Designation</label>
                        <p className="text-lg font-semibold text-gray-900">{user?.designation || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Management */}
            {settingsMode === 'admins' && (
              <div className="space-y-6">
                {/* Header with Add Button */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Admin Accounts</h3>
                    <button
                      onClick={() => setShowCreateAdminModal(true)}
                      className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add New Admin</span>
                    </button>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search admins..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                </div>

                {/* Admins Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((admin) => (
                          <tr key={admin.user_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                  {admin.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                                  <div className="text-sm text-gray-500">{admin.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {admin.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {admin.organization || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                admin.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : admin.status === 'inactive'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {admin.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(admin.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button 
                                  onClick={() => handleViewAdmin(admin)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleEditAdmin(admin)}
                                  className="text-green-600 hover:text-green-900 transition-colors"
                                  title="Edit Admin"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteAdmin(admin)}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                  title="Delete Admin"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                      <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No admins found</h3>
                      <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}


      </div>
      </div>

      {/* Create School Modal */}
      <CreateSchoolModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSchool}
      />

      {/* Add Resource Modal */}
      <AddResourceModal
        isOpen={showResourceModal}
        onClose={() => {
          setShowResourceModal(false);
          setSelectedGrade(null); // Reset selected grade when closing
        }}
        onSubmit={handleCreateResource}
        initialGrade={selectedGrade?.grade_number}
      />

      {/* Grade Modal */}
      <GradeModal
        isOpen={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        onSubmit={gradeModalMode === 'create' ? handleCreateGrade : handleUpdateGrade}
        grade={selectedGrade}
        mode={gradeModalMode}
      />

      {/* Subject Modal */}
      <SubjectModal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        onSubmit={subjectModalMode === 'create' ? handleCreateSubject : handleUpdateSubject}
        subject={selectedSubject}
        mode={subjectModalMode}
      />

      {/* Tag Modal */}
      <TagModal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        onSubmit={tagModalMode === 'create' ? handleCreateTag : handleUpdateTag}
        tag={selectedTag}
        mode={tagModalMode}
      />

      {/* Resource View Modal */}
      <ResourceViewModal
        isOpen={showResourceViewModal}
        onClose={() => setShowResourceViewModal(false)}
        resource={selectedResource}
        onDownload={(resource) => {
          // Handle download for admin view
          window.open(`${API_ENDPOINTS.RESOURCE_DOWNLOAD(resource.resource_id)}`, '_blank');
        }}
        getSubjectName={(subjectId) => {
          const subject = subjects.find(s => s.subject_id === subjectId);
          return subject ? subject.subject_name : 'Unknown';
        }}
        getGradeLevel={(gradeId) => {
          const grade = grades.find(g => g.grade_id === gradeId);
          return grade ? grade.grade_level : 'Unknown';
        }}
        getTypeName={(typeId) => {
          const type = resourceTypes.find(t => t.type_id === typeId);
          return type ? type.type_name : 'Unknown';
        }}
        formatFileSize={formatFileSize}
        formatDate={(dateString) => new Date(dateString).toLocaleDateString()}
        downloadProgress={downloadProgress}
      />

      {/* Resource Edit Modal */}
      <ResourceEditModal
        isOpen={showResourceEditModal}
        onClose={() => setShowResourceEditModal(false)}
        onSubmit={handleUpdateResource}
        resource={selectedResource}
        grades={grades}
        subjects={subjects}
        resourceTypes={resourceTypes}
      />

      {/* School View Modal */}
      <SchoolViewModal
        school={selectedSchool}
        isOpen={showSchoolViewModal}
        onClose={() => {
          setShowSchoolViewModal(false);
          setSelectedSchool(null);
        }}
      />

      {/* School Edit Modal */}
      <SchoolEditModal
        school={selectedSchool}
        isOpen={showSchoolEditModal}
        onClose={() => {
          setShowSchoolEditModal(false);
          setSelectedSchool(null);
        }}
        onUpdate={handleUpdateSchool}
      />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        user={user}
        isOpen={showProfileEditModal}
        onClose={() => {
          setShowProfileEditModal(false);
        }}
        onUpdate={handleUpdateProfile}
      />

      {/* Admin View Modal */}
      <AdminViewModal
        admin={selectedAdmin}
        isOpen={showAdminViewModal}
        onClose={() => {
          setShowAdminViewModal(false);
          setSelectedAdmin(null);
        }}
      />

      {/* Admin Edit Modal */}
      <AdminEditModal
        admin={selectedAdmin}
        isOpen={showAdminEditModal}
        onClose={() => {
          setShowAdminEditModal(false);
          setSelectedAdmin(null);
        }}
        onUpdate={handleUpdateAdmin}
      />

      {/* Create Admin Modal */}
      <CreateAdminModal
        isOpen={showCreateAdminModal}
        onClose={() => setShowCreateAdminModal(false)}
        onSubmit={handleCreateAdmin}
      />
    </div>
  );
};

export default AdminDashboard;
