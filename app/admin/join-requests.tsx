import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { ArrowLeft, UserPlus, CircleCheck as CheckCircle, Circle as XCircle, Clock, Users, Mail, Shield, User } from 'lucide-react-native';
import { GroupJoinRequest } from '@/types/groups';
import { isAdminRole } from '@/utils/authz';
import { FirebaseService } from '@/services/firebaseService';

export default function JoinRequestsScreen() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Redirect if not admin
  React.useEffect(() => {
    if (!user || !isAdminRole(user.role)) {
      router.replace('/(tabs)/');
    }
  }, [user]);

  const [joinRequests, setJoinRequests] = useState<GroupJoinRequest[]>([]);

  React.useEffect(() => {
    if (!user || !isAdminRole(user.role)) return;
    const unsub = FirebaseService.subscribeJoinRequests(user.id, setJoinRequests);
    return unsub;
  }, [user?.id, user?.role]);

  const filteredRequests = selectedFilter === 'all' 
    ? joinRequests 
    : joinRequests.filter(req => req.status === selectedFilter);

  const pendingCount = joinRequests.filter(req => req.status === 'pending').length;

  const handleApproveRequest = (request: GroupJoinRequest) => {
    Alert.alert(
      'Approve Join Request',
      `Approve ${request.userName} to join ${request.groupName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            FirebaseService.processJoinRequest(request.id, 'approved', user?.id || 'system').catch((error) =>
              Alert.alert('Error', (error as Error).message)
            );

            // Add notification for admin
            addNotification({
              type: 'user_invite',
              targetAudience: 'admin',
              title: 'Join Request Approved',
              message: `${request.userName} has been approved to join ${request.groupName}`,
              isRead: false,
              priority: 'medium',
              metadata: {
                inviteId: request.id,
                userName: request.userName,
                userEmail: request.userEmail,
                organizationName: request.groupName,
                status: 'approved',
                role: 'user',
                requestedAt: request.requestedAt,
              },
            });

            Alert.alert('Success', `${request.userName} has been approved to join the group`);
          },
        },
      ]
    );
  };

  const handleRejectRequest = (request: GroupJoinRequest) => {
    Alert.alert(
      'Reject Join Request',
      `Reject ${request.userName}'s request to join ${request.groupName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            FirebaseService.processJoinRequest(request.id, 'rejected', user?.id || 'system', 'Request declined by admin').catch((error) =>
              Alert.alert('Error', (error as Error).message)
            );

            // Add notification for admin
            addNotification({
              type: 'user_invite',
              targetAudience: 'admin',
              title: 'Join Request Rejected',
              message: `${request.userName}'s request to join ${request.groupName} was rejected`,
              isRead: false,
              priority: 'low',
              metadata: {
                inviteId: request.id,
                userName: request.userName,
                userEmail: request.userEmail,
                organizationName: request.groupName,
                status: 'declined',
                role: 'user',
                requestedAt: request.requestedAt,
              },
            });

            Alert.alert('Request Rejected', `${request.userName}'s request has been rejected`);
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      default: return User;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!user || !isAdminRole(user.role)) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join Requests</Text>
        <View style={styles.headerRight}>
          {pendingCount > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {[
          { key: 'pending', label: 'Pending', count: joinRequests.filter(r => r.status === 'pending').length },
          { key: 'approved', label: 'Approved', count: joinRequests.filter(r => r.status === 'approved').length },
          { key: 'rejected', label: 'Rejected', count: joinRequests.filter(r => r.status === 'rejected').length },
          { key: 'all', label: 'All', count: joinRequests.length },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && styles.filterTabActive
            ]}
            onPress={() => setSelectedFilter(filter.key as any)}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === filter.key && styles.filterTabTextActive
            ]}>
              {filter.label} ({filter.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
        {filteredRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <UserPlus size={48} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No Join Requests</Text>
            <Text style={styles.emptyStateMessage}>
              {selectedFilter === 'pending' 
                ? 'No pending join requests at the moment'
                : `No ${selectedFilter} join requests found`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.requestsList}>
            {filteredRequests.map((request) => {
              const StatusIcon = getStatusIcon(request.status);
              const statusColor = getStatusColor(request.status);

              return (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestUserName}>{request.userName}</Text>
                      <View style={styles.requestDetails}>
                        <Mail size={14} color="#6b7280" />
                        <Text style={styles.requestDetailText}>{request.userEmail}</Text>
                      </View>
                      <View style={styles.requestDetails}>
                        <User size={14} color="#6b7280" />
                        <Text style={styles.requestDetailText}>{request.employeeId}</Text>
                      </View>
                      <View style={styles.requestDetails}>
                        <Users size={14} color="#6b7280" />
                        <Text style={styles.requestDetailText}>{request.groupName}</Text>
                      </View>
                    </View>

                    <View style={styles.requestStatus}>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <StatusIcon size={14} color="#ffffff" />
                        <Text style={styles.statusText}>{request.status.toUpperCase()}</Text>
                      </View>
                      <Text style={styles.requestTime}>
                        {formatTimeAgo(request.requestedAt)}
                      </Text>
                    </View>
                  </View>

                  {request.status === 'pending' && (
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={styles.approveButton}
                        onPress={() => handleApproveRequest(request)}
                      >
                        <CheckCircle size={16} color="#ffffff" />
                        <Text style={styles.approveButtonText}>Approve</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleRejectRequest(request)}
                      >
                        <XCircle size={16} color="#ffffff" />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {request.status === 'approved' && request.processedAt && (
                    <View style={styles.processedInfo}>
                      <Text style={styles.processedText}>
                        Approved {formatTimeAgo(request.processedAt)}
                      </Text>
                    </View>
                  )}

                  {request.status === 'rejected' && request.adminMessage && (
                    <View style={styles.processedInfo}>
                      <Text style={styles.processedText}>
                        Rejected: {request.adminMessage}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
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
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  pendingBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  pendingBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  filterTabActive: {
    backgroundColor: '#2563eb',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  requestsList: {
    padding: 16,
    gap: 12,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
    marginRight: 12,
  },
  requestUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  requestDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  requestDetailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  requestStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  requestTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 6,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 6,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  processedInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  processedText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
