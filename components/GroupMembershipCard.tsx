import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Users, Shield, Calendar, ChevronRight } from 'lucide-react-native';

interface GroupMembershipCardProps {
  group: {
    id: string;
    name: string;
    role: string;
    joinedAt: string;
    memberCount?: number;
    isActive?: boolean;
  };
  onPress?: () => void;
}

export default function GroupMembershipCard({ group, onPress }: GroupMembershipCardProps) {
  const getRoleColor = () => {
    switch (group.role) {
      case 'admin': return '#ef4444';
      case 'moderator': return '#f59e0b';
      case 'member': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRoleIcon = () => {
    switch (group.role) {
      case 'admin': return Shield;
      case 'moderator': return Shield;
      default: return Users;
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <TouchableOpacity 
      style={[styles.container, !group.isActive && styles.inactiveContainer]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{group.name}</Text>
            <View style={styles.roleContainer}>
              <RoleIcon size={14} color={getRoleColor()} />
              <Text style={[styles.roleText, { color: getRoleColor() }]}>
                {group.role.toUpperCase()}
              </Text>
            </View>
          </View>
          
          {onPress && <ChevronRight size={20} color="#9ca3af" />}
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Calendar size={12} color="#6b7280" />
            <Text style={styles.detailText}>
              Joined {new Date(group.joinedAt).toLocaleDateString()}
            </Text>
          </View>
          
          {group.memberCount && (
            <View style={styles.detailItem}>
              <Users size={12} color="#6b7280" />
              <Text style={styles.detailText}>
                {group.memberCount} members
              </Text>
            </View>
          )}
          
          {!group.isActive && (
            <View style={styles.inactiveIndicator}>
              <Text style={styles.inactiveText}>Inactive</Text>
            </View>
          )}
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  inactiveContainer: {
    backgroundColor: '#f8fafc',
    opacity: 0.7,
  },
  content: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  inactiveIndicator: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  inactiveText: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: '600',
  },
});