import React, { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { X, Upload, FileText, Video, Presentation, Activity, ClipboardCheck, AlertCircle, CheckCircle, Loader2, Plus, Image } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RichTextEditor } from './RichTextEditor';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resource: any) => void;
  initialGrade?: number; // Optional, will use first available grade if not provided
}

interface Grade {
  grade_id: number;
  grade_level: string;
  grade_number: number;
}

interface Subject {
  subject_id: number;
  subject_name: string;
  color: string;
}

interface ResourceType {
  type_id: number;
  type_name: string;
  icon: string;
  allowed_extensions: string;
}

interface Tag {
  tag_id: number;
  tag_name: string;
  color: string;
}

const typeIcons = {
  Document: FileText,
  Presentation: Presentation,
  Video: Video,
  Image: Image,
  Archive: ClipboardCheck,
  Spreadsheet: FileText,
  Audio: Activity
};

export const AddResourceModal: React.FC<AddResourceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialGrade
}) => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type_id: 1,
    subject_id: 0, // Will be set after loading metadata
    grade_id: 0, // Will be set after loading metadata
    tags: [] as number[],
    status: 'draft'
  });

  // File upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [previewImageError, setPreviewImageError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // API data
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Load metadata on component mount
  useEffect(() => {
    if (isOpen) {
      loadMetadata();
    }
  }, [isOpen]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (tagInputRef.current && !tagInputRef.current.contains(target)) {
        // Check if the click is on a suggestion button
        const suggestionButton = (target as Element).closest('[data-tag-suggestion]');
        if (!suggestionButton) {
          setShowTagSuggestions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debug: Monitor formData.tags changes
  useEffect(() => {
    console.log('formData.tags changed:', formData.tags);
  }, [formData.tags]);

  const loadMetadata = async () => {
    try {
      // Load grades
      const gradesResponse = await fetch(API_ENDPOINTS.GRADES);
      const gradesData = await gradesResponse.json();
      if (gradesData.success) {
        setGrades(gradesData.data);
        // Set default grade to first available grade
        if (gradesData.data.length > 0) {
          let defaultGradeId = gradesData.data[0].grade_id; // Default to first grade
          
          if (initialGrade) {
            // If initialGrade is provided, try to find matching grade
            const matchingGrade = gradesData.data.find((g: Grade) => g.grade_number === initialGrade);
            if (matchingGrade) {
              defaultGradeId = matchingGrade.grade_id;
            }
          }
          
          console.log('Setting default grade_id:', defaultGradeId);
          setFormData(prev => ({ ...prev, grade_id: defaultGradeId }));
        }
      }

      // Load subjects
      const subjectsResponse = await fetch(API_ENDPOINTS.SUBJECTS);
      const subjectsData = await subjectsResponse.json();
      if (subjectsData.success) {
        setSubjects(subjectsData.data);
        // Set default subject to first available subject
        if (subjectsData.data.length > 0) {
          const defaultSubjectId = subjectsData.data[0].subject_id;
          console.log('Setting default subject_id:', defaultSubjectId);
          setFormData(prev => ({ ...prev, subject_id: defaultSubjectId }));
        }
      }

      // Load resource types
      const typesResponse = await fetch(API_ENDPOINTS.RESOURCE_TYPES);
      const typesData = await typesResponse.json();
      if (typesData.success) {
        setResourceTypes(typesData.data);
      }

      // Load tags
      const tagsResponse = await fetch(API_ENDPOINTS.TAGS);
      const tagsData = await tagsResponse.json();
      if (tagsData.success) {
        setTags(tagsData.data);
        setAvailableTags(tagsData.data.map((tag: Tag) => tag.tag_name));
      }
    } catch (error) {
      console.error('Error loading metadata:', error);
      setError('Failed to load form data. Please refresh and try again.');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024 * 1024) {
        setFileError('File size must be less than 1000MB');
        return;
      }

      // Validate file extension
      const selectedType = resourceTypes.find(t => t.type_id === formData.type_id);
      if (selectedType) {
        const allowedExtensions = selectedType.allowed_extensions.split(',');
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
          setFileError(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`);
          return;
        }
      }

      setSelectedFile(file);
      setFileError('');
    }
  };

  const handlePreviewImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit for preview images)
      if (file.size > 5 * 1024 * 1024) {
        setPreviewImageError('Preview image size must be less than 5MB');
        setPreviewImage(null);
        return;
      }

      // Validate file extension (images only)
      const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !allowedImageExtensions.includes(fileExtension)) {
        setPreviewImageError(`Preview image must be: ${allowedImageExtensions.join(', ')}`);
        setPreviewImage(null);
        return;
      }

      setPreviewImage(file);
      setPreviewImageError('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = e.dataTransfer.files;
      input.onchange = (event) => handleFileSelect(event as any);
      input.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading) {
      return;
    }
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !selectedFile) {
        setError('Please fill in all required fields and upload a file.');
        setIsLoading(false);
        return;
      }
      if (fileError) { // Check if there's an existing file validation error
        setIsLoading(false);
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('type_id', formData.type_id.toString());
      submitData.append('subject_id', formData.subject_id.toString());
      submitData.append('grade_id', formData.grade_id.toString());
      submitData.append('status', formData.status);
      
      // Debug: Log the form data being sent
      console.log('Form data being sent:', {
        title: formData.title,
        description: formData.description,
        type_id: formData.type_id,
        subject_id: formData.subject_id,
        grade_id: formData.grade_id,
        status: formData.status,
        tags: formData.tags
      });
      
      if (formData.tags.length > 0) {
        formData.tags.forEach(tagId => {
          submitData.append('tags[]', tagId.toString());
        });
      }

      if (selectedFile) {
        submitData.append('file', selectedFile);
      }

      if (previewImage) {
        submitData.append('preview_image', previewImage);
      }

      // Use XMLHttpRequest for real progress tracking
      const xhr = new XMLHttpRequest();
      
      // Set timeout to 10 minutes for large files
      xhr.timeout = 600000;
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 201) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.success) {
                setSuccess('Resource created successfully!');
                onSubmit(data.data);
                
                // Reset form
                setFormData({
                  title: '',
                  description: '',
                  type_id: 1,
                  subject_id: subjects.length > 0 ? subjects[0].subject_id : 0,
                  grade_id: grades.length > 0 ? grades[0].grade_id : 0,
                  tags: [],
                  status: 'draft'
                });
                setSelectedFile(null);
                setPreviewImage(null);
                setFileError('');
                setPreviewImageError('');
                setTagSearchTerm('');
                setShowTagSuggestions(false);
                
                // Close modal after 2 seconds
                setTimeout(() => {
                  onClose();
                  setSuccess('');
                }, 2000);
              } else {
                setError(data.message || 'Failed to create resource');
              }
            } catch (error) {
              setError('Invalid response from server');
            }
          } else {
            setError(`Upload failed: ${xhr.status} ${xhr.statusText}`);
          }
          setIsLoading(false);
          resolve(null);
        });

        xhr.addEventListener('error', () => {
          setError('Network error. Please check your connection and try again.');
          setIsLoading(false);
          reject(new Error('Network error'));
        });

        xhr.addEventListener('timeout', () => {
          setError('Upload timeout. File may be too large or connection too slow.');
          setIsLoading(false);
          reject(new Error('Upload timeout'));
        });

        xhr.open('POST', API_ENDPOINTS.UPLOAD_RESOURCE);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(submitData);
      });

    } catch (error) {
      console.error('Error creating resource:', error);
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        title: '',
        description: '',
        type_id: 1,
        subject_id: subjects.length > 0 ? subjects[0].subject_id : 0,
        grade_id: grades.length > 0 ? grades[0].grade_id : 0,
        tags: [],
        status: 'draft'
      });
      setSelectedFile(null);
      setPreviewImage(null);
      setFileError('');
      setPreviewImageError('');
      setTagSearchTerm('');
      setShowTagSuggestions(false);
      setError('');
      setSuccess('');
      onClose();
    }
  };

  const toggleTag = (tagId: number) => {
    console.log('Toggling tag ID:', tagId);
    setFormData(prev => {
      const newTags = prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId];
      console.log('New tags array:', newTags);
      return {
        ...prev,
        tags: newTags
      };
    });
  };

  // Filter tags based on search term
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tagSearchTerm === '' || 
      tag.tag_name.toLowerCase().includes(tagSearchTerm.toLowerCase());
    const notAlreadySelected = !formData.tags.includes(tag.tag_id);
    return matchesSearch && notAlreadySelected;
  });

  // Handle tag search input
  const handleTagSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagSearchTerm(value);
    setShowTagSuggestions(true); // Always show suggestions when typing
  };

  // Handle tag selection from suggestions
  const handleTagSelect = (tag: Tag) => {
    console.log('Selecting tag:', tag);
    toggleTag(tag.tag_id);
    setTagSearchTerm('');
    setShowTagSuggestions(false);
    
    // Add visual feedback
    const button = document.querySelector(`[data-tag-id="${tag.tag_id}"]`) as HTMLElement;
    if (button) {
      button.style.backgroundColor = '#dbeafe';
      setTimeout(() => {
        button.style.backgroundColor = '';
      }, 200);
    }
  };

  // Handle creating a new tag
  const handleCreateTag = async () => {
    if (!tagSearchTerm.trim() || isCreatingTag) return;

    setIsCreatingTag(true);
    try {
      const response = await fetch(API_ENDPOINTS.TAGS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tag_name: tagSearchTerm.trim(),
          description: null
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Reload tags to get the new one
        const tagsResponse = await fetch(API_ENDPOINTS.TAGS);
        const tagsData = await tagsResponse.json();
        if (tagsData.success) {
          setTags(tagsData.data);
          // Add the new tag to the resource
          toggleTag(data.data.tag_id);
        }
        setTagSearchTerm('');
        setShowTagSuggestions(false);
      } else {
        alert(data.message || 'Failed to create tag');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Failed to create tag');
    } finally {
      setIsCreatingTag(false);
    }
  };

  // Handle keyboard events for tag input
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTags.length > 0) {
        handleTagSelect(filteredTags[0]);
      } else if (tagSearchTerm.trim()) {
        handleCreateTag();
      }
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
      setTagSearchTerm('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add New Resource</h2>
              <p className="text-sm text-gray-600 font-medium">Upload educational content for schools</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl transition-all duration-200 disabled:opacity-50 shadow-sm"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

                  {/* Success Message */}
          {success && (
            <div className="mx-6 mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-base font-medium text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

                  {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-base font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Title and Description */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Resource Title *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter a descriptive title..."
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Status
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                  disabled={isLoading}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description *
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Describe your resource and how it can be used..."
              disabled={isLoading}
            />
          </div>

          {/* Resource Type */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Resource Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {resourceTypes.map((type) => {
                const Icon = typeIcons[type.type_name as keyof typeof typeIcons] || FileText;
                return (
                  <button
                    key={type.type_id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type_id: type.type_id })}
                    className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                      formData.type_id === type.type_id
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg transform scale-105'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-gray-50'
                    }`}
                    disabled={isLoading}
                  >
                    <Icon size={28} className={`mx-auto mb-3 ${formData.type_id === type.type_id ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className={`text-sm font-semibold ${formData.type_id === type.type_id ? 'text-blue-700' : 'text-gray-600'}`}>{type.type_name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject and Grade Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Subject *
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                  disabled={isLoading}
                >
                {subjects.map(subject => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Grade Level *
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.grade_id}
                  onChange={(e) => setFormData({ ...formData, grade_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                  disabled={isLoading}
                >
                {grades.map(grade => (
                  <option key={grade.grade_id} value={grade.grade_id}>
                    {grade.grade_level}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Tags
            </label>
            
            {/* Searchable Tag Input */}
            <div className="relative mb-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={tagSearchTerm}
                    onChange={handleTagSearchChange}
                    onKeyDown={handleTagInputKeyDown}
                    onFocus={() => setShowTagSuggestions(true)}
                    placeholder="Add or select a tag"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    disabled={isLoading}
                  />
                 
                </div>
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={!tagSearchTerm.trim() || isCreatingTag || isLoading}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isCreatingTag ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>{isCreatingTag ? 'Adding...' : 'Add'}</span>
                </button>
              </div>

              {/* Tag Suggestions Dropdown */}
              {showTagSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tag) => (
                      <button
                        key={tag.tag_id}
                        type="button"
                        data-tag-suggestion="true"
                        data-tag-id={tag.tag_id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleTagSelect(tag);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        disabled={isLoading}
                      >
                       
                        <span className="text-blue-600">{tag.tag_name}</span>
                      </button>
                    ))
                  ) : tagSearchTerm.trim() ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Press Enter or click "Add" to create "{tagSearchTerm}"
                    </div>
                  ) : tags.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No tags available. Start typing to create a new tag.
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      All tags have been selected.
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tagId) => {
                  const tag = tags.find(t => t.tag_id === tagId);
                  return tag ? (
                    <span
                      key={tagId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                    >
                      {tag.tag_name}
                      <button
                        type="button"
                        onClick={() => toggleTag(tagId)}
                        className="hover:text-blue-600"
                        disabled={isLoading}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
          </div>

          {/* File Upload and Preview Image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Upload File *
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors"
              >
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={isLoading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={40} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">
                    {selectedFile ? selectedFile.name : 'PDF, DOC, PPT, Video, Image files (max 100MB)'}
                  </p>
                </label>
              </div>
              {fileError && (
                <p className="text-sm text-red-600 mt-2">{fileError}</p>
              )}
              {selectedFile && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Preview Image (Optional)
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors"
              >
                <input
                  type="file"
                  onChange={handlePreviewImageSelect}
                  className="hidden"
                  id="preview-image-upload"
                  accept="image/*"
                  disabled={isLoading}
                />
                <label htmlFor="preview-image-upload" className="cursor-pointer">
                  <Upload size={40} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload preview image</p>
                  <p className="text-xs text-gray-500">
                    {previewImage ? previewImage.name : 'JPG, PNG, GIF, WebP files (max 5MB)'}
                  </p>
                </label>
              </div>
              {previewImageError && (
                <p className="text-sm text-red-600 mt-2">{previewImageError}</p>
              )}
              {previewImage && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ {previewImage.name} ({(previewImage.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 font-medium shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2 shadow-lg font-medium transform hover:scale-105"
            >
                              {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading Resource...</span>
                  </>
                ) : (
                  <span>Create Resource</span>
                )}
            </button>
          </div>

          {/* Upload Progress */}
          {isLoading && selectedFile && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Uploading {selectedFile.name}</span>
                <span className="text-sm text-blue-600">{uploadProgress}% • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                {uploadProgress === 0 && "Starting upload..."}
                {uploadProgress > 0 && uploadProgress < 100 && "Uploading file to server..."}
                {uploadProgress === 100 && "Processing file..."}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};