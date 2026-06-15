import React from "react";
import { Activity, ShieldCheck, Stethoscope } from 'lucide-react';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <section className="auth-brand">
        <div className="brand-mark"><Stethoscope size={34} /></div>
        <p>Sistema de Telemedicina</p>
        <h1>MediConnect</h1>
        <span>Atención médica digital, segura y organizada para pacientes, médicos y administradores.</span>
        <div className="brand-grid">
          <div><ShieldCheck size={22} /><b>JWT</b><small>Acceso seguro</small></div>
          <div><Activity size={22} /><b>Tiempo real</b><small>Chat médico</small></div>
        </div>
      </section>
      <section className="auth-card">
        <div className="auth-heading">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
