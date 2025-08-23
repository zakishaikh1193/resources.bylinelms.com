import React from 'react';
import { MoreVertical } from 'lucide-react';
import { GradeColumn, Resource } from '../types';
import { ResourceCard } from './ResourceCard';

interface GradeColumnProps {
  gradeColumn: GradeColumn;
  viewMode: 'view' | 'edit';
  onEditResource?: (resource: Resource) => void;
  onDeleteResource?: (resourceId: string) => void;
}

export const GradeColumnComponent: React.FC<GradeColumnProps> = (
  gradeColumn, 
  viewMode, 
  onEditResource,
  onDeleteResource
) => {
  return (
    <div className="flex-shrink-0 w-80 bg-gray-50 rounded-xl p-4 h-full">
      {/* Grade Header */}
      <div className={`rounded-xl p-4 border-2 ${gradeColumn.color} mb-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-gray-800">
              {gradeColumn.title}
            </h2>
            <span className="text-sm text-gray-600">
              {gradeColumn.resources.length} resources
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white hover:bg-opacity-30 rounded-lg transition-colors">
              <MoreVertical size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Resources Vertical Stack */}
      <div className="space-y-3">
        {gradeColumn.resources.map((resource) => (
          <ResourceCard 
            key={resource.id}
            resource={resource} 
            viewMode={viewMode}
            onEdit={onEditResource}
            onDelete={onDeleteResource}
          />
        ))}
        
        {/* Empty State */}
        {gradeColumn.resources.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-gray-400 text-lg">📚</span>
            </div>
            <p className="text-sm text-gray-500">No resources available</p>
            <p className="text-xs text-gray-400">Contact admin for resources</p>
          </div>
        )}
      </div>
    </div>
  );
};