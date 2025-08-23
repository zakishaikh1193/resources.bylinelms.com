import React from 'react';
import { X, Download, Tag, Calendar, FileText, Video, Presentation, Image, Archive, Music } from 'lucide-react';
import { getFileUrl } from '../config/api';

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

interface ResourceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  onDownload: (resource: Resource) => void;
  getSubjectName: (subjectId: number) => string;
  getGradeLevel: (gradeId: number) => string;
  getTypeName: (typeId: number) => string;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateString: string) => string;
  downloadProgress: {
    isDownloading: boolean;
    progress: number;
    fileName: string;
    showSuccess: boolean;
  };
}

const ResourceViewModal: React.FC<ResourceViewModalProps> = ({
  isOpen,
  onClose,
  resource,
  onDownload,
  getSubjectName,
  getGradeLevel,
  getTypeName,
  formatFileSize,
  formatDate,
  downloadProgress
}) => {
  if (!isOpen || !resource) return null;

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

  const getPreviewImage = (resource: Resource) => {
    if (resource.preview_image) {
      return getFileUrl(resource.preview_image);
    }
    return '/logo.png';
  };

  const typeName = getTypeName(resource.type_id);
  const IconComponent = getFileIcon(typeName);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Resource Details</h2>
              <p className="text-gray-600">View and download educational resources</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

                 <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
           <div className="p-8">
             {/* Side-by-side layout */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Left Side - Image */}
               <div className="space-y-6">
                 {/* Preview Image */}
                 <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden relative shadow-lg">
                   <img
                     src={getPreviewImage(resource)}
                     alt={resource.title}
                     className="w-full h-full object-cover"
                     onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.style.display = 'none';
                       target.parentElement!.innerHTML = `
                         <div class="w-full h-full flex items-center justify-center">
                           <div class="w-32 h-32 text-gray-300">
                             <svg fill="currentColor" viewBox="0 0 24 24">
                               <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                             </svg>
                           </div>
                         </div>
                       `;
                     }}
                   />
                   {/* File size badge */}
                   <div className="absolute top-4 right-4">
                     <div className="px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-sm font-medium rounded-xl">
                       {formatFileSize(resource.file_size)}
                     </div>
                   </div>
                 </div>

                 {/* File Name */}
              
               </div>

               {/* Right Side - Details */}
               <div className="space-y-6">
                 {/* Title and Description */}
                 <div>
                   <h3 className="text-2xl font-bold text-gray-900 mb-3">{resource.title}</h3>
                   <div 
                     className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                     dangerouslySetInnerHTML={{ __html: resource.description }}
                   />
                 </div>

                 {/* Metadata Grid */}
                 <div className="grid grid-cols-1 gap-4">
                   <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                     <div className="flex items-center space-x-3">
                       <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                       <span className="text-green-700 font-semibold">Subject</span>
                     </div>
                     <span className="text-gray-900 font-bold">{getSubjectName(resource.subject_id)}</span>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                     <div className="flex items-center space-x-3">
                       <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                       <span className="text-purple-700 font-semibold">Grade Level</span>
                     </div>
                     <span className="text-gray-900 font-bold">{getGradeLevel(resource.grade_id)}</span>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                     <div className="flex items-center space-x-3">
                       <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                       <span className="text-blue-700 font-semibold">Resource Type</span>
                     </div>
                     <span className="text-gray-900 font-bold">{typeName}</span>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                     <div className="flex items-center space-x-3">
                       <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                       <span className="text-indigo-700 font-semibold">File Size</span>
                     </div>
                     <span className="text-gray-900 font-bold">{formatFileSize(resource.file_size)}</span>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                     <div className="flex items-center space-x-3">
                       <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                       <span className="text-pink-700 font-semibold">Added</span>
                     </div>
                     <span className="text-gray-900 font-bold">{formatDate(resource.created_at)}</span>
                   </div>
                 </div>

                 {/* Tags */}
                 {resource.tags && resource.tags.length > 0 && (
                   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                     <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                       <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                         <Tag className="w-3 h-3 text-white" />
                       </div>
                       Tags
                     </h4>
                     <div className="flex flex-wrap gap-2">
                       {resource.tags.map((tag) => (
                         <span
                           key={tag.tag_id}
                           className="inline-flex items-center px-3 py-1.5 bg-white text-blue-700 text-sm font-semibold rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                         >
                           {tag.tag_name}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Download Progress */}
                 {downloadProgress.isDownloading && (
                   <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                     <div className="flex items-center space-x-3 mb-3">
                       <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                         <Download className="w-4 h-4 text-blue-600 animate-pulse" />
                       </div>
                       <div>
                         <h4 className="font-semibold text-blue-900">Downloading File</h4>
                         <p className="text-sm text-blue-700 truncate">{downloadProgress.fileName}</p>
                       </div>
                     </div>
                     
                     {/* Progress Bar */}
                     <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                       <div 
                         className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                         style={{ width: `${downloadProgress.progress}%` }}
                       ></div>
                     </div>
                     
                     <p className="text-sm text-blue-600 font-medium">{downloadProgress.progress}% Complete</p>
                   </div>
                 )}
                 
                 {/* Download Success Message */}
                 {downloadProgress.showSuccess && (
                   <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                     <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                         <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                         </svg>
                       </div>
                       <div>
                         <h4 className="font-semibold text-green-900">Download Complete!</h4>
                         <p className="text-sm text-green-700 truncate">{downloadProgress.fileName}</p>
                       </div>
                     </div>
                   </div>
                 )}

                 {/* Actions */}
                 <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
                   <button
                     onClick={onClose}
                     className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                   >
                     Close
                   </button>
                   <button
                     onClick={() => onDownload(resource)}
                     disabled={downloadProgress.isDownloading}
                     className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg transform ${
                       downloadProgress.isDownloading
                         ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                         : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-105'
                     }`}
                   >
                     <Download className="w-4 h-4" />
                     <span>{downloadProgress.isDownloading ? 'Downloading...' : 'Download Resource'}</span>
                   </button>
                 </div>
               </div>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
};

export default ResourceViewModal;
