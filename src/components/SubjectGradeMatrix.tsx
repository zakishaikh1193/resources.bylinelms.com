import React, { useState, useEffect } from 'react';
import { Check, X, ChevronDown, ChevronRight } from 'lucide-react';

interface Subject {
  subject_id: number;
  subject_name: string;
  color: string;
}

interface Grade {
  grade_id: number;
  grade_level: string;
  grade_number: number;
}

interface Permission {
  subject_id: number;
  grade_ids: number[];
}

interface SubjectGradeMatrixProps {
  subjects: Subject[];
  grades: Grade[];
  permissions: Permission[];
  onPermissionsChange: (permissions: Permission[]) => void;
}

const SubjectGradeMatrix: React.FC<SubjectGradeMatrixProps> = ({
  subjects,
  grades,
  permissions,
  onPermissionsChange
}) => {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set());
  const [localPermissions, setLocalPermissions] = useState<Permission[]>(permissions);

  useEffect(() => {
    setLocalPermissions(permissions);
  }, [permissions]);

  const toggleSubjectExpansion = (subjectId: number) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const toggleGradePermission = (subjectId: number, gradeId: number) => {
    const newPermissions = [...localPermissions];
    const subjectPermission = newPermissions.find(p => p.subject_id === subjectId);
    
    if (subjectPermission) {
      const gradeIndex = subjectPermission.grade_ids.indexOf(gradeId);
      if (gradeIndex > -1) {
        // Remove grade
        subjectPermission.grade_ids.splice(gradeIndex, 1);
        // Remove subject permission if no grades left
        if (subjectPermission.grade_ids.length === 0) {
          const subjectIndex = newPermissions.findIndex(p => p.subject_id === subjectId);
          newPermissions.splice(subjectIndex, 1);
        }
      } else {
        // Add grade
        subjectPermission.grade_ids.push(gradeId);
      }
    } else {
      // Create new subject permission
      newPermissions.push({
        subject_id: subjectId,
        grade_ids: [gradeId]
      });
    }
    
    setLocalPermissions(newPermissions);
    onPermissionsChange(newPermissions);
  };

  const toggleAllGradesForSubject = (subjectId: number) => {
    const subjectPermission = localPermissions.find(p => p.subject_id === subjectId);
    const hasAllGrades = subjectPermission && subjectPermission.grade_ids.length === grades.length;
    
    if (hasAllGrades) {
      // Remove all grades for this subject
      const newPermissions = localPermissions.filter(p => p.subject_id !== subjectId);
      setLocalPermissions(newPermissions);
      onPermissionsChange(newPermissions);
    } else {
      // Add all grades for this subject
      const allGradeIds = grades.map(g => g.grade_id);
      const newPermissions = localPermissions.filter(p => p.subject_id !== subjectId);
      newPermissions.push({
        subject_id: subjectId,
        grade_ids: allGradeIds
      });
      setLocalPermissions(newPermissions);
      onPermissionsChange(newPermissions);
    }
  };

  const isGradeSelected = (subjectId: number, gradeId: number): boolean => {
    const subjectPermission = localPermissions.find(p => p.subject_id === subjectId);
    return subjectPermission ? subjectPermission.grade_ids.includes(gradeId) : false;
  };

  const isAllGradesSelected = (subjectId: number): boolean => {
    const subjectPermission = localPermissions.find(p => p.subject_id === subjectId);
    return subjectPermission ? subjectPermission.grade_ids.length === grades.length : false;
  };

  const getSelectedGradesCount = (subjectId: number): number => {
    const subjectPermission = localPermissions.find(p => p.subject_id === subjectId);
    return subjectPermission ? subjectPermission.grade_ids.length : 0;
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Select the subjects and grades this school should have access to. Click on a subject to expand/collapse its grades.
      </div>
      
      {subjects.map(subject => (
        <div key={subject.subject_id} className="border rounded-lg">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSubjectExpansion(subject.subject_id)}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: subject.color }}
              />
              <span className="font-medium">{subject.subject_name}</span>
              <span className="text-sm text-gray-500">
                ({getSelectedGradesCount(subject.subject_id)}/{grades.length} grades selected)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAllGradesForSubject(subject.subject_id);
                }}
                className={`px-3 py-1 text-xs rounded ${
                  isAllGradesSelected(subject.subject_id)
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {isAllGradesSelected(subject.subject_id) ? 'Remove All' : 'Select All'}
              </button>
              {expandedSubjects.has(subject.subject_id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </div>
          
          {expandedSubjects.has(subject.subject_id) && (
            <div className="border-t p-4 bg-gray-50">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {grades.map(grade => (
                  <button
                    key={grade.grade_id}
                    onClick={() => toggleGradePermission(subject.subject_id, grade.grade_id)}
                    className={`flex items-center justify-center p-2 rounded text-sm font-medium transition-colors ${
                      isGradeSelected(subject.subject_id, grade.grade_id)
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isGradeSelected(subject.subject_id, grade.grade_id) ? (
                      <Check className="w-4 h-4 mr-1" />
                    ) : (
                      <X className="w-4 h-4 mr-1" />
                    )}
                    {grade.grade_level}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      
      {localPermissions.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Selected Permissions:</h4>
          <div className="space-y-2">
            {localPermissions.map(permission => {
              const subject = subjects.find(s => s.subject_id === permission.subject_id);
              const selectedGrades = grades.filter(g => permission.grade_ids.includes(g.grade_id));
              return (
                <div key={permission.subject_id} className="text-sm">
                  <span className="font-medium">{subject?.subject_name}</span>: {' '}
                  <span className="text-gray-600">
                    {selectedGrades.map(g => g.grade_level).join(', ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectGradeMatrix;


