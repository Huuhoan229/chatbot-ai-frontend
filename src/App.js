import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Gifts from './pages/Gifts';
import ImageGallery from './pages/ImageGallery';
import TrainingAI from './pages/TrainingAI';
import SteelRules from './pages/SteelRules';
import AIConfig from './pages/AIConfig';
import Billing from './pages/Billing';
import CustomerInfoSettings from './pages/CustomerInfoSettings';
import Customers from './pages/Customers';
import './index.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="gifts" element={<Gifts />} />
          <Route path="images" element={<ImageGallery />} />
          <Route path="training" element={<TrainingAI />} />
          <Route path="steel-rules" element={<SteelRules />} />
          <Route path="ai-config" element={<AIConfig />} />
          <Route path="billing" element={<Billing />} />
          <Route path="customer-info" element={<CustomerInfoSettings />} />
          <Route path="customers" element={<Customers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
