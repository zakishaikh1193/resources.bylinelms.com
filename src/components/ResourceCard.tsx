import React from 'react';
import { FileText, Video, Presentation, Activity, ClipboardCheck, Heart, MessageCircle, Calendar, User, BookOpen, Edit, Trash2, Download, GripVertical, ArrowRight } from 'lucide-react';
import { Resource } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ResourceCardProps {
  resource: Resource;
  isDragging?: boolean;
  viewMode: 'view' | 'edit';
  onEdit?: (resource: Resource) => void;
  onDelete?: (resourceId: string) => void;
  onView?: (resource: Resource) => void;
  // Drag and drop props
  isDraggable?: boolean;
  dragOverResource?: Resource | null;
  onDragStart?: (e: React.DragEvent, resource: Resource) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, resource: Resource) => void;
  onDragEnd?: (e: React.DragEvent) => void;
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
  onView,
  isDraggable = false,
  dragOverResource,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}) => {
  const { user } = useAuth();
  console.log('Resource type:', resource.type, 'Available types:', Object.keys(typeIcons));
  const TypeIcon = typeIcons[resource.type] || FileText; // Fallback to FileText if type not found
  

  const handleDragStart = (e: React.DragEvent) => {
    if (isDraggable && onDragStart) {
      onDragStart(e, resource);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isDraggable && onDragOver) {
      onDragOver(e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isDraggable && onDrop) {
      onDrop(e, resource);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (isDraggable && onDragEnd) {
      onDragEnd(e);
    }
  };

  return (
    <div 
      className={`
        bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer
        hover:shadow-xl hover:border-purple-200 transition-all duration-300 group relative
        ${isDragging ? 'rotate-2 shadow-2xl scale-105' : ''}
        ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
        ${dragOverResource?.id === resource.id ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
      `}
      onClick={() => onView?.(resource)}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
    >
      {/* Admin Actions Overlay - Top Right */}
          {user?.role === 'admin' && viewMode === 'edit' && (
        <div className="absolute top-3 right-3 flex items-center space-x-2 z-10">
              {/* Drag Handle */}
              {isDraggable && (
                <div
                  className="p-2 bg-white/90 text-gray-400 cursor-grab active:cursor-grabbing rounded-xl shadow-lg backdrop-blur-sm"
                  title="Drag to reorder"
                >
                  <GripVertical size={16} />
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(resource);
                }}
                className="p-2 bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110"
                title="Edit Resource"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(resource.id);
                }}
                className="p-2 bg-white/90 hover:bg-white text-red-600 hover:text-red-700 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110"
                title="Delete Resource"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

      {/* Full Width Preview Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {resource.previewImage ? (
          <img 
            src={resource.previewImage} 
            alt={resource.title}
            className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.onerror = null;
              target.src = '/logo.png';
            }}
          />
        ) : (
          <div className="w-full h-20 bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <TypeIcon className="w-10 h-10 text-white" />
        </div>
      )}
      </div>

      {/* Content */}
      <div className="p-6">

        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors duration-200">
          {resource.title}
        </h3>
        
        {/* Description - Plain text only for cards */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
          {(() => {
            // Strip HTML tags and get plain text
            const plainText = resource.description.replace(/<[^>]*>/g, '');
            // Take first 20 letters
            const firstTwentyLetters = plainText.trim().substring(0, 20);
            return firstTwentyLetters + (plainText.trim().length > 20 ? '...' : '');
          })()}
        </p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <span
                key={typeof tag === 'string' ? tag : index}
                className={`text-xs px-2 py-1 rounded-full font-medium ${getTagColor(index)}`}
              >
                {typeof tag === 'string' ? tag : tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                +{resource.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer - Subject Badge Only */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            {resource.subject || 'General'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView?.(resource);
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            View Details
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};