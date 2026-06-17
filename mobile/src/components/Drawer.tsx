import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getUser, logoutUser } from '../auth/session';
import { colors, radius, typography, gradients } from '../constants/theme';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.78;

interface DrawerProps {
  children: React.ReactNode;
}

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: 'view-dashboard', route: '/dashboard', roles: ['admin', 'medico', 'paciente'] },
  { label: 'Mi Cuenta', icon: 'account', route: '/profile', roles: ['admin', 'medico', 'paciente'] },
  { label: 'Buscar Médico', icon: 'magnify', route: '/medicos', roles: ['paciente'] },
  { label: 'Mis Citas', icon: 'calendar-check', route: '/citas', roles: ['medico', 'paciente'] },
  { label: 'Agendar Cita', icon: 'calendar-plus', route: '/agendar', roles: ['paciente'] },
  { label: 'Disponibilidad', icon: 'clock-outline', route: '/disponibilidad', roles: ['medico'] },
  { label: 'Chats', icon: 'chat-processing', route: '/chats', roles: ['medico', 'paciente'] },
  { label: 'Chats (Admin)', icon: 'shield-account', route: '/admin-chats', roles: ['admin'] },
  { label: 'Ver Médicos', icon: 'doctor', route: '/admin-medicos', roles: ['admin'] },
  { label: 'Especialidades', icon: 'hospital-building', route: '/admin-especialidades', roles: ['admin'] },
  { label: 'Citas Registradas', icon: 'clipboard-list', route: '/admin-citas', roles: ['admin'] },
  { label: 'Historial Clínico', icon: 'file-document-outline', route: '/historial', roles: ['medico', 'paciente'] },
];

export default function Drawer({ children }: DrawerProps) {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-DRAWER_WIDTH));
  const pathname = usePathname();

  useEffect(() => {
    getUser().then((u) => {
      if (!u) { router.replace('/login'); return; }
      setUser(u);
    });
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: open ? 0 : -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [open]);

  const toggle = () => setOpen(!open);
  const close = () => setOpen(false);

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/login');
  };

  const role = user?.rol || 'paciente';
  const filteredMenu = menuItems.filter((item) => item.roles.includes(role));

  const navigate = (route: string) => {
    close();
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {/* Overlay */}
      {open && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={close}>
          <View style={styles.overlayBg} />
        </TouchableOpacity>
      )}

      {/* Topbar with hamburger */}
      <LinearGradient colors={gradients.heroPatient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <TouchableOpacity onPress={toggle} style={styles.hamburger}>
          <MaterialCommunityIcons name="menu" size={28} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>MediConnect</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Drawer */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <LinearGradient colors={gradients.heroAdmin} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.drawerHeader}>
          <MaterialCommunityIcons name="account-circle" size={50} color={colors.white} />
          <Text style={styles.drawerName}>{user?.nombre || 'Usuario'}</Text>
          <Text style={styles.drawerRole}>{role.toUpperCase()}</Text>
        </LinearGradient>

        <ScrollView style={styles.drawerBody} contentContainerStyle={{ paddingBottom: 20 }}>
          {filteredMenu.map((item) => {
            const active = pathname === item.route || pathname.startsWith(item.route);
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.menuItem, active && styles.menuItemActive]}
                onPress={() => navigate(item.route)}
              >
                <MaterialCommunityIcons name={item.icon as any} size={22} color={active ? colors.primary : colors.text} />
                <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
  overlayBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  topbar: {
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl,
    zIndex: 5,
  },
  hamburger: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  topbarTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.black, color: colors.white },
  drawer: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: DRAWER_WIDTH, backgroundColor: colors.card,
    zIndex: 20, borderTopRightRadius: radius.xxl, borderBottomRightRadius: radius.xxl,
    shadowColor: '#0f2742', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
  },
  drawerHeader: {
    paddingTop: 60, paddingBottom: 28, paddingHorizontal: 24,
    alignItems: 'center', borderBottomRightRadius: radius.xl,
  },
  drawerName: { fontSize: typography.sizes.lg, fontWeight: typography.weights.black, color: colors.white, marginTop: 12 },
  drawerRole: { fontSize: typography.sizes.xs, fontWeight: typography.weights.extrabold, color: colors.white, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 },
  drawerBody: { flex: 1, paddingTop: 12 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 14, marginHorizontal: 12, marginVertical: 4,
    borderRadius: radius.md,
  },
  menuItemActive: { backgroundColor: colors.navActiveBg },
  menuLabel: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.text },
  menuLabelActive: { color: colors.primary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 24, paddingVertical: 18,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  logoutText: { fontSize: typography.sizes.base, fontWeight: typography.weights.black, color: colors.danger },
  content: { flex: 1, paddingTop: 8 },
});
