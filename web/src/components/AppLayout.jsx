import React from "react";
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, LogOut, MessageCircle, Stethoscope, UserRound } from 'lucide-react';
import { getUser, logoutUser, roleHome } from '../auth/session.js';

export default function AppLayout() {
  const user = getUser();
  const location = useLocation();
  const navByRole = {
    paciente: [{ to: '/paciente', label: 'Paciente', icon: <CalendarDays size={18} /> }],
    medico: [{ to: '/medico', label: 'Médico', icon: <Stethoscope size={18} /> }],
    admin: [{ to: '/admin', label: 'Admin', icon: <LayoutDashboard size={18} /> }]
  };
  const items = navByRole[user?.rol] || [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="sidebar-brand" to={roleHome(user?.rol)}>
          <span><Stethoscope size={24} /></span>
          <div>
            <b>MediConnect</b>
            <small>Telemedicina</small>
          </div>
        </Link>
        <nav>
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              {item.icon}<span>{item.label}</span>
            </NavLink>
          ))}
          <NavLink to="/chat/1" className={({ isActive }) => isActive || location.pathname.startsWith('/chat') ? 'nav-item active' : 'nav-item'}>
            <MessageCircle size={18} /><span>Chat</span>
          </NavLink>
        </nav>
        <button className="logout-button" onClick={() => logoutUser()}>
          <LogOut size={18} /><span>Cerrar sesión</span>
        </button>
      </aside>
      <section className="main-panel">
        <header className="topbar">
          <div>
            <p>Sistema de Telemedicina</p>
            <h2>Panel {user?.rol}</h2>
          </div>
          <div className="profile-pill">
            <UserRound size={18} />
            <span>{user?.nombre}</span>
          </div>
        </header>
        <Outlet />
      </section>
    </div>
  );
}
