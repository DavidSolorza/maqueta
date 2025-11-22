import React, { useState, useEffect } from 'react';
import { Review } from '../types/schedule';
import { X, Save, Star, User, BookOpen, MessageSquare } from 'lucide-react';
import { toastManager } from '../utils/toast';

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'helpful'>) => void;
  reviewToEdit?: Review | null;
}

const REVIEW_TYPES = [
  { value: 'professor', label: 'Profesor', icon: <User className="w-4 h-4" /> },
  { value: 'subject', label: 'Materia', icon: <BookOpen className="w-4 h-4" /> },
  { value: 'general', label: 'General', icon: <MessageSquare className="w-4 h-4" /> },
];

export const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  isOpen,
  onClose,
  onSave,
  reviewToEdit,
}) => {
  const [type, setType] = useState<'professor' | 'subject' | 'general'>('professor');
  const [targetName, setTargetName] = useState('');
  const [targetCode, setTargetCode] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    if (reviewToEdit) {
      setType(reviewToEdit.type);
      setTargetName(reviewToEdit.targetName);
      setTargetCode(reviewToEdit.targetCode || '');
      setRating(reviewToEdit.rating);
      setTitle(reviewToEdit.title);
      setContent(reviewToEdit.content);
      setAuthor(reviewToEdit.author || '');
    } else {
      setType('professor');
      setTargetName('');
      setTargetCode('');
      setRating(5);
      setTitle('');
      setContent('');
      setAuthor('');
    }
  }, [reviewToEdit, isOpen]);

  const handleSave = () => {
    if (!targetName.trim()) {
      toastManager.error('Por favor ingresa el nombre del profesor, materia o título');
      return;
    }

    if (!title.trim()) {
      toastManager.error('Por favor ingresa un título para la reseña');
      return;
    }

    if (!content.trim()) {
      toastManager.error('Por favor ingresa el contenido de la reseña');
      return;
    }

    if (rating < 1 || rating > 5) {
      toastManager.error('La calificación debe estar entre 1 y 5');
      return;
    }

    onSave({
      type,
      targetName: targetName.trim(),
      targetCode: type === 'subject' ? targetCode.trim() : undefined,
      rating,
      title: title.trim(),
      content: content.trim(),
      author: author.trim() || undefined,
    });

    // Reset form
    setType('professor');
    setTargetName('');
    setTargetCode('');
    setRating(5);
    setTitle('');
    setContent('');
    setAuthor('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {reviewToEdit ? 'Editar Reseña' : 'Nueva Reseña'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {reviewToEdit ? 'Modifica los detalles de la reseña' : 'Comparte tu experiencia y opinión'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de reseña <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {REVIEW_TYPES.map((reviewType) => (
                <button
                  key={reviewType.value}
                  onClick={() => setType(reviewType.value as any)}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 rounded-lg transition-all ${
                    type === reviewType.value
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <span className={type === reviewType.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>
                    {reviewType.icon}
                  </span>
                  <span className={`font-medium ${type === reviewType.value ? 'text-blue-900 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {reviewType.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {type === 'professor' ? 'Nombre del Profesor' : type === 'subject' ? 'Nombre de la Materia' : 'Título'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={type === 'professor' ? 'Ej: Dr. García' : type === 'subject' ? 'Ej: Cálculo Diferencial' : 'Ej: Experiencia General'}
              autoFocus
            />
          </div>

          {/* Target Code (only for subjects) */}
          {type === 'subject' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código de la Materia (opcional)
              </label>
              <input
                type="text"
                value={targetCode}
                onChange={(e) => setTargetCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: MAT101"
              />
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Calificación <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                  type="button"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {rating}/5
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título de la reseña <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Excelente profesor, muy claro en sus explicaciones"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenido de la reseña <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Escribe tu reseña detallada aquí..."
              rows={6}
            />
          </div>

          {/* Author (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tu nombre (opcional)
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Juan Pérez"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-900/50 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-blue-600 dark:bg-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            disabled={!targetName.trim() || !title.trim() || !content.trim()}
          >
            <Save className="w-4 h-4" />
            <span>{reviewToEdit ? 'Guardar Cambios' : 'Publicar Reseña'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

