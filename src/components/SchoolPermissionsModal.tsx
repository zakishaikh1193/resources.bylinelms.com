import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import SubjectGradeMatrix from './SubjectGradeMatrix';

interface School {
  user_id: number;
  name: string;
  email: string;
  organization: string;
  subjects_count?: number;
  grades_count?: number;
  total_permissions?: number;
}

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

interface SchoolPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School | null;
  onPermissionsUpdated: () => void;
}

const SchoolPermissionsModal: React.FC<SchoolPermissionsModalProps> = ({
  isOpen,
  onClose,
  school,
  onPermissionsUpdated
}) => {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && school) {
      loadData();
    }
  }, [isOpen, school]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load subjects and grades
      const [subjectsResponse, gradesResponse] = await Promise.all([
        fetch(API_ENDPOINTS.SUBJECTS_WITH_GRADES, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!subjectsResponse.ok) {
        throw new Error('Failed to load subjects and grades');
      }

      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData.data.subjects);
      setGrades(subjectsData.data.grades);

      // Load current permissions
      const permissionsResponse = await fetch(API_ENDPOINTS.SCHOOL_PERMISSIONS(school!.user_id), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        const formattedPermissions = permissionsData.data.permissions.map((p: any) => ({
          subject_id: p.subject_id,
          grade_ids: p.grade_ids
        }));
        setPermissions(formattedPermissions);
      } else {
        setPermissions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!school) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(API_ENDPOINTS.SCHOOL_PERMISSIONS(school.user_id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permissions: permissions
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save permissions');
      }

      setSuccess('School permissions updated successfully!');
      onPermissionsUpdated();
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionsChange = (newPermissions: Permission[]) => {
    setPermissions(newPermissions);
  };

  if (!isOpen || !school) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Permissions for {school.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {school.organization} • {school.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading permissions...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">Error loading data</p>
                <p className="text-gray-600 text-sm mt-1">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <SubjectGradeMatrix
              subjects={subjects}
              grades={grades}
              permissions={permissions}
              onPermissionsChange={handlePermissionsChange}
            />
          )}
        </div>

        {success && (
          <div className="px-6 py-3 bg-green-50 border-t border-green-200">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700 font-medium">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-200">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Permissions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolPermissionsModal;
