import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Calendar, Download, Filter, TrendingUp, Users, Clock, CircleAlert as AlertCircle } from 'lucide-react-native';
import { isAdminRole } from '@/utils/authz';

export default function AttendanceReportsScreen() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    from: '2025-01-01',
    to: '2025-01-19',
  });
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Redirect if not admin
  React.useEffect(() => {
    if (!user || !isAdminRole(user.role)) {
      router.replace('/(tabs)/');
    }
  }, [user]);

  // Mock attendance data
  const attendanceData = [
    { id: '1', name: 'John Doe', employeeId: 'EMP001', date: '2025-01-19', status: 'Present', checkIn: '08:55', checkOut: '17:30' },
    { id: '2', name: 'Jane Smith', employeeId: 'EMP002', date: '2025-01-19', status: 'Late', checkIn: '09:20', checkOut: '17:45' },
    { id: '3', name: 'Mike Johnson', employeeId: 'EMP003', date: '2025-01-19', status: 'Absent', checkIn: '', checkOut: '' },
    { id: '4', name: 'John Doe', employeeId: 'EMP001', date: '2025-01-18', status: 'Present', checkIn: '08:45', checkOut: '17:15' },
    { id: '5', name: 'Jane Smith', employeeId: 'EMP002', date: '2025-01-18', status: 'Present', checkIn: '08:50', checkOut: '17:20' },
  ];

  const getFilteredData = () => {
    if (selectedFilter === 'all') return attendanceData;
    return attendanceData.filter(record => record.status.toLowerCase() === selectedFilter);
  };

  const getStats = () => {
    const total = attendanceData.length;
    const present = attendanceData.filter(r => r.status === 'Present').length;
    const late = attendanceData.filter(r => r.status === 'Late').length;
    const absent = attendanceData.filter(r => r.status === 'Absent').length;
    
    return { total, present, late, absent };
  };

  const handleExportReport = () => {
    const filteredData = getFilteredData();
    const stats = getStats();
    
    Alert.alert(
      'Export Attendance Report',
      `Export ${filteredData.length} records from ${dateRange.from} to ${dateRange.to}\n\nChoose format:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'CSV/Excel', 
          onPress: () => {
            // In production, this would generate and download the file
            Alert.alert(
              'Export Successful',
              `Attendance report exported!\n\nFile: attendance_${dateRange.from}_to_${dateRange.to}.xlsx\nRecords: ${filteredData.length}\nPresent: ${stats.present} | Late: ${stats.late} | Absent: ${stats.absent}`
            );
          }
        },
        { 
          text: 'PDF Report', 
          onPress: () => {
            Alert.alert(
              'PDF Generated',
              `Comprehensive PDF report created!\n\nIncludes:\n• Summary statistics\n• Individual records\n• Charts and graphs\n• Date range: ${dateRange.from} to ${dateRange.to}`
            );
          }
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return '#10b981';
      case 'Late': return '#f59e0b';
      case 'Absent': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const stats = getStats();
  const filteredData = getFilteredData();

  if (!user || !isAdminRole(user.role)) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Reports</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportReport}>
          <Download size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Date Range Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Date Range</Text>
          <View style={styles.dateInputs}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>From</Text>
              <TextInput
                style={styles.dateInput}
                value={dateRange.from}
                onChangeText={(text) => setDateRange(prev => ({ ...prev, from: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>To</Text>
              <TextInput
                style={styles.dateInput}
                value={dateRange.to}
                onChangeText={(text) => setDateRange(prev => ({ ...prev, to: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
        </View>

        {/* Status Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Filter by Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterButtons}>
            {['all', 'present', 'late', 'absent'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === filter && styles.filterButtonTextActive
                ]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={24} color="#2563eb" />
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Records</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#10b981" />
            <Text style={styles.statNumber}>{stats.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>{stats.late}</Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
          <View style={styles.statCard}>
            <AlertCircle size={24} color="#ef4444" />
            <Text style={styles.statNumber}>{stats.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
        </View>

        {/* Attendance Records */}
        <View style={styles.recordsSection}>
          <Text style={styles.recordsTitle}>
            Attendance Records ({filteredData.length})
          </Text>
          
          <View style={styles.recordsList}>
            {filteredData.map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View>
                    <Text style={styles.recordName}>{record.name}</Text>
                    <Text style={styles.recordId}>{record.employeeId}</Text>
                  </View>
                  <View style={styles.recordDate}>
                    <Calendar size={16} color="#6b7280" />
                    <Text style={styles.recordDateText}>{record.date}</Text>
                  </View>
                </View>
                
                <View style={styles.recordDetails}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(record.status) }
                  ]}>
                    <Text style={styles.statusText}>{record.status}</Text>
                  </View>
                  
                  {record.status !== 'Absent' && (
                    <View style={styles.timeInfo}>
                      <Text style={styles.timeText}>
                        In: {record.checkIn} | Out: {record.checkOut || 'Not recorded'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Real-time Updates Section */}
        <View style={styles.liveSection}>
          <Text style={styles.liveSectionTitle}>Live Attendance Today</Text>
          <Text style={styles.liveSectionSubtitle}>
            Real-time updates from office locations
          </Text>
          
          <View style={styles.liveStats}>
            <View style={styles.liveStatItem}>
              <Text style={styles.liveStatNumber}>12</Text>
              <Text style={styles.liveStatLabel}>Currently Present</Text>
            </View>
            <View style={styles.liveStatItem}>
              <Text style={styles.liveStatNumber}>3</Text>
              <Text style={styles.liveStatLabel}>Late Today</Text>
            </View>
            <View style={styles.liveStatItem}>
              <Text style={styles.liveStatNumber}>1</Text>
              <Text style={styles.liveStatLabel}>Absent</Text>
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
  exportButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  filterSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  dateInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#374151',
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  recordsSection: {
    margin: 16,
    marginTop: 8,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  recordsList: {
    gap: 12,
  },
  recordCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  recordId: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  recordDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordDateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  timeInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  liveSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 8,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  liveSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  liveSectionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
  },
  liveStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  liveStatItem: {
    alignItems: 'center',
  },
  liveStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
  },
  liveStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
});
