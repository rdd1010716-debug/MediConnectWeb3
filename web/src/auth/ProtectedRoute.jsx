import React from "react";
import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getUser, roleHome } from './session.js';

export default function ProtectedRoute({ roles }) {
  const token = getToken();
  const user = getUser();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to={roleHome(user.rol)} replace />;
  return <Outlet />;
}
