import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Circle as XCircle } from 'lucide-react-native';

interface AttendanceStatusCardProps {
  status: 'Present' | 'Late' | 'Absent';
  checkInTime: string;
  message: string;
}

export default function AttendanceStatusCard({ 
  status, 
  checkInTime, 
  message 
}: AttendanceStatusCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'Present':
        return {
          icon: CheckCircle,
          color: '#10b981',
          backgroundColor: '#d1fae5',
          textColor: '#065f46',
        };
      case 'Late':
        return {
          icon: AlertCircle,
          color: '#f59e0b',
          backgroundColor: '#fef3c7',
          textColor: '#92400e',
        };
      case 'Absent':
        return {
          icon: XCircle,
          color: '#ef4444',
          backgroundColor: '#fee2e2',
          textColor: '#991b1b',
        };
      default:
        return {
          icon: Clock,
          color: '#6b7280',
          backgroundColor: '#f3f4f6',
          textColor: '#374151',
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <View style={styles.header}>
        <StatusIcon size={24} color={config.color} />
        <Text style={[styles.status, { color: config.textColor }]}>
          {status.toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.details}>
        <View style={styles.timeContainer}>
          <Clock size={16} color={config.textColor} />
          <Text style={[styles.time, { color: config.textColor }]}>
            Check-in: {checkInTime}
          </Text>
        </View>
        
        <Text style={[styles.message, { color: config.textColor }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  status: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  details: {
    gap: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});