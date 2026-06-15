import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarClock,
  ClipboardPlus,
  FileText,
  FileUp,
  MessageCircle,
  RefreshCw
} from "lucide-react";
import { citaApi, disponibilidadApi, historiaApi, recetaApi } from "../api/endpoints.js";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatCard from "../components/StatCard.jsx";
import {
  appointmentTitle,
  fileSizeMb,
  formatDate,
  isValidTimeRange,
  messageFromError,
  statusLabel,
  todayISO
} from "../utils/helpers.js";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [availability, setAvailability] = useState({
    fecha: "",
    hora_inicio: "",
    hora_fin: ""
  });
  const [history, setHistory] = useState({
    id_cita: "",
    diagnostico: "",
    tratamiento: "",
    notas_medicas: ""
  });
  const [savedHistory, setSavedHistory] = useState(null);
  const [recipe, setRecipe] = useState({ id_historia: "", archivo: null });
  const [loading, setLoading] = useState(false);
  const [lastAvailability, setLastAvailability] = useState(null);

  const currentYear = new Date().getFullYear();
  const maxAvailabilityDate = useMemo(() => `${currentYear + 2}-12-31`, [currentYear]);

  const activeAppointments = useMemo(
    () => appointments.filter((cita) => cita.estado !== "cancelada"),
    [appointments]
  );

  const todayAppointments = useMemo(
    () => activeAppointments.filter((cita) => cita.fecha === todayISO()).length,
    [activeAppointments]
  );

  const selectedAppointment = useMemo(
    () => appointments.find((cita) => Number(cita.id) === Number(history.id_cita)),
    [appointments, history.id_cita]
  );

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await citaApi.mine();
      setAppointments(data.citas || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments().catch(() => {});
  }, []);

  const isValidAvailabilityDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [year, month, day] = value.split("-").map(Number);

    if (year < currentYear) return false;
    if (year > currentYear + 2) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    const maxDate = new Date(currentYear + 2, 11, 31);

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    maxDate.setHours(23, 59, 59, 999);

    if (selectedDate.getFullYear() !== year) return false;
    if (selectedDate.getMonth() !== month - 1) return false;
    if (selectedDate.getDate() !== day) return false;
    if (selectedDate < today) return false;
    if (selectedDate > maxDate) return false;

    return true;
  };

  const changeAvailabilityDate = (value) => {
    if (value.length > 10) {
      setStatus({
        type: "error",
        text: "La fecha debe tener un año válido de 4 dígitos."
      });
      return;
    }

    setAvailability({ ...availability, fecha: value });
  };

  const validateAvailability = () => {
    if (!availability.fecha) return "Selecciona una fecha para registrar disponibilidad.";
    if (!availability.hora_inicio) return "Selecciona la hora de inicio.";
    if (!availability.hora_fin) return "Selecciona la hora de fin.";

    if (availability.fecha.length !== 10) {
      return "La fecha debe tener el formato correcto con año de 4 dígitos.";
    }

    if (!isValidAvailabilityDate(availability.fecha)) {
      return "Selecciona una fecha válida entre hoy y máximo 2 años hacia adelante.";
    }

    if (!isValidTimeRange(availability.hora_inicio, availability.hora_fin)) {
      return "La hora fin debe ser mayor a la hora inicio.";
    }

    return "";
  };

  const saveAvailability = async (event) => {
    event.preventDefault();
    setStatus({ type: "", text: "" });

    const validation = validateAvailability();
    if (validation) {
      setStatus({ type: "error", text: validation });
      return;
    }

    try {
      const savedBlock = { ...availability };
      await disponibilidadApi.create(savedBlock);
      setLastAvailability(savedBlock);
      setAvailability({ fecha: "", hora_inicio: "", hora_fin: "" });
      setStatus({
        type: "success",
        text: `Disponibilidad registrada para ${formatDate(savedBlock.fecha)} de ${savedBlock.hora_inicio} a ${savedBlock.hora_fin}.`
      });
    } catch (err) {
      setStatus({
        type: "error",
        text: messageFromError(err, "No se pudo registrar la disponibilidad")
      });
    }
  };

  const selectAppointmentForHistory = (cita) => {
    setSavedHistory(null);
    setRecipe({ id_historia: "", archivo: null });
    setHistory({
      id_cita: String(cita.id),
      diagnostico: "",
      tratamiento: "",
      notas_medicas: ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateHistory = () => {
    if (!history.id_cita) return "Selecciona una cita antes de crear la historia clínica.";
    if (!history.diagnostico.trim() || history.diagnostico.trim().length < 5) {
      return "Escribe un diagnóstico más claro.";
    }
    if (!history.tratamiento.trim() || history.tratamiento.trim().length < 5) {
      return "Escribe el tratamiento indicado.";
    }

    return "";
  };

  const saveHistory = async (event) => {
    event.preventDefault();
    setStatus({ type: "", text: "" });

    const validation = validateHistory();
    if (validation) {
      setStatus({ type: "error", text: validation });
      return;
    }

    try {
      const payload = {
        id_cita: Number(history.id_cita),
        diagnostico: history.diagnostico.trim(),
        tratamiento: history.tratamiento.trim(),
        notas_medicas: history.notas_medicas.trim()
      };

      const { data } = await historiaApi.create(payload);
      const created = data.data || data.historia || data;

      setSavedHistory(created);

      if (created?.id) {
        setRecipe((current) => ({ ...current, id_historia: String(created.id) }));
      }

      setStatus({
        type: "success",
        text: `Historia clínica creada correctamente${created?.id ? ` con ID ${created.id}` : ""}.`
      });
    } catch (err) {
      setStatus({
        type: "error",
        text: messageFromError(err, "No se pudo guardar la historia clínica")
      });
    }
  };

  const loadExistingHistory = async () => {
    setStatus({ type: "", text: "" });

    if (!history.id_cita) {
      setStatus({
        type: "error",
        text: "Selecciona una cita para consultar su historia clínica."
      });
      return;
    }

    try {
      const { data } = await historiaApi.getByCita(history.id_cita);

      setSavedHistory(data);
      setHistory({
        id_cita: String(history.id_cita),
        diagnostico: data.diagnostico || "",
        tratamiento: data.tratamiento || "",
        notas_medicas: data.notas_medicas || ""
      });

      if (data.id) {
        setRecipe((current) => ({ ...current, id_historia: String(data.id) }));
      }

      setStatus({ type: "success", text: "Historia clínica cargada correctamente." });
    } catch (err) {
      setStatus({
        type: "error",
        text: messageFromError(err, "Todavía no existe una historia clínica para esa cita")
      });
    }
  };

  const validateRecipe = () => {
    if (!recipe.id_historia) return "Primero crea o carga una historia clínica para obtener su ID.";
    if (!recipe.archivo) return "Selecciona un archivo PDF.";
    if (recipe.archivo.type !== "application/pdf") return "Solo se permite subir archivos PDF.";
    if (fileSizeMb(recipe.archivo) > 8) return "El PDF no debe superar los 8 MB.";

    return "";
  };

  const uploadRecipe = async (event) => {
    event.preventDefault();
    setStatus({ type: "", text: "" });

    const validation = validateRecipe();
    if (validation) {
      setStatus({ type: "error", text: validation });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id_historia", recipe.id_historia);
      formData.append("archivo", recipe.archivo);

      await recetaApi.upload(formData);

      setRecipe({ id_historia: recipe.id_historia, archivo: null });
      event.target.reset();
      setStatus({ type: "success", text: "Receta PDF subida correctamente." });
    } catch (err) {
      setStatus({
        type: "error",
        text: messageFromError(err, "No se pudo subir la receta")
      });
    }
  };

  const cancelAppointment = async (id) => {
    setStatus({ type: "", text: "" });

    try {
      await citaApi.cancel(id);
      setStatus({ type: "success", text: "Cita cancelada correctamente." });
      loadAppointments();
    } catch (err) {
      setStatus({
        type: "error",
        text: messageFromError(err, "No se pudo cancelar la cita")
      });
    }
  };

  return (
    <main className="page-content">
      <section className="hero-card doctor-hero compact-hero">
        <div>
          <p>Portal médico</p>
          <h1>Agenda clínica y atención médica</h1>
          <span>
            Registra disponibilidad, atiende citas asignadas, crea historias clínicas y sube recetas digitales asociadas a cada consulta.
          </span>
        </div>
        <div className="hero-badge">Médico</div>
      </section>

      <section className="stats-grid three">
        <StatCard
          label="Citas activas"
          value={activeAppointments.length}
          detail="Asignadas"
          icon={<CalendarClock size={22} />}
        />
        <StatCard
          label="Hoy"
          value={todayAppointments}
          detail="Consultas"
          icon={<ClipboardPlus size={22} />}
        />
        <StatCard
          label="Historia"
          value={savedHistory?.id ? `#${savedHistory.id}` : "Pendiente"}
          detail="Consulta seleccionada"
          icon={<FileText size={22} />}
        />
      </section>

      <Alert type={status.type}>{status.text}</Alert>

      <section className="content-grid two-columns medical-flow">
        <article className="panel-card">
          <div className="section-title">
            <div>
              <p>Agenda</p>
              <h2>Registrar disponibilidad</h2>
            </div>
          </div>

          <form onSubmit={saveAvailability} className="form-grid availability-form">
            <label>
              Fecha
              <input
                type="date"
                min={todayISO()}
                max={maxAvailabilityDate}
                value={availability.fecha}
                onChange={(e) => changeAvailabilityDate(e.target.value)}
                required
              />
            </label>

            <label>
              Hora inicio
              <input
                type="time"
                value={availability.hora_inicio}
                onChange={(e) => setAvailability({ ...availability, hora_inicio: e.target.value })}
                required
              />
            </label>

            <label>
              Hora fin
              <input
                type="time"
                value={availability.hora_fin}
                onChange={(e) => setAvailability({ ...availability, hora_fin: e.target.value })}
                required
              />
            </label>

            <button className="primary-button full-row">Guardar disponibilidad</button>
          </form>

          {lastAvailability && (
            <div className="success-summary">
              <b>Última disponibilidad guardada</b>
              <span>{formatDate(lastAvailability.fecha)}</span>
              <strong>
                {lastAvailability.hora_inicio} - {lastAvailability.hora_fin}
              </strong>
            </div>
          )}

          <div className="helper-card">
            Puedes registrar varios días. Cada guardado crea un bloque de atención distinto para tu usuario médico.
          </div>
        </article>

        <article className="panel-card action-panel">
          <div className="section-title">
            <div>
              <p>Consulta seleccionada</p>
              <h2>{selectedAppointment ? `Cita #${selectedAppointment.id}` : "Sin cita seleccionada"}</h2>
            </div>
          </div>

          {selectedAppointment ? (
            <div className="selected-summary">
              <span>{formatDate(selectedAppointment.fecha)}</span>
              <strong>{selectedAppointment.hora || "Sin hora"}</strong>
              <small>{statusLabel(selectedAppointment.estado)}</small>
              <Link to={`/chat/${selectedAppointment.id}`} className="secondary-button block-link">
                <MessageCircle size={17} /> Abrir chat
              </Link>
            </div>
          ) : (
            <EmptyState
              title="Selecciona una cita"
              text="Usa el botón “Atender” en la tabla de citas para llenar la historia clínica sin escribir IDs manualmente."
            />
          )}
        </article>
      </section>

      <section className="panel-card">
        <div className="section-title">
          <div>
            <p>Consulta médica</p>
            <h2>Crear historia clínica</h2>
          </div>

          <button className="ghost-button" type="button" onClick={loadExistingHistory}>
            <RefreshCw size={16} /> Cargar historia
          </button>
        </div>

        <form onSubmit={saveHistory} className="form-grid clinical-form">
          <label>
            Cita
            <select
              value={history.id_cita}
              onChange={(e) => {
                setHistory({ ...history, id_cita: e.target.value });
                setSavedHistory(null);
                setRecipe({ id_historia: "", archivo: null });
              }}
              required
            >
              <option value="">Seleccionar cita asignada</option>
              {appointments.map((cita) => (
                <option key={cita.id} value={cita.id}>
                  {appointmentTitle(cita)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Diagnóstico
            <textarea
              value={history.diagnostico}
              onChange={(e) => setHistory({ ...history, diagnostico: e.target.value })}
              placeholder="Ej. Diagnóstico principal de la consulta"
              required
            />
          </label>

          <label>
            Tratamiento
            <textarea
              value={history.tratamiento}
              onChange={(e) => setHistory({ ...history, tratamiento: e.target.value })}
              placeholder="Ej. Indicaciones médicas, medicamento o seguimiento"
              required
            />
          </label>

          <label>
            Notas médicas
            <textarea
              value={history.notas_medicas}
              onChange={(e) => setHistory({ ...history, notas_medicas: e.target.value })}
              placeholder="Observaciones adicionales"
            />
          </label>

          <button className="primary-button full-row">Guardar historia clínica</button>
        </form>
      </section>

      <section className="content-grid two-columns">
        <article className="panel-card">
          <div className="section-title">
            <div>
              <p>Receta digital</p>
              <h2>Subir PDF</h2>
            </div>
          </div>

          <form onSubmit={uploadRecipe} className="form-stack compact">
            <label>
              Historia clínica
              <input
                value={recipe.id_historia}
                onChange={(e) => setRecipe({ ...recipe, id_historia: e.target.value.replace(/\D/g, "") })}
                placeholder="Se completa al crear o cargar historia"
                required
              />
            </label>

            <label>
              Archivo PDF
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setRecipe({ ...recipe, archivo: e.target.files?.[0] || null })}
                required
              />
            </label>

            <button className="secondary-button">
              <FileUp size={17} /> Subir receta
            </button>
          </form>
        </article>

        <article className="panel-card">
          <div className="section-title">
            <div>
              <p>Flujo correcto</p>
              <h2>Atención de cita</h2>
            </div>
          </div>

          <div className="step-list">
            <span>1. El paciente agenda contigo.</span>
            <span>2. La cita aparece en tu lista.</span>
            <span>3. Presionas Atender y creas la historia.</span>
            <span>4. Subes la receta con el ID de historia.</span>
          </div>
        </article>
      </section>

      <section className="panel-card">
        <div className="section-title">
          <div>
            <p>Agenda</p>
            <h2>Mis citas asignadas</h2>
          </div>

          {loading && <span className="soft-label">Cargando...</span>}
        </div>

        {appointments.length === 0 ? (
          <EmptyState
            title="No hay citas"
            text="Cuando un paciente te seleccione, sus citas aparecerán aquí."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Paciente</th>
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
                    <td>Paciente #{cita.id_paciente}</td>
                    <td>{formatDate(cita.fecha)}</td>
                    <td>{cita.hora}</td>
                    <td>
                      <span className={`status ${cita.estado}`}>
                        {statusLabel(cita.estado)}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="secondary-button small"
                        onClick={() => selectAppointmentForHistory(cita)}
                      >
                        Atender
                      </button>

                      <Link to={`/chat/${cita.id}`} className="icon-link">
                        <MessageCircle size={16} /> Chat
                      </Link>

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
    </main>
  );
}