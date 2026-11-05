const API_BASE_URL = '/api';

// Helper headers dengan Authorization jika token tersedia
function getHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// =================== AUTHENTICATION ===================

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal login');
  return data;
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal registrasi');
  return data;
}

export async function getMe(token) {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Sesi berakhir');
  return data.user;
}

export async function updateUserProfile(profileData, token) {
  const res = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(profileData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memperbarui profil');
  return data;
}

export async function fetchAllUsers(token) {
  const res = await fetch(`${API_BASE_URL}/auth/users`, {
    headers: getHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil data pengguna');
  return data.data;
}

export async function createUserAdmin(userData, token) {
  const res = await fetch(`${API_BASE_URL}/auth/users`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menambahkan pengguna');
  return data;
}

export async function updateUserAdmin(id, userData, token) {
  const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memperbarui pengguna');
  return data;
}

export async function deleteUserAdmin(id, token) {
  const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menghapus pengguna');
  return data;
}

// =================== DESTINATIONS ===================

export async function fetchDestinations(options = {}) {
  const query = new URLSearchParams();
  if (options.search) query.append('search', options.search);
  if (options.category && options.category !== 'Semua') query.append('category', options.category);
  if (options.type && options.type !== 'Semua') query.append('type', options.type);
  if (options.featured !== undefined) query.append('featured', options.featured ? 'true' : 'false');

  const queryString = query.toString();
  const url = `${API_BASE_URL}/destinations${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Gagal mengambil destinasi: ${response.statusText}`);
  const result = await response.json();
  return result.data || [];
}

export async function fetchDestinationById(id) {
  const response = await fetch(`${API_BASE_URL}/destinations/${id}`);
  if (!response.ok) throw new Error(`Gagal mengambil detail destinasi ID ${id}`);
  const result = await response.json();
  return result.data;
}

export async function createDestination(destData, token) {
  const res = await fetch(`${API_BASE_URL}/destinations`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(destData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menambah destinasi');
  return data;
}

export async function updateDestination(id, destData, token) {
  const res = await fetch(`${API_BASE_URL}/destinations/${id}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(destData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memperbarui destinasi');
  return data;
}

export async function deleteDestination(id, token) {
  const res = await fetch(`${API_BASE_URL}/destinations/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menghapus destinasi');
  return data;
}

// =================== CATEGORIES ===================

export async function fetchCategories(type) {
  const query = new URLSearchParams();
  if (type && type !== 'Semua') query.append('type', type);

  const queryString = query.toString();
  const url = `${API_BASE_URL}/categories${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Gagal mengambil kategori: ${response.statusText}`);
  const result = await response.json();
  return result.data || [];
}

// =================== REVIEWS ===================

export async function fetchReviews(destinationId) {
  const res = await fetch(`${API_BASE_URL}/destinations/${destinationId}/reviews`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil ulasan');
  return data.data || [];
}

export async function submitReview(destinationId, reviewData, token) {
  const res = await fetch(`${API_BASE_URL}/destinations/${destinationId}/reviews`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(reviewData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengirim ulasan');
  return data;
}

export async function deleteReview(reviewId, token) {
  const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menghapus ulasan');
  return data;
}

// =================== ADMIN ===================

export async function fetchAdminStats(token) {
  const res = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: getHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil data statistik');
  return data;
}

// =================== FAVORITES (WISHLIST) ===================

export async function fetchFavorites(token) {
  const res = await fetch(`${API_BASE_URL}/favorites`, {
    headers: getHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil data favorit');
  return data.data || [];
}

export async function fetchFavoriteIds(token) {
  if (!token) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/favorites/ids`, {
      headers: getHeaders(token),
    });
    const data = await res.json();
    return data.ids || [];
  } catch {
    return [];
  }
}

export async function toggleFavorite(destinationId, token) {
  const res = await fetch(`${API_BASE_URL}/favorites/${destinationId}`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengubah status favorit');
  return data;
}

// =================== AI ITINERARY GENERATOR ===================

export async function generateAIItinerary(planData, token) {
  const res = await fetch(`${API_BASE_URL}/chat/itinerary`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(planData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal membuat rencana perjalanan AI');
  return data;
}

// =================== ADMIN & EXPORT ===================

export async function fetchAllReviewsAdmin(token) {
  const res = await fetch(`${API_BASE_URL}/reviews`, {
    headers: getHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil ulasan untuk admin');
  return data.data || [];
}

export async function downloadDestinationsCSV(token) {
  const res = await fetch(`${API_BASE_URL}/admin/export/destinations`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Gagal mengekspor data destinasi');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `destinataste_destinasi_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadReviewsCSV(token) {
  const res = await fetch(`${API_BASE_URL}/admin/export/reviews`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Gagal mengekspor data ulasan');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `destinataste_ulasan_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// =================== AI CHATBOT ===================

export async function sendMessageToAI(message, history = [], token = '') {
  const headers = getHeaders(token);

  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, history }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menghubungi asisten AI');
  return data;
}

// =================== FILE UPLOAD ===================

export async function uploadImage(file, token) {
  const formData = new FormData();
  formData.append('image', file);

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengunggah gambar');
  return data;
}
