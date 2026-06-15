import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  MessageCircle,
  Search,
  Stethoscope,
  UserRound
} from "lucide-react";
import { citaApi, disponibilidadApi, especialidadApi, userApi, historiaApi } from "../api/endpoints.js";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatCard from "../components/StatCard.jsx";
import {
  appointmentTitle,
  formatDate,
  messageFromError,
  statusLabel,
  todayISO
} from "../utils/helpers.js";

export default function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [mode, setMode] = useState("manual");
  const [search, setSearch] = useState("");
  const [historyResult, setHistoryResult] = useState(null);

  const [form, setForm] = useState({
    id_medico: "",
    fecha: "",
    hora: "",
    motivo: ""
  });

  const [historyQuery, setHistoryQuery] = useState({
    id_cita: ""
  });

  const filteredDoctors = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return doctors;

    return doctors.filter((doctor) => {
      const name = String(doctor.nombre || "").toLowerCase();
      const email = String(doctor.email || doctor.correo || "").toLowerCase();
      const specialty = String(doctor.especialidad || "").toLowerCase();

      return name.includes(term) || email.includes(term) || specialty.includes(term);
    });
  }, [doctors, search]);

  const selectedDoctor = useMemo(() => {
    return doctors.find((doctor) => Number(doctor.id) === Number(form.id_medico));
  }, [doctors, form.id_medico]);

  const availableSlots = useMemo(() => {
    return doctorAvailability.filter((item) => item.fecha >= todayISO());
  }, [doctorAvailability]);

  const activeAppointments = useMemo(() => {
    return appointments.filter((cita) => cita.estado !== "cancelada");
  }, [appointments]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [doctorsResponse, appointmentsResponse, specialtiesResponse] = await Promise.allSettled([
        userApi.doctors(),
        citaApi.mine(),
        especialidadApi.list()
      ]);

      if (doctorsResponse.status === "fulfilled") {
        setDoctors(
          doctorsResponse.value.data.medicos ||
          doctorsResponse.value.data.data ||
          doctorsResponse.value.data ||
          []
        );
      }

      if (appointmentsResponse.status === "fulfilled") {
        setAppointments(
          appointmentsResponse.value.data.citas ||
          appointmentsResponse.value.data.data ||
          appointmentsResponse.value.data ||
          []
        );
      }

      if (specialtiesResponse.status === "fulfilled") {
        setSpecialties(
          specialtiesResponse.value.data.especialidades ||
          specialtiesResponse.value.data.data ||
          specialtiesResponse.value.data ||
          []
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch(() => {});
  }, []);

  const loadDoctorAvailability = async (id_medico) => {
    setDoctorAvailability([]);
    setForm((current) => ({ ...current, id_medico, fecha: "", hora: "" }));

    if (!id_medico) return;

    setLoadingAvailability(true);
    setStatus({ type: "", text: "" });

    try {
      const { data } = await disponibilidadApi.byDoctor(id_medico);
      const rows = data.disponibilidades || data.disponibilidad || data.data || data || [];
      setDoctorAvailability(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setDoctorAvailability([]);
      setStatus({
        type: "error",
        text: "No se pudo cargar la disponibilidad del médico. Verifica que el backend tenga la ruta GET /api/disponibilidad/medico/:id_medico."
      });
    } finally {
      setLoadingAvailability(false);
    }
  };

  const validateAppointment = () => {
    if (!form.id_medico) return "Selecciona un médico.";
    if (!form.fecha) return "Selecciona una fecha.";
    if (!form.hora) return "Selecciona una hora.";

    if (form.fecha < todayISO()) {
      return "No puedes agendar una cita en una fecha pasada.";
    }

    if (!/^\d{2}:\d{2}$/.test(form.hora)) {
      return "Selecciona una hora válida.";
    }

    return "";
  };

  const validateGuidedAppointment = () => {
    const baseValidation = validateAppointment();
    if (baseValidation) return baseValidation;

    const selectedBlock = doctorAvailability.find((item) => item.fecha === form.fecha);

    if (!selectedBlock) {
      return "Selecciona una fecha disponible del médico.";
    }

    const start = selectedBlock.hora_inicio;
    const end = selectedBlock.hora_fin;

    if (!start || !end) {
      return "La disponibilidad seleccionada no tiene rango horario válido.";
    }

    if (form.hora < start || form.hora > end) {
      return `La hora debe estar entre ${start} y ${end}.`;
    }

    return "";
  };

  const scheduleAppointment = async (event) => {
    event.preventDefault();
    setStatus({ type: "", text: "" });

    const validation = mode === "guided" ? validateGuidedAppointment() : validateAppointment();

    if (validation) {
      setStatus({ type: "error", text: validation });
      return;
    }

    try {
      const payload = {
        id_medico: Number(form.id_medico),
        fecha: form.fecha,
        hora: form.hora,
        motivo: form.motivo.trim() || "Consulta médica"
      };

      await citaApi.book(payload);

      setStatus({
        type: "success",
        text: `Cita agendada correctamente con ${selectedDoctor?.nombre || "el médico"} para ${formatDate(form.fecha)} a las ${form.hora}.`
      });

      setForm({ id_medico: "", fecha: "", hora: "", motivo: "" });
      setDoctorAvailability([]);
      await loadData();
    } catch (err) {
      setStatus({
        type: "error",
        text: messageFromError(err, "No se pudo agendar la cita")
      });
    }
  };

  const cancelAppointment = async (id) => {
    setStatus({ type: "", text: "" });

    try {
      await citaApi.cancel(id);
      setStatus({ type: "success", text: "Cita cancelada correctamente." });
      await loadData();
    } catch (err) {
      setStatus({
        type: "error",
        text: messageFromError(err, "No se pudo cancelar la cita")
      });
    }
  };

  const consultHistory = async () => {
    setStatus({ type: "", text: "" });
    setHistoryResult(null);

    if (!historyQuery.id_cita) {
      setStatus({ type: "error", text: "Selecciona una cita para consultar su historia clínica." });
      return;
    }

    try {
      const { data } = await historiaApi.getByCita(historyQuery.id_cita);
      setHistoryResult(data.data || data.historia || data);
    } catch (err) {
      setStatus({
        type: "error",
        text: messageFromError(err, "Historia clínica no encontrada para esa cita")
      });
    }
  };

  const selectDoctorFromCard = (doctor) => {
    setMode("guided");
    loadDoctorAvailability(String(doctor.id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectAvailabilityBlock = (block) => {
    setForm((current) => ({
      ...current,
      fecha: block.fecha,
      hora: block.hora_inicio || ""
    }));
  };

  return (
    <main className="page-content">
      <section className="hero-card patient-hero compact-hero">
        <div>
          <p>Portal paciente</p>
          <h1>Agenda y seguimiento médico</h1>
          <span>
            Selecciona un médico, agenda una cita según disponibilidad y revisa tu historial clínico.
          </span>
        </div>
        <div className="hero-badge">Paciente</div>
      </section>

      <section className="stats-grid three">
        <StatCard
          label="Citas activas"
          value={activeAppointments.length}
          detail="Programadas"
          icon={<CalendarCheck size={22} />}
        />
        <StatCard
          label="Médicos"
          value={doctors.length}
          detail="Disponibles"
          icon={<Stethoscope size={22} />}
        />
        <StatCard
          label="Especialidades"
          value={specialties.length}
          detail="Áreas médicas"
          icon={<UserRound size={22} />}
        />
      </section>

      <Alert type={status.type}>{status.text}</Alert>

      <section className="content-grid two-columns">
        <article className="panel-card">
          <div className="section-title">
            <div>
              <p>Agendamiento</p>
              <h2>Nueva cita médica</h2>
            </div>
          </div>

          <div className="mode-switch">
            <button
              type="button"
              className={mode === "manual" ? "primary-button small" : "secondary-button small"}
              onClick={() => {
                setMode("manual");
                setDoctorAvailability([]);
              }}
            >
              Modo rápido
            </button>

            <button
              type="button"
              className={mode === "guided" ? "primary-button small" : "secondary-button small"}
              onClick={() => setMode("guided")}
            >
              Ver horarios del médico
            </button>
          </div>

          <form onSubmit={scheduleAppointment} className="form-grid appointment-form">
            <label>
              Médico
              <select
                value={form.id_medico}
                onChange={(e) => {
                  if (mode === "guided") {
                    loadDoctorAvailability(e.target.value);
                  } else {
                    setForm({ ...form, id_medico: e.target.value });
                  }
                }}
                required
              >
                <option value="">Seleccionar médico</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.nombre} {doctor.especialidad ? `- ${doctor.especialidad}` : ""} #{doctor.id}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Fecha
              <input
                type="date"
                min={todayISO()}
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                required
              />
            </label>

            <label>
              Hora
              <input
                type="time"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                required
              />
            </label>

            <label className="full-row">
              Motivo
              <input
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                placeholder="Ej. Consulta general, dolor de cabeza, control médico"
              />
            </label>

            {mode === "guided" && (
              <div className="full-row availability-selector">
                <div className="section-title compact">
                  <div>
                    <p>Horarios disponibles</p>
                    <h3>{selectedDoctor ? selectedDoctor.nombre : "Selecciona un médico"}</h3>
                  </div>
                  {loadingAvailability && <span className="soft-label">Cargando...</span>}
                </div>

                {!form.id_medico ? (
                  <div className="helper-card">Selecciona un médico para ver sus bloques de disponibilidad.</div>
                ) : availableSlots.length === 0 ? (
                  <div className="helper-card">
                    No hay horarios cargados para este médico o el backend todavía no devuelve disponibilidad.
                  </div>
                ) : (
                  <div className="availability-list">
                    {availableSlots.map((block, index) => (
                      <button
                        type="button"
                        key={`${block.fecha}-${block.hora_inicio}-${block.hora_fin}-${index}`}
                        className={
                          form.fecha === block.fecha
                            ? "availability-option selected"
                            : "availability-option"
                        }
                        onClick={() => selectAvailabilityBlock(block)}
                      >
                        <span>{formatDate(block.fecha)}</span>
                        <strong>{block.hora_inicio} - {block.hora_fin}</strong>
                      </button>
                    ))}
                  </div>
                )}

                {form.fecha && form.hora && (
                  <div className="success-summary mini">
                    <b>Cita seleccionada</b>
                    <span>{formatDate(form.fecha)}</span>
                    <strong>{form.hora}</strong>
                  </div>
                )}
              </div>
            )}

            <button className="primary-button full-row">Agendar cita</button>
          </form>

          <div className="helper-card">
            En modo rápido puedes escribir fecha y hora. En modo horarios, primero seleccionas un médico y luego eliges uno de sus bloques disponibles.
          </div>
        </article>

        <article className="panel-card">
          <div className="section-title">
            <div>
              <p>Especialidades</p>
              <h2>Áreas médicas</h2>
            </div>
          </div>

          {specialties.length === 0 ? (
            <EmptyState title="Sin especialidades" text="El administrador todavía no registró áreas médicas." />
          ) : (
            <div className="chip-list">
              {specialties.map((specialty) => (
                <span className="chip" key={specialty.id || specialty.nombre}>
                  {specialty.nombre || specialty.descripcion || "Especialidad"}
                </span>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="panel-card">
        <div className="section-title">
          <div>
            <p>Directorio</p>
            <h2>Médicos disponibles</h2>
          </div>
        </div>

        <label className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar médico por nombre, correo o especialidad"
          />
        </label>

        {filteredDoctors.length === 0 ? (
          <EmptyState title="No hay médicos" text="No se encontraron médicos disponibles." />
        ) : (
          <div className="doctor-grid">
            {filteredDoctors.map((doctor) => (
              <article className="doctor-card" key={doctor.id}>
                <div className="doctor-avatar">
                  <Stethoscope size={22} />
                </div>

                <div>
                  <h3>{doctor.nombre}</h3>
                  <p>{doctor.email || doctor.correo || "Sin correo registrado"}</p>
                  <span>{doctor.especialidad || "Médico general"}</span>
                </div>

                <button
                  type="button"
                  className="secondary-button small"
                  onClick={() => selectDoctorFromCard(doctor)}
                >
                  Ver horarios
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel-card">
        <div className="section-title">
          <div>
            <p>Seguimiento</p>
            <h2>Mis citas</h2>
          </div>
          {loading && <span className="soft-label">Cargando...</span>}
        </div>

        {appointments.length === 0 ? (
          <EmptyState title="No tienes citas" text="Agenda una consulta para iniciar tu atención médica." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Médico</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((cita) => (
                  <tr key={cita.id}>
                    <td>#{cita.id}</td>
                    <td>{cita.medico_nombre || cita.medico || `Médico #${cita.id_medico}`}</td>
                    <td>{formatDate(cita.fecha)}</td>
                    <td>{cita.hora}</td>
                    <td>
                      <span className={`status ${cita.estado}`}>
                        {statusLabel(cita.estado)}
                      </span>
                    </td>
                    <td className="actions">
                      <Link to={`/chat/${cita.id}`} className="icon-link">
                        <MessageCircle size={16} /> Chat
                      </Link>

                      <button
                        className="secondary-button small"
                        onClick={() => setHistoryQuery({ id_cita: String(cita.id) })}
                      >
                        Historia
                      </button>

                      {cita.estado !== "cancelada" && (
                        <button
                          className="ghost-button danger"
                          onClick={() => cancelAppointment(cita.id)}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel-card">
        <div className="section-title">
          <div>
            <p>Historial</p>
            <h2>Historia clínica por cita</h2>
          </div>
        </div>

        <div className="form-grid history-query">
          <label>
            Cita
            <select
              value={historyQuery.id_cita}
              onChange={(e) => setHistoryQuery({ id_cita: e.target.value })}
            >
              <option value="">Seleccionar cita</option>
              {appointments.map((cita) => (
                <option key={cita.id} value={cita.id}>
                  {appointmentTitle(cita)}
                </option>
              ))}
            </select>
          </label>

          <button className="secondary-button" type="button" onClick={consultHistory}>
            Consultar
          </button>
        </div>

        {historyResult && (
          <div className="history-result">
            <h3>Historia clínica</h3>
            <p><b>Diagnóstico:</b> {historyResult.diagnostico || "Sin diagnóstico"}</p>
            <p><b>Tratamiento:</b> {historyResult.tratamiento || "Sin tratamiento"}</p>
            <p><b>Notas:</b> {historyResult.notas_medicas || "Sin notas médicas"}</p>
          </div>
        )}
      </section>
    </main>
  );
}