import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface Tag {
  tag_id: number;
  tag_name: string;
  description?: string;
  color?: string;
  created_at: string;
}

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tagData: any) => Promise<void>;
  tag?: Tag | null;
  mode: 'create' | 'edit';
}

const TagModal: React.FC<TagModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tag,
  mode
}) => {
  const [tagName, setTagName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tag && mode === 'edit') {
      setTagName(tag.tag_name);
      setDescription(tag.description || '');
    } else {
      setTagName('');
      setDescription('');
    }
  }, [tag, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) {
      alert('Tag name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const tagData = {
        tag_name: tagName.trim(),
        description: description.trim() || null
      };

      await onSubmit(tagData);
      onClose();
    } catch (error) {
      console.error('Error submitting tag:', error);
      alert('Failed to save tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add New Tag' : 'Edit Tag'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="tagName" className="block text-sm font-medium text-gray-700 mb-2">
              Tag Name *
            </label>
            <input
              type="text"
              id="tagName"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter tag name"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <RichTextEditor
              value={description}
              onChange={(value) => setDescription(value)}
              placeholder="Enter tag description (optional)"
            />
          </div>



          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Tag' : 'Update Tag'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TagModal;
