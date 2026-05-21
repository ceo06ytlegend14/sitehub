import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput 
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, TrendingUp, Clock, MapPin, Bell, CircleUser as UserCircle } from 'lucide-react-native';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationBadge from '@/components/NotificationBadge';
import { calculateAttendanceStats } from '@/utils/attendanceUtils';
import { useAuth } from '@/contexts/AuthContext';

interface AttendanceRecord {
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'Present' | 'Late' | 'Absent' | 'WeekOff' | 'Holiday';
  location: string;
}

export default function SummaryScreen() {
  const { unreadCount, adminUnreadCount, userUnreadCount } = useNotifications();
  const { user } = useAuth();

  // Use role-specific unread count
  const currentUnreadCount = user?.role === 'admin' ? adminUnreadCount : userUnreadCount;
  const [fromDate, setFromDate] = useState('01-01-2025');
  const [toDate, setToDate] = useState('01-19-2025');

  // Mock attendance data with realistic times and late entries
  const attendanceData: AttendanceRecord[] = [
    { date: '01-01-2025', checkInTime: '08:55', checkOutTime: '17:30', status: 'Present', location: 'Main Entrance' },
    { date: '01-02-2025', checkInTime: '09:20', checkOutTime: '17:45', status: 'Late', location: 'Main Entrance' },
    { date: '01-03-2025', checkInTime: '08:45', checkOutTime: '17:15', status: 'Present', location: 'Main Entrance' },
    { date: '01-04-2025', checkInTime: '00:00', checkOutTime: '00:00', status: 'WeekOff', location: '-' },
    { date: '01-05-2025', checkInTime: '00:00', checkOutTime: '00:00', status: 'WeekOff', location: '-' },
    { date: '01-06-2025', checkInTime: '09:10', checkOutTime: '17:20', status: 'Late', location: 'Side Entrance' },
    { date: '01-07-2025', checkInTime: '08:50', checkOutTime: '17:35', status: 'Present', location: 'Main Entrance' },
    { date: '01-08-2025', checkInTime: '08:40', checkOutTime: '17:25', status: 'Present', location: 'Main Entrance' },
    { date: '01-09-2025', checkInTime: '09:25', checkOutTime: '17:40', status: 'Late', location: 'Main Entrance' },
    { date: '01-10-2025', checkInTime: '08:55', checkOutTime: '17:30', status: 'Present', location: 'Main Entrance' },
    { date: '01-11-2025', checkInTime: '00:00', checkOutTime: '00:00', status: 'WeekOff', location: '-' },
    { date: '01-12-2025', checkInTime: '00:00', checkOutTime: '00:00', status: 'WeekOff', location: '-' },
    { date: '01-13-2025', checkInTime: '08:45', checkOutTime: '17:15', status: 'Present', location: 'Main Entrance' },
    { date: '01-14-2025', checkInTime: '09:30', checkOutTime: '17:50', status: 'Late', location: 'Side Entrance' },
    { date: '01-15-2025', checkInTime: '00:00', checkOutTime: '00:00', status: 'Holiday', location: '-' },
    { date: '01-16-2025', checkInTime: '08:35', checkOutTime: '17:20', status: 'Present', location: 'Main Entrance' },
    { date: '01-17-2025', checkInTime: '08:50', checkOutTime: '17:30', status: 'Present', location: 'Main Entrance' },
    { date: '01-18-2025', checkInTime: '00:00', checkOutTime: '00:00', status: 'WeekOff', location: '-' },
    { date: '01-19-2025', checkInTime: '09:15', checkOutTime: '17:35', status: 'Late', location: 'Main Entrance' },
  ];

  const stats = calculateAttendanceStats(attendanceData.map(record => ({
    id: record.date,
    userId: 'user123',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    date: record.date,
    checkInTime: record.checkInTime,
    checkOutTime: record.checkOutTime,
    status: record.status,
    qrCodeData: '',
    createdAt: '',
    updatedAt: '',
  })));

  const handleSearch = () => {
    console.log(`Searching attendance from ${fromDate} to ${toDate}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return '#10b981';
      case 'Late': return '#f59e0b';
      case 'Absent': return '#ef4444';
      case 'WeekOff': return '#6b7280';
      case 'Holiday': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return '✓';
      case 'Late': return '⚠';
      case 'Absent': return '✗';
      case 'WeekOff': return '📅';
      case 'Holiday': return '🎉';
      default: return '-';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Attendance Summary</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={24} color="#ffffff" />
            <NotificationBadge count={currentUnreadCount} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <UserCircle size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.dateFilter}>
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>From Date</Text>
            <TextInput
              style={styles.dateInput}
              value={fromDate}
              onChangeText={setFromDate}
              placeholder="MM-DD-YYYY"
            />
          </View>
          
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>To Date</Text>
            <TextInput
              style={styles.dateInput}
              value={toDate}
              onChangeText={setToDate}
              placeholder="MM-DD-YYYY"
            />
          </View>
          
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>SEARCH</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <TrendingUp size={20} color="#ffffff" />
            <Text style={styles.statsTitle}>Attendance Statistics</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.present}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.late}</Text>
              <Text style={styles.statLabel}>Late</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.absent}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.percentage}%</Text>
              <Text style={styles.statLabel}>Rate</Text>
            </View>
          </View>
        </View>

        <View style={styles.recordsHeader}>
          <Text style={styles.recordsTitle}>Attendance Records</Text>
          <Text style={styles.recordsCount}>{attendanceData.length} entries</Text>
        </View>

        <View style={styles.recordsList}>
          {attendanceData.map((record, index) => (
            <View key={index} style={styles.recordItem}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>{record.date}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) }]}>
                  <Text style={styles.statusText}>
                    {getStatusIcon(record.status)} {record.status}
                  </Text>
                </View>
              </View>
              
              {record.status !== 'WeekOff' && record.status !== 'Holiday' && record.status !== 'Absent' && (
                <View style={styles.recordDetails}>
                  <View style={styles.timeInfo}>
                    <Clock size={14} color="#6b7280" />
                    <Text style={styles.timeText}>
                      In: {record.checkInTime} | Out: {record.checkOutTime || 'Not recorded'}
                    </Text>
                  </View>
                  <View style={styles.locationInfo}>
                    <MapPin size={14} color="#6b7280" />
                    <Text style={styles.locationText}>{record.location}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>AttendanceApp</Text>
        <Text style={styles.footerCopyright}>© 2025 Mahaka Solutions.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563eb',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1d4ed8',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    position: 'relative',
    padding: 4,
    borderRadius: 8,
    borderRadius: 24,
  },
  content: {
    flex: 1,
    backgroundColor: '#2563eb',
  },
  contentContainer: {
    padding: 16,
  },
  dateFilter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
    gap: 8,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateInput: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#374151',
    height: 36,
    fontWeight: '500',
  },
  searchButton: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    height: 36,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: '#93c5fd',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordsTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  recordsCount: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '500',
  },
  recordsList: {
    gap: 8,
  },
  recordItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordDate: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  recordDetails: {
    gap: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e40af',
    alignItems: 'center',
  },
  footerText: {
    color: '#ffffff',
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  footerCopyright: {
    color: '#ffffff',
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});