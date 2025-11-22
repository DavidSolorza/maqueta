import { Review } from '../types/schedule';

const STORAGE_KEY = 'reviews';

export const saveReviewsToLocal = (reviews: Review[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch (error) {
    console.error('Error saving reviews to localStorage:', error);
  }
};

export const loadReviewsFromLocal = (): Review[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((review: any) => ({
      ...review,
      createdAt: new Date(review.createdAt),
      updatedAt: new Date(review.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading reviews from localStorage:', error);
    return [];
  }
};

export const generateReviewId = (): string => {
  return `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const addReview = (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Review => {
  const reviews = loadReviewsFromLocal();
  const newReview: Review = {
    id: generateReviewId(),
    ...review,
    createdAt: new Date(),
    updatedAt: new Date(),
    helpful: 0,
  };
  reviews.push(newReview);
  saveReviewsToLocal(reviews);
  return newReview;
};

export const updateReview = (id: string, updates: Partial<Review>): Review | null => {
  const reviews = loadReviewsFromLocal();
  const index = reviews.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated: Review = {
    ...reviews[index],
    ...updates,
    updatedAt: new Date(),
  };
  reviews[index] = updated;
  saveReviewsToLocal(reviews);
  return updated;
};

export const deleteReview = (id: string): boolean => {
  const reviews = loadReviewsFromLocal();
  const filtered = reviews.filter((r) => r.id !== id);
  if (filtered.length === reviews.length) return false;
  saveReviewsToLocal(filtered);
  return true;
};

export const markReviewHelpful = (id: string): Review | null => {
  const reviews = loadReviewsFromLocal();
  const index = reviews.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated: Review = {
    ...reviews[index],
    helpful: (reviews[index].helpful || 0) + 1,
    updatedAt: new Date(),
  };
  reviews[index] = updated;
  saveReviewsToLocal(reviews);
  return updated;
};

