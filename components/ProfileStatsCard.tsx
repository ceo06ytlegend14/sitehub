import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, Calendar, Clock, Target } from 'lucide-react-native';

interface ProfileStatsCardProps {
  period: 'week' | 'month' | 'allTime';
  stats: {
    present: number;
    late: number;
    absent: number;
    total: number;
    percentage: number;
  };
  onPress?: () => void;
}

export default function ProfileStatsCard({ period, stats, onPress }: ProfileStatsCardProps) {
  const getPeriodLabel = () => {
    switch (period) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'allTime': return 'All Time';
      default: return period;
    }
  };

  const getPeriodIcon = () => {
    switch (period) {
      case 'week': return Calendar;
      case 'month': return Clock;
      case 'allTime': return Target;
      default: return TrendingUp;
    }
  };

  const getPercentageColor = () => {
    if (stats.percentage >= 95) return '#10b981';
    if (stats.percentage >= 85) return '#f59e0b';
    return '#ef4444';
  };

  const PeriodIcon = getPeriodIcon();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={styles.header}>
        <PeriodIcon size={20} color="#2563eb" />
        <Text style={styles.period}>{getPeriodLabel()}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={[styles.percentage, { color: getPercentageColor() }]}>
          {stats.percentage}%
        </Text>
        
        <View style={styles.breakdown}>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.statText}>{stats.present} Present</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.statText}>{stats.late} Late</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.statText}>{stats.absent} Absent</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  period: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  statsContainer: {
    alignItems: 'center',
  },
  percentage: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  breakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});