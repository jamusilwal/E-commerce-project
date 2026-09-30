import { useEffect, useState } from 'react';
import { categoryService } from '../services/dataService';
import { CATEGORIES } from '../utils/constants';

// Built-in list used until (or if) the API responds. `id` is the slug, matching
// the `?category=` filter the products API expects.
const FALLBACK = CATEGORIES.map((c) => ({ id: c.id, slug: c.id, name: c.name, productCount: null }));

// Shared across every component so the list is fetched once per page load
let cache = null;
let request = null;
const listeners = new Set();

const loadCategories = () => {
  if (!request) {
    request = categoryService
      .getCategories()
      .then((res) => {
        const list = Array.isArray(res.data.data) ? res.data.data : [];
        cache = list.length
          ? list.map((c) => ({
              id: c.slug,
              slug: c.slug,
              name: c.name,
              productCount: c._count?.products ?? null,
            }))
          : FALLBACK;
        return cache;
      })
      .catch(() => {
        request = null; // allow a retry on the next mount
        return FALLBACK;
      });
  }
  return request;
};

/** Reloads categories everywhere — call after an admin edits categories */
export const invalidateCategories = () => {
  cache = null;
  request = null;
  loadCategories().then((list) => listeners.forEach((notify) => notify(list)));
};

/**
 * Categories from the API, with the built-in list as an instant fallback.
 * @returns {Array<{id: string, slug: string, name: string, productCount: number|null}>}
 */
const useCategories = () => {
  const [categories, setCategories] = useState(cache || FALLBACK);

  useEffect(() => {
    let active = true;
    loadCategories().then((list) => {
      if (active) setCategories(list);
    });
    listeners.add(setCategories);
    return () => {
      active = false;
      listeners.delete(setCategories);
    };
  }, []);

  return categories;
};

export default useCategories;
