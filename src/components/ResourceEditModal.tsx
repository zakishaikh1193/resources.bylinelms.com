import React, { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { X, Upload, FileText, Video, Presentation, Activity, ClipboardCheck, AlertCircle, CheckCircle, Loader2, Plus, Image } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RichTextEditor } from './RichTextEditor';

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
  subject_color?: string;
  tags?: Array<{
    tag_id: number;
    tag_name: string;
  }>;
}

interface ResourceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resourceData: any) => Promise<void>;
  resource: Resource | null;
  grades: any[];
  subjects: any[];
  resourceTypes: any[];
}

const ResourceEditModal: React.FC<ResourceEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  resource,
  grades,
  subjects,
  resourceTypes
}) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type_id: '',
    subject_id: '',
    grade_id: '',
    status: 'published',
    tags: [] as number[]
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [tagInputRef] = useState(useRef<HTMLInputElement>(null));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewImageInputRef = useRef<HTMLInputElement>(null);

  // Resource type icons mapping
  const typeIcons = {
    Document: FileText,
    Video: Video,
    Presentation: Presentation,
    Image: Image,
    Archive: ClipboardCheck,
    Spreadsheet: FileText,
    Audio: Activity
  };

  // Load tags on component mount and when resource changes
  useEffect(() => {
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen, resource]);

  // Initialize form data when resource changes
  useEffect(() => {
    if (resource) {
      console.log('Resource in edit modal:', resource);
      console.log('Resource tags:', resource.tags);
      
      const typeId = resourceTypes.find(t => t.type_name === resource.type_name)?.type_id;
      const subjectId = subjects.find(s => s.subject_name === resource.subject_name)?.subject_id;
      const gradeId = grades.find(g => g.grade_level === resource.grade_level)?.grade_id;
      
      const resourceTags = resource.tags?.map(tag => tag.tag_id) || [];
      console.log('Resource tag IDs:', resourceTags);
      
      setFormData({
        title: resource.title,
        description: resource.description,
        type_id: typeId?.toString() || '',
        subject_id: subjectId?.toString() || '',
        grade_id: gradeId?.toString() || '',
        status: resource.status,
        tags: resourceTags
      });
    }
  }, [resource, grades, subjects, resourceTypes]);

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
        console.log('Fetched tags from API:', data.data);
        setTags(data.data || []);
      } else {
        console.error('Failed to fetch tags:', data.message);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
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

  // Handle tag selection
  const handleTagSelect = (tag: any) => {
    console.log('Selecting tag:', tag);
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag.tag_id]
    }));
    setTagSearchTerm('');
    setShowTagSuggestions(false);
  };

  // Handle tag removal
  const toggleTag = (tagId: number) => {
    console.log('Toggling tag:', tagId);
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(id => id !== tagId)
    }));
  };

  // Handle creating new tag
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
          description: ''
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Reload tags and add the new tag to the resource
        await fetchTags();
        const newTagId = data.data.tag_id;
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTagId]
        }));
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

  // Handle tag input keyboard events
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTags.length > 0) {
        handleTagSelect(filteredTags[0]);
      } else if (tagSearchTerm.trim()) {
        handleCreateTag();
      }
    } else if (e.key === 'Escape') {
      setTagSearchTerm('');
      setShowTagSuggestions(false);
    }
  };

  // Handle click outside tag suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagInputRef.current && !tagInputRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-tag-suggestion]')) {
          setShowTagSuggestions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Monitor formData.tags changes
  useEffect(() => {
    console.log('formData.tags changed:', formData.tags);
  }, [formData.tags]);

  // Monitor tags state changes
  useEffect(() => {
    console.log('Tags state updated:', tags);
  }, [tags]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handlePreviewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPreviewImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'tags') {
          // Add each tag ID separately
          (value as number[]).forEach(tagId => {
            formDataToSend.append('tags[]', tagId.toString());
          });
        } else {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Add files if selected
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }
      if (selectedPreviewImage) {
        formDataToSend.append('preview_image', selectedPreviewImage);
      }

      // Start progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 5;
        });
      }, 100);

      // Submit the form
      await onSubmit(formDataToSend);
      
      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Wait a moment to show completion
      setTimeout(() => {
        // Reset form
        setFormData({
          title: '',
          description: '',
          type_id: '',
          subject_id: '',
          grade_id: '',
          status: 'published',
          tags: []
        });
        setSelectedFile(null);
        setSelectedPreviewImage(null);
        setTagSearchTerm('');
        setShowTagSuggestions(false);
        
        onClose();
      }, 500);
      
    } catch (error) {
      console.error('Error updating resource:', error);
      // Reset progress on error
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      type_id: '',
      subject_id: '',
      grade_id: '',
      status: 'published',
      tags: []
    });
    setSelectedFile(null);
    setSelectedPreviewImage(null);
    setTagSearchTerm('');
    setShowTagSuggestions(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Resource</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Progress Bar */}
          {(isUploading || isLoading) && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                {uploadProgress < 100 ? 'Updating resource...' : 'Update complete!'}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a descriptive title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {resourceTypes.map((type) => {
                const IconComponent = typeIcons[type.type_name as keyof typeof typeIcons] || FileText;
                return (
                  <button
                    key={type.type_id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type_id: type.type_id.toString() })}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      formData.type_id === type.type_id.toString()
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <IconComponent className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{type.type_name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject and Grade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level *
              </label>
              <select
                value={formData.grade_id}
                onChange={(e) => setFormData({ ...formData, grade_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              >
                <option value="">Select Grade</option>
                {grades.map(grade => (
                  <option key={grade.grade_id} value={grade.grade_id}>
                    {grade.grade_level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    disabled={isLoading}
                  />
                  
                </div>
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={!tagSearchTerm.trim() || isCreatingTag || isLoading}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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
                  console.log(`Looking for tag ID ${tagId}, found:`, tag);
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
                  ) : (
                    <span
                      key={tagId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md"
                    >
                      Tag ID: {tagId} (Loading...)
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File *
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.zip,.rar,.mp4,.mp3,.avi,.mov,.wmv,.flv,.mkv,.webm,.jpg,.jpeg,.png,.gif"
                disabled={isLoading}
              />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, PPT, Video, Image files (max 100MB)
              </p>
            </div>
            {resource?.file_name && !selectedFile && (
              <p className="text-xs text-gray-500 mt-1">Current file: {resource.file_name}</p>
            )}
          </div>

          {/* Preview Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview Image (Optional)
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => previewImageInputRef.current?.click()}
            >
              <input
                type="file"
                ref={previewImageInputRef}
                onChange={handlePreviewImageSelect}
                className="hidden"
                accept="image/*"
                disabled={isLoading}
              />
              <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {selectedPreviewImage ? selectedPreviewImage.name : 'Click to upload preview image'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, GIF, WebP files (max 5MB)
              </p>
            </div>
            {resource?.preview_image && !selectedPreviewImage && (
              <p className="text-xs text-gray-500 mt-1">Current preview image exists</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mr-2"
                  disabled={isLoading}
                />
                <span className="text-sm">Draft</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="published"
                  checked={formData.status === 'published'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mr-2"
                  disabled={isLoading}
                />
                <span className="text-sm">Published</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Update Resource</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceEditModal;
