import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { ArrowLeft, Bell, Search, Filter, Calendar, Clock, CircleAlert as AlertCircle, Trash2, CheckCheck, MoveHorizontal as MoreHorizontal, Settings, Sparkles } from 'lucide-react-native';
import NotificationItem from '@/components/NotificationItem';
import NotificationBadge from '@/components/NotificationBadge';
import EmptyNotificationsState from '@/components/EmptyNotificationsState';
import { toNotificationAudience } from '@/utils/authz';
import { AppNotification } from '@/types/notifications';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { 
    notifications, 
    adminNotifications, 
    userNotifications, 
    unreadCount,
    adminUnreadCount,
    userUnreadCount,
    markAllAsRead, 
    clearAllNotifications,
    getNotificationsByDateRange,
    getNotificationsByType
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'month' | 'missed' | 'upcoming'>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Use role-specific notifications and unread count
  const audience = toNotificationAudience(user?.role);
  const currentNotifications: AppNotification[] = (audience === 'admin' ? adminNotifications : userNotifications) as AppNotification[];
  const currentUnreadCount = audience === 'admin' ? adminUnreadCount : userUnreadCount;

  const getFilteredNotifications = () => {
    let filtered = currentNotifications;

    // Apply date-based filtering
    switch (selectedFilter) {
      case 'today':
        filtered = getNotificationsByDateRange('today', audience) as AppNotification[];
        break;
      case 'week':
        filtered = getNotificationsByDateRange('week', audience) as AppNotification[];
        break;
      case 'month':
        filtered = getNotificationsByDateRange('month', audience) as AppNotification[];
        break;
      case 'missed':
        // Show only attendance notifications with error/absent status
        filtered = currentNotifications.filter(notif => {
          if (notif.type !== 'attendance') return false;
          const status = notif.metadata?.status;
          return status === 'absent' || status === 'error' || status === 'invalid_qr' || (notif.metadata as any)?.missedCheckIn;
        });
        break;
      case 'upcoming':
        // Show event notifications for future events
        filtered = currentNotifications.filter(notif => {
          if (notif.type !== 'event') return false;
          const eventDate = notif.metadata?.eventDate;
          if (!eventDate) return false;
          return new Date(eventDate) > new Date();
        });
        break;
      default:
        // 'all' - no date filtering
        break;
    }

    // Apply search filtering
    if (searchQuery) {
      filtered = filtered.filter(notif =>
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const filteredNotifications = getFilteredNotifications();

  const getFilterLabel = () => {
    switch (selectedFilter) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'missed': return 'Missed Only';
      case 'upcoming': return 'Upcoming';
      default: return 'All';
    }
  };

  const getFilterCount = (filter: typeof selectedFilter) => {
    switch (filter) {
      case 'today':
        return getNotificationsByDateRange('today', audience).length;
      case 'week':
        return getNotificationsByDateRange('week', audience).length;
      case 'month':
        return getNotificationsByDateRange('month', audience).length;
      case 'missed':
        return currentNotifications.filter(notif => {
          if (notif.type !== 'attendance') return false;
          const status = notif.metadata?.status;
          return status === 'absent' || status === 'error' || status === 'invalid_qr' || (notif.metadata as any)?.missedCheckIn;
        }).length;
      case 'upcoming':
        return currentNotifications.filter(notif => {
          if (notif.type !== 'event') return false;
          const eventDate = notif.metadata?.eventDate;
          if (!eventDate) return false;
          return new Date(eventDate) > new Date();
        }).length;
      default:
        return currentNotifications.length;
    }
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mark All Read', 
          onPress: () => markAllAsRead(audience)
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'This will permanently delete all notifications. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => clearAllNotifications(audience)
        },
      ]
    );
  };

  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filter Notifications</Text>
          <TouchableOpacity onPress={() => setShowFilterModal(false)}>
            <Text style={styles.modalCloseText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.filterOptions}>
            {[
              { key: 'all', label: '📋 All Notifications', icon: '📋' },
              { key: 'today', label: '📅 Today', icon: '📅' },
              { key: 'week', label: '📆 This Week', icon: '📆' },
              { key: 'month', label: '📈 This Month', icon: '📈' },
              { key: 'missed', label: '❗ Missed Only', icon: '❗' },
              { key: 'upcoming', label: '🗓️ Upcoming', icon: '🗓️' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  selectedFilter === option.key && styles.filterOptionActive
                ]}
                onPress={() => {
                  setSelectedFilter(option.key as any);
                  setShowFilterModal(false);
                }}
              >
                <View style={styles.filterOptionContent}>
                  <Text style={styles.filterOptionIcon}>{option.icon}</Text>
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilter === option.key && styles.filterOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </View>
                <View style={styles.filterOptionRight}>
                  <Text style={[
                    styles.filterOptionCount,
                    selectedFilter === option.key && styles.filterOptionCountActive
                  ]}>
                    {getFilterCount(option.key as any)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterDescription}>
            <Text style={styles.filterDescriptionTitle}>Filter Descriptions:</Text>
            <Text style={styles.filterDescriptionText}>
              📅 <Text style={styles.bold}>Today:</Text> Notifications from today only{'\n'}
              📆 <Text style={styles.bold}>This Week:</Text> Monday to Sunday of current week{'\n'}
              📈 <Text style={styles.bold}>This Month:</Text> All notifications from current month{'\n'}
              ❗ <Text style={styles.bold}>Missed Only:</Text> Attendance errors, absences, and missed check-ins{'\n'}
              🗓️ <Text style={styles.bold}>Upcoming:</Text> Future events requiring attendance
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => Alert.alert('Settings', 'Notification settings coming soon!')}
          >
            <Settings size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Status Banner */}
      <View style={styles.statusBanner}>
        <View style={styles.statusContent}>
          <Sparkles size={16} color="#3b82f6" />
          <Text style={styles.statusText}>
            {currentUnreadCount > 0 
              ? `${currentUnreadCount} new notification${currentUnreadCount !== 1 ? 's' : ''}`
              : 'All caught up! You\'re up to date'
            }
          </Text>
        </View>
        {currentUnreadCount > 0 && (
          <TouchableOpacity style={styles.customizeButton} onPress={() => setShowFilterModal(true)}>
            <Text style={styles.customizeButtonText}>Customize</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notifications..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            selectedFilter !== 'all' && styles.filterButtonActive
          ]}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={[
            styles.filterButtonText,
            selectedFilter !== 'all' && styles.filterButtonTextActive
          ]}>
            {getFilterLabel()}
          </Text>
          <Text style={[
            styles.filterCount,
            selectedFilter !== 'all' && styles.filterCountActive
          ]}>
            ({getFilterCount(selectedFilter)})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Bar */}
      {currentUnreadCount > 0 && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionButton} onPress={handleMarkAllAsRead}>
            <CheckCheck size={16} color="#2563eb" />
            <Text style={styles.actionButtonText}>Mark All Read</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleClearAll}>
            <Trash2 size={16} color="#ef4444" />
            <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content}>
        {filteredNotifications.length === 0 ? (
          <EmptyNotificationsState
            hasNotifications={currentNotifications.length > 0}
            onHistorical={() => Alert.alert('Historical Notifications', 'Historical notifications feature coming soon!')}
          />
        ) : (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={() => {
                  // Handle notification tap based on type
                  if (notification.type === 'attendance' && notification.metadata?.location) {
                    Alert.alert(
                      'Attendance Details',
                      `Location: ${notification.metadata.location}\n` +
                      `Time: ${notification.metadata.checkInTime || 'Not recorded'}\n` +
                      `Status: ${notification.metadata.status || 'Unknown'}`
                    );
                  } else if (notification.type === 'event' && notification.metadata?.eventId) {
                    Alert.alert(
                      'Event Details',
                      `Event: ${notification.metadata.eventName}\n` +
                      `Date: ${notification.metadata.eventDate}\n` +
                      `Time: ${notification.metadata.eventTime}\n` +
                      `Location: ${notification.metadata.location || 'TBD'}`
                    );
                  }
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <FilterModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
  },
  statusBanner: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  customizeButton: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  customizeButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  filterButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  filterCount: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  filterCountActive: {
    color: '#dbeafe',
  },
  actionBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  content: {
    flex: 1,
  },
  filterSummary: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  filterSummaryText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
    textAlign: 'center',
  },
  notificationsList: {
    backgroundColor: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  filterOptions: {
    padding: 16,
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterOptionActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  filterOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  filterOptionTextActive: {
    color: '#2563eb',
  },
  filterOptionRight: {
    alignItems: 'flex-end',
  },
  filterOptionCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    textAlign: 'center',
  },
  filterOptionCountActive: {
    color: '#ffffff',
    backgroundColor: '#2563eb',
  },
  filterDescription: {
    backgroundColor: '#f0f9ff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  filterDescriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  filterDescriptionText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
});
