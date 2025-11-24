import React, { useState, useEffect } from 'react';
import { Review } from '../types/schedule';
import { CreateReviewModal } from './CreateReviewModal';
import { ConfirmModal } from './ConfirmModal';
import { toastManager } from '../utils/toast';
import { Plus, Star, User, BookOpen, MessageSquare, Edit, Trash2, ThumbsUp, Search, Filter, Calendar } from 'lucide-react';
import { loadReviewsFromLocal, saveReviewsToLocal, deleteReview, markReviewHelpful, generateReviewId } from '../utils/reviewStorage';

interface ReviewsViewProps {
  onBack: () => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({ onBack }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'professor' | 'subject' | 'general'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'helpful'>('date');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = () => {
    const loaded = loadReviewsFromLocal();
    setReviews(loaded);
  };

  const handleSaveReview = (reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'helpful'>) => {
    if (reviewToEdit) {
      // Update existing review
      const updated: Review = {
        ...reviewToEdit,
        ...reviewData,
        updatedAt: new Date(),
      };
      const allReviews = loadReviewsFromLocal();
      const updatedReviews = allReviews.map((r) => (r.id === reviewToEdit.id ? updated : r));
      saveReviewsToLocal(updatedReviews);
      setReviews(updatedReviews);
      toastManager.success(`Reseña "${updated.title}" actualizada correctamente`);
    } else {
      // Create new review
      const newReview: Review = {
        id: generateReviewId(),
        ...reviewData,
        createdAt: new Date(),
        updatedAt: new Date(),
        helpful: 0,
      };
      const allReviews = loadReviewsFromLocal();
      allReviews.push(newReview);
      saveReviewsToLocal(allReviews);
      setReviews(allReviews);
      toastManager.success(`Reseña "${newReview.title}" publicada correctamente`);
    }
    setShowCreateModal(false);
    setReviewToEdit(null);
  };

  const handleDeleteReview = (id: string) => {
    setReviewToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteReview = () => {
    if (reviewToDelete) {
      const deletedReview = reviews.find((r) => r.id === reviewToDelete);
      if (deleteReview(reviewToDelete)) {
        loadReviews();
        toastManager.success(`Reseña "${deletedReview?.title}" eliminada correctamente`);
      }
      setReviewToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  const handleEditReview = (review: Review) => {
    setReviewToEdit(review);
    setShowCreateModal(true);
  };

  const handleMarkHelpful = (id: string) => {
    const updated = markReviewHelpful(id);
    if (updated) {
      loadReviews();
    }
  };

  const filteredReviews = reviews
    .filter((review) => {
      const matchesSearch =
        !searchTerm ||
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.author?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || review.type === filterType;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'helpful':
          return (b.helpful || 0) - (a.helpful || 0);
        default:
          return 0;
      }
    });

  const getTypeIcon = (type: Review['type']) => {
    switch (type) {
      case 'professor':
        return <User className="w-4 h-4" />;
      case 'subject':
        return <BookOpen className="w-4 h-4" />;
      case 'general':
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: Review['type']) => {
    switch (type) {
      case 'professor':
        return 'Profesor';
      case 'subject':
        return 'Materia';
      case 'general':
        return 'General';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-brand-blue-900 via-brand-blue-700 to-brand-orange-500 bg-clip-text text-transparent animate-gradient">
          Reseñas y Opiniones
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Comparte tu experiencia sobre profesores, materias y más.
          <span className="block mt-2 text-brand-orange-500 font-semibold">Ayuda a otros estudiantes a tomar mejores decisiones</span>
        </p>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 mb-8 card-hover">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Reseñas ({filteredReviews.length})</h2>
          <button
            onClick={() => {
              setReviewToEdit(null);
              setShowCreateModal(true);
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-brand-blue-900 to-brand-blue-800 text-white rounded-xl hover:from-brand-blue-800 hover:to-brand-blue-700 dark:from-brand-blue-800 dark:to-brand-blue-700 dark:hover:from-brand-blue-700 dark:hover:to-brand-blue-600 transition-all duration-300 shadow-lg shadow-brand-blue-900/30 hover:shadow-xl hover:shadow-brand-blue-900/40 transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Reseña</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Buscar</label>
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar reseñas..."
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por tipo</label>
            <div className="relative">
              <Filter className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full py-2 pl-10 pr-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="professor">Profesores</option>
                <option value="subject">Materias</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Más recientes</option>
              <option value="rating">Mejor calificación</option>
              <option value="helpful">Más útiles</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <Star className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay reseñas</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {searchTerm || filterType !== 'all'
                ? 'No se encontraron reseñas con los filtros seleccionados'
                : 'Sé el primero en compartir tu experiencia'}
            </p>
            {!searchTerm && filterType === 'all' && (
              <button
                onClick={() => {
                  setReviewToEdit(null);
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center px-4 py-2 space-x-2 text-white bg-brand-blue-900 dark:bg-brand-blue-800 rounded-lg hover:bg-brand-blue-800 dark:hover:bg-brand-blue-700 transition-colors shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Primera Reseña</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        {getTypeIcon(review.type)}
                        <span className="text-xs font-medium text-blue-800 dark:text-blue-300">
                          {getTypeLabel(review.type)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{review.title}</h3>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{review.targetName}</span>
                        {review.targetCode && (
                          <span className="text-xs">({review.targetCode})</span>
                        )}
                      </div>
                      {review.author && (
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{review.author}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(review.createdAt).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {review.rating}/5
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{review.content}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="p-2 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Editar reseña"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Eliminar reseña"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleMarkHelpful(review.id)}
                    className="flex items-center space-x-2 px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">Útil ({review.helpful || 0})</span>
                  </button>
                  {review.updatedAt.getTime() !== review.createdAt.getTime() && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Editado: {new Date(review.updatedAt).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateReviewModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setReviewToEdit(null);
          }}
          onSave={handleSaveReview}
          reviewToEdit={reviewToEdit}
        />
      )}

      {showDeleteConfirm && reviewToDelete && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Eliminar Reseña"
          message={`¿Estás seguro de que deseas eliminar la reseña "${reviews.find((r) => r.id === reviewToDelete)?.title}"? Esta acción no se puede deshacer.`}
          type="danger"
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDeleteReview}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setReviewToDelete(null);
          }}
        />
      )}
    </div>
  );
};

