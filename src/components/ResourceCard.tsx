import React from 'react';
import { FileText, Video, Presentation, Activity, ClipboardCheck, Heart, MessageCircle, Calendar, User, BookOpen, Edit, Trash2, Download } from 'lucide-react';
import { Resource } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ResourceCardProps {
  resource: Resource;
  isDragging?: boolean;
  viewMode: 'view' | 'edit';
  onEdit?: (resource: Resource) => void;
  onDelete?: (resourceId: string) => void;
  onView?: (resource: Resource) => void;
}

const typeIcons = {
  document: FileText,
  video: Video,
  presentation: Presentation,
  interactive: Activity,
  assessment: ClipboardCheck,
  // Add fallbacks for common variations
  'Document': FileText,
  'DOCUMENT': FileText,
  'Video': Video,
  'VIDEO': Video,
  'Presentation': Presentation,
  'PRESENTATION': Presentation,
  'Interactive': Activity,
  'INTERACTIVE': Activity,
  'Assessment': ClipboardCheck,
  'ASSESSMENT': ClipboardCheck
};

const typeColors = {
  document: 'text-blue-600 bg-blue-50',
  video: 'text-red-600 bg-red-50',
  presentation: 'text-green-600 bg-green-50',
  interactive: 'text-purple-600 bg-purple-50',
  assessment: 'text-orange-600 bg-orange-50'
};

// Helper function to get tag colors
const getTagColor = (tagIndex: number) => {
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
  
  return colors[tagIndex % colors.length];
};

export const ResourceCard: React.FC<ResourceCardProps> = ({ 
  resource, 
  isDragging, 
  viewMode, 
  onEdit, 
  onDelete,
  onView
}) => {
  const { user } = useAuth();
  console.log('Resource type:', resource.type, 'Available types:', Object.keys(typeIcons));
  const TypeIcon = typeIcons[resource.type] || FileText; // Fallback to FileText if type not found
  
  const handleDownload = () => {
    // TODO: Implement actual download functionality
    console.log('Downloading resource:', resource.id);
    // This would typically trigger a download from the backend
  };

  return (
    <div 
      className={`
        bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer w-96
        hover:shadow-xl hover:border-purple-200 transition-all duration-300 group
        ${isDragging ? 'rotate-2 shadow-2xl scale-105' : ''}
      `}
      onClick={() => onView?.(resource)}
    >
      {/* Preview Image */}
      {resource.previewImage && (
        <div className="relative overflow-hidden">
          <img 
            src={resource.previewImage} 
            alt={resource.title}
            className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          


          {/* Admin Actions Overlay */}
          {user?.role === 'admin' && viewMode === 'edit' && (
            <div className="absolute top-3 right-3 flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(resource);
                }}
                className="p-2 bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(resource.id);
                }}
                className="p-2 bg-white/90 hover:bg-white text-red-600 hover:text-red-700 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors duration-200 leading-tight">
          {resource.title}
        </h3>
        
        {/* Description - Plain text only for cards */}
        <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
          {(() => {
            // Strip HTML tags and get plain text
            const plainText = resource.description.replace(/<[^>]*>/g, '');
            // Take first 20 letters
            const firstTwentyLetters = plainText.trim().substring(0, 20);
            return firstTwentyLetters + (plainText.trim().length > 20 ? '...' : '');
          })()}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Author Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
              {resource.author.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{resource.author.name}</p>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Calendar size={12} />
                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
            resource.status === 'published' 
              ? 'bg-green-100 text-green-800 border-2 border-green-200' 
              : resource.status === 'draft'
              ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
              : 'bg-gray-100 text-gray-800 border-2 border-gray-200'
          }`}>
            {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};