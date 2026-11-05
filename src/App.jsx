import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Favorites from './pages/Favorites';
import ItineraryPlanner from './pages/ItineraryPlanner';
import Profile from './pages/Profile';
import ChatBot from './components/ChatBot';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/katalog" element={<Catalog />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/favorit" element={<Favorites />} />
          <Route path="/itinerary" element={<ItineraryPlanner />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        {/* Floating AI Recommendation Chatbot (DestinaTaste AI) */}
        <ChatBot />
      </BrowserRouter>
    </AuthProvider>
  );
}
