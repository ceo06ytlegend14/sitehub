import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { ArrowLeft, Users, QrCode, ChartBar as BarChart3, Settings, Bell, TrendingUp, Clock, MapPin, Shield, UserPlus, Calendar } from 'lucide-react-native';
import NotificationBadge from '@/components/NotificationBadge';
import { isAdminRole } from '@/utils/authz';

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const { adminUnreadCount } = useNotifications();

  // Redirect if not admin
  React.useEffect(() => {
    if (!user || !isAdminRole(user.role)) {
      router.replace('/(tabs)/');
    }
  }, [user]);

  // Mock dashboard stats
  const dashboardStats = {
    totalUsers: 45,
    presentToday: 38,
    lateToday: 4,
    absentToday: 3,
    totalGroups: 8,
    activeQRCodes: 12,
    pendingRequests: 6,
  };

  const quickActions = [
    {
      title: 'User Management',
      description: 'Add, edit, and manage users',
      icon: Users,
      color: '#3b82f6',
      onPress: () => router.push('/admin/users'),
    },
    {
      title: 'Group Management',
      description: 'Create and manage attendance groups',
      icon: UserPlus,
      color: '#10b981',
      onPress: () => router.push('/admin/groups'),
    },
    {
      title: 'QR Code Manager',
      description: 'Generate and manage QR codes',
      icon: QrCode,
      color: '#f59e0b',
      onPress: () => router.push('/admin/qr-codes'),
    },
    {
      title: 'Join Requests',
      description: 'Review pending group join requests',
      icon: Shield,
      color: '#ef4444',
      onPress: () => router.push('/admin/join-requests'),
      badge: dashboardStats.pendingRequests,
    },
    {
      title: 'Attendance Reports',
      description: 'View detailed attendance analytics',
      icon: BarChart3,
      color: '#8b5cf6',
      onPress: () => router.push('/admin/reports'),
    },
    {
      title: 'Live Monitoring',
      description: 'Real-time attendance tracking',
      icon: Clock,
      color: '#06b6d4',
      onPress: () => Alert.alert('Live Monitoring', 'Real-time monitoring dashboard coming soon!'),
    },
  ];

  if (!user || !isAdminRole(user.role)) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Bell size={24} color="#ffffff" />
          <NotificationBadge count={adminUnreadCount} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back, {user.name}!</Text>
          <Text style={styles.welcomeSubtitle}>
            Here's what's happening in your organization today
          </Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <TrendingUp size={24} color="#10b981" />
              <Text style={styles.statNumber}>{dashboardStats.presentToday}</Text>
              <Text style={styles.statLabel}>Present Today</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>{dashboardStats.lateToday}</Text>
              <Text style={styles.statLabel}>Late Today</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Users size={24} color="#3b82f6" />
              <Text style={styles.statNumber}>{dashboardStats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Shield size={24} color="#ef4444" />
              <Text style={styles.statNumber}>{dashboardStats.pendingRequests}</Text>
              <Text style={styles.statLabel}>Pending Requests</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsList}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={styles.actionContent}>
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                    <action.icon size={24} color={action.color} />
                    {action.badge && action.badge > 0 && (
                      <View style={styles.actionBadge}>
                        <Text style={styles.actionBadgeText}>{action.badge}</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDescription}>{action.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <UserPlus size={16} color="#10b981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Sarah Johnson joined Software Team</Text>
                <Text style={styles.activityTime}>5 minutes ago</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Clock size={16} color="#f59e0b" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Mike Wilson checked in late</Text>
                <Text style={styles.activityTime}>15 minutes ago</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <QrCode size={16} color="#3b82f6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>New QR code generated for Main Entrance</Text>
                <Text style={styles.activityTime}>1 hour ago</Text>
              </View>
            </View>
          </View>
        </View>

        {/* System Status */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>System Status</Text>
          
          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <View style={styles.statusIndicator} />
              <Text style={styles.statusText}>All systems operational</Text>
            </View>
            <View style={styles.statusDetails}>
              <Text style={styles.statusDetailText}>
                • Database: Online{'\n'}
                • QR Scanner: Functional{'\n'}
                • Notifications: Active{'\n'}
                • Last backup: 2 hours ago
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  actionsList: {
    gap: 8,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  actionBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  activitySection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  activityList: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  statusSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusDetails: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 12,
  },
  statusDetailText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
});
