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
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { ArrowLeft, Plus, Users, QrCode, Settings, Eye, UserPlus, Calendar, Clock, MapPin, Shield, Trash2, CreditCard as Edit, Download } from 'lucide-react-native';
import { AttendanceGroup, GroupRules, GroupAttendanceQR } from '@/types/groups';
import { generateGroupInviteQR, generateGroupAttendanceQR, generateQuickAttendanceQRs } from '@/utils/groupQRGenerator';
import QRCodePreview from '@/components/QRCodePreview';
import { isAdminRole } from '@/utils/authz';
import { FirebaseService } from '@/services/firebaseService';

export default function GroupManagementScreen() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<AttendanceGroup | null>(null);
  const [selectedQRCode, setSelectedQRCode] = useState<any>(null);
  const [editingGroup, setEditingGroup] = useState<AttendanceGroup | null>(null);

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    maxMembers: '',
    validDays: 30,
    rules: {
      allowLateJoining: true,
      requireApproval: true,
      attendanceWindow: {
        startTime: '09:00',
        endTime: '17:00',
      },
      lateThresholdMinutes: 15,
      allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const,
    },
  });

  const [attendanceForm, setAttendanceForm] = useState({
    title: '',
    description: '',
    attendanceType: 'daily' as 'daily' | 'weekly' | 'monthly' | 'event',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    location: '',
    maxScans: '',
  });

  // Redirect if not admin
  React.useEffect(() => {
    if (!user || !isAdminRole(user.role)) {
      router.replace('/(tabs)/');
    }
  }, [user]);

  const [groups, setGroups] = useState<AttendanceGroup[]>([]);

  // Mock attendance QR codes for groups
  const [groupAttendanceQRs, setGroupAttendanceQRs] = useState<GroupAttendanceQR[]>([]);

  React.useEffect(() => {
    if (!user || !isAdminRole(user.role)) return;
    const unsub = FirebaseService.subscribeAdminGroups(user.id, setGroups);
    return unsub;
  }, [user?.id, user?.role]);

  const handleCreateGroup = async () => {
    if (!user || !groupForm.name || !groupForm.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const { group } = generateGroupInviteQR(
        groupForm.name,
        groupForm.description,
        user.id,
        user.name,
        groupForm.rules,
        groupForm.maxMembers ? parseInt(groupForm.maxMembers) : undefined,
        groupForm.validDays
      );

      const { id: _groupId, createdAt: _groupCreatedAt, updatedAt: _groupUpdatedAt, memberCount: _groupMemberCount, ...createPayload } = group;
      await FirebaseService.createGroup(createPayload);
      
      // Add notification for group creation
      addNotification({
        type: 'qr_management',
        targetAudience: 'admin',
        title: 'New Group Created',
        message: `Group "${group.name}" created with invite QR code`,
        isRead: false,
        priority: 'medium',
        metadata: {
          qrCodeId: group.id,
          qrCodeName: `Group Invite - ${group.name}`,
          qrCodeType: 'user_invite',
          usageCount: 0,
          status: 'active',
          alertType: 'usage_milestone',
        },
      });

      resetGroupForm();
      setShowCreateModal(false);
      Alert.alert('Success', `Group "${group.name}" created successfully! Share the invite QR code with potential members.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create group');
    }
  };

  const handleCreateAttendanceQR = async () => {
    if (!selectedGroup || !attendanceForm.title) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      const attendanceQR = generateGroupAttendanceQR(
        selectedGroup,
        attendanceForm.title,
        attendanceForm.description,
        attendanceForm.attendanceType,
        `${attendanceForm.validFrom}T${attendanceForm.startTime}:00`,
        `${attendanceForm.validUntil}T${attendanceForm.endTime}:00`,
        {
          startTime: attendanceForm.startTime,
          endTime: attendanceForm.endTime,
        },
        attendanceForm.location,
        attendanceForm.maxScans ? parseInt(attendanceForm.maxScans) : undefined
      );

      const { id: _qrId, createdAt: _qrCreatedAt, scanCount: _qrScanCount, ...qrPayload } = attendanceQR;
      const qrId = await FirebaseService.createQRSession(qrPayload);
      setGroupAttendanceQRs(prev => [{ ...attendanceQR, id: qrId }, ...prev]);
      
      // Add notification
      addNotification({
        type: 'qr_management',
        targetAudience: 'admin',
        title: 'Attendance QR Created',
        message: `New attendance QR "${attendanceQR.title}" created for ${selectedGroup.name}`,
        isRead: false,
        priority: 'medium',
        metadata: {
          qrCodeId: attendanceQR.id,
          qrCodeName: attendanceQR.title,
          qrCodeType: 'attendance',
          usageCount: 0,
          status: 'active',
          alertType: 'usage_milestone',
        },
      });

      resetAttendanceForm();
      setShowAttendanceModal(false);
      Alert.alert('Success', 'Attendance QR code created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create attendance QR code');
    }
  };

  const handleQuickAttendance = (group: AttendanceGroup, type: 'today' | 'this_week' | 'this_month') => {
    const qrCodes = generateQuickAttendanceQRs(group, type);
    setGroupAttendanceQRs(prev => [...prev, ...qrCodes]);
    
    Alert.alert(
      'Quick QR Created',
      `${type.replace('_', ' ')} attendance QR code created for ${group.name}`,
      [
        { text: 'OK' },
        { text: 'View QR', onPress: () => handlePreviewQR(qrCodes[0]) },
      ]
    );
  };

  const handlePreviewGroupInvite = (group: AttendanceGroup) => {
    const { qrData } = generateGroupInviteQR(
      group.name,
      group.description,
      group.adminId,
      group.adminName,
      group.rules,
      group.maxMembers
    );
    
    setSelectedQRCode({
      id: group.id,
      type: 'group_invite',
      name: `Group Invite - ${group.name}`,
      description: group.description,
      qrData: JSON.parse(qrData),
      isActive: group.isActive,
      usageCount: group.memberCount,
      maxUsage: group.maxMembers,
      createdBy: group.adminId,
      createdAt: group.createdAt,
    });
    setShowPreviewModal(true);
  };

  const handlePreviewQR = (qr: GroupAttendanceQR) => {
    setSelectedQRCode({
      id: qr.id,
      type: 'group_attendance',
      name: qr.title,
      description: qr.description,
      qrData: qr.qrData,
      isActive: qr.isActive,
      usageCount: qr.scanCount,
      maxUsage: qr.maxScans,
      createdBy: qr.createdBy,
      createdAt: qr.createdAt,
    });
    setShowPreviewModal(true);
  };

  const resetGroupForm = () => {
    setGroupForm({
      name: '',
      description: '',
      maxMembers: '',
      validDays: 30,
      rules: {
        allowLateJoining: true,
        requireApproval: true,
        attendanceWindow: { startTime: '09:00', endTime: '17:00' },
        lateThresholdMinutes: 15,
        allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      },
    });
  };

  const resetAttendanceForm = () => {
    setAttendanceForm({
      title: '',
      description: '',
      attendanceType: 'daily',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      location: '',
      maxScans: '',
    });
  };

  const handleManageGroupMembers = async (group: AttendanceGroup) => {
    const members = await FirebaseService.getGroupMembers(group.id);
    Alert.alert(
      'Manage Group Members',
      `Group: ${group.name}\nMembers: ${members.length}${group.maxMembers ? `/${group.maxMembers}` : ''}\n\nChoose an action:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'View Members',
          onPress: () => Alert.alert('Members', members.map((m) => `${m.userName} (${m.employeeId})`).join('\n') || 'No members yet'),
        },
        {
          text: 'Export List',
          onPress: () => Alert.alert('Export CSV', ['name,email,employeeId,status', ...members.map((m) => `${m.userName},${m.userEmail},${m.employeeId},${m.status}`)].join('\n')),
        },
        { text: 'Group Settings', onPress: () => Alert.alert('Settings', 'Use Edit action from group card to update settings.') },
      ]
    );
  };

  const getGroupAttendanceQRs = (groupId: string) => {
    return groupAttendanceQRs.filter(qr => qr.groupId === groupId);
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
        <Text style={styles.headerTitle}>Group Management</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={24} color="#2563eb" />
            <Text style={styles.statNumber}>{groups.length}</Text>
            <Text style={styles.statLabel}>Total Groups</Text>
          </View>
          <View style={styles.statCard}>
            <Shield size={24} color="#10b981" />
            <Text style={styles.statNumber}>
              {groups.filter(g => g.isActive).length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <UserPlus size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>
              {groups.reduce((sum, g) => sum + g.memberCount, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Members</Text>
          </View>
        </View>

        {/* Groups List */}
        <View style={styles.groupsSection}>
          <Text style={styles.sectionTitle}>Attendance Groups</Text>
          
          {groups.map((group) => (
            <View key={group.id} style={styles.groupCard}>
              <View style={styles.groupHeader}>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupDescription}>{group.description}</Text>
                  <View style={styles.groupStats}>
                    <Text style={styles.groupStatText}>
                      Members: {group.memberCount}{group.maxMembers ? `/${group.maxMembers}` : ''}
                    </Text>
                    <Text style={styles.groupStatText}>
                      Window: {group.rules.attendanceWindow.startTime} - {group.rules.attendanceWindow.endTime}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.groupActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handlePreviewGroupInvite(group)}
                  >
                    <QrCode size={16} color="#2563eb" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setSelectedGroup(group);
                      setShowAttendanceModal(true);
                    }}
                  >
                    <Calendar size={16} color="#10b981" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert('Edit Group', 'Edit functionality coming soon')}
                  >
                    <Edit size={16} color="#f59e0b" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleManageGroupMembers(group)}
                  >
                    <Users size={16} color="#8b5cf6" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => handleQuickAttendance(group, 'today')}
                >
                  <Text style={styles.quickActionText}>Today's QR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => handleQuickAttendance(group, 'this_week')}
                >
                  <Text style={styles.quickActionText}>Week QR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => handleQuickAttendance(group, 'this_month')}
                >
                  <Text style={styles.quickActionText}>Month QR</Text>
                </TouchableOpacity>
              </View>

              {/* Group Attendance QRs */}
              {getGroupAttendanceQRs(group.id).length > 0 && (
                <View style={styles.attendanceQRs}>
                  <Text style={styles.attendanceQRsTitle}>Recent Attendance QRs:</Text>
                  {getGroupAttendanceQRs(group.id).slice(0, 3).map((qr) => (
                    <TouchableOpacity
                      key={qr.id}
                      style={styles.attendanceQRItem}
                      onPress={() => handlePreviewQR(qr)}
                    >
                      <View style={styles.qrItemInfo}>
                        <Text style={styles.qrItemTitle}>{qr.title}</Text>
                        <Text style={styles.qrItemDetails}>
                          {qr.attendanceType} • Scans: {qr.scanCount}
                          {qr.maxScans ? `/${qr.maxScans}` : ''}
                        </Text>
                      </View>
                      <Eye size={16} color="#6b7280" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Group-Based Attendance System</Text>
          <Text style={styles.instructionsText}>
            🏢 <Text style={styles.bold}>Step 1:</Text> Create attendance groups for different teams/departments{'\n'}
            📱 <Text style={styles.bold}>Step 2:</Text> Share group invite QR codes with team members{'\n'}
            ✅ <Text style={styles.bold}>Step 3:</Text> Approve join requests from users{'\n'}
            📅 <Text style={styles.bold}>Step 4:</Text> Generate daily/weekly/monthly attendance QR codes{'\n'}
            📊 <Text style={styles.bold}>Step 5:</Text> Monitor attendance and generate reports{'\n\n'}
            <Text style={styles.bold}>Benefits:</Text>{'\n'}
            • Secure group membership with admin approval{'\n'}
            • Flexible attendance windows per group{'\n'}
            • No GPS required - works anywhere{'\n'}
            • Detailed tracking and analytics
          </Text>
        </View>
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Group</Text>
            <TouchableOpacity
              onPress={() => {
                setShowCreateModal(false);
                resetGroupForm();
              }}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalForm}>
              <TextInput
                style={styles.modalInput}
                placeholder="Group Name *"
                value={groupForm.name}
                onChangeText={(text) => setGroupForm(prev => ({ ...prev, name: text }))}
              />
              
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="Group Description *"
                value={groupForm.description}
                onChangeText={(text) => setGroupForm(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Max Members (optional)"
                value={groupForm.maxMembers}
                onChangeText={(text) => setGroupForm(prev => ({ ...prev, maxMembers: text }))}
                keyboardType="numeric"
              />

              <View style={styles.timeInputs}>
                <View style={styles.timeInputContainer}>
                  <Text style={styles.timeLabel}>Attendance Start</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="09:00"
                    value={groupForm.rules.attendanceWindow.startTime}
                    onChangeText={(text) => setGroupForm(prev => ({
                      ...prev,
                      rules: {
                        ...prev.rules,
                        attendanceWindow: { ...prev.rules.attendanceWindow, startTime: text }
                      }
                    }))}
                  />
                </View>
                <View style={styles.timeInputContainer}>
                  <Text style={styles.timeLabel}>Attendance End</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="17:00"
                    value={groupForm.rules.attendanceWindow.endTime}
                    onChangeText={(text) => setGroupForm(prev => ({
                      ...prev,
                      rules: {
                        ...prev.rules,
                        attendanceWindow: { ...prev.rules.attendanceWindow, endTime: text }
                      }
                    }))}
                  />
                </View>
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Require Admin Approval</Text>
                <Switch
                  value={groupForm.rules.requireApproval}
                  onValueChange={(value) => setGroupForm(prev => ({
                    ...prev,
                    rules: { ...prev.rules, requireApproval: value }
                  }))}
                />
              </View>

              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleCreateGroup}
              >
                <Text style={styles.modalSubmitButtonText}>Create Group</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Create Attendance QR Modal */}
      <Modal
        visible={showAttendanceModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Create Attendance QR - {selectedGroup?.name}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowAttendanceModal(false);
                resetAttendanceForm();
              }}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalForm}>
              <TextInput
                style={styles.modalInput}
                placeholder="Attendance Title *"
                value={attendanceForm.title}
                onChangeText={(text) => setAttendanceForm(prev => ({ ...prev, title: text }))}
              />
              
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="Description"
                value={attendanceForm.description}
                onChangeText={(text) => setAttendanceForm(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={2}
              />

              <View style={styles.typeSelector}>
                <Text style={styles.typeSelectorLabel}>Attendance Type:</Text>
                <View style={styles.typeButtons}>
                  {[
                    { key: 'daily', label: 'Daily' },
                    { key: 'weekly', label: 'Weekly' },
                    { key: 'monthly', label: 'Monthly' },
                    { key: 'event', label: 'Event' },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.typeButton,
                        attendanceForm.attendanceType === type.key && styles.typeButtonActive
                      ]}
                      onPress={() => setAttendanceForm(prev => ({ 
                        ...prev, 
                        attendanceType: type.key as any 
                      }))}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        attendanceForm.attendanceType === type.key && styles.typeButtonTextActive
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.dateInputs}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>Valid From</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    value={attendanceForm.validFrom}
                    onChangeText={(text) => setAttendanceForm(prev => ({ ...prev, validFrom: text }))}
                  />
                </View>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>Valid Until</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    value={attendanceForm.validUntil}
                    onChangeText={(text) => setAttendanceForm(prev => ({ ...prev, validUntil: text }))}
                  />
                </View>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Location (optional)"
                value={attendanceForm.location}
                onChangeText={(text) => setAttendanceForm(prev => ({ ...prev, location: text }))}
              />

              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleCreateAttendanceQR}
              >
                <Text style={styles.modalSubmitButtonText}>Create Attendance QR</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* QR Code Preview Modal */}
      <QRCodePreview
        visible={showPreviewModal}
        qrCode={selectedQRCode}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedQRCode(null);
        }}
      />
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
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
  groupsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
    marginRight: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  groupStats: {
    gap: 2,
  },
  groupStatText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  groupActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickActionButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickActionText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
  attendanceQRs: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  attendanceQRsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  attendanceQRItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  qrItemInfo: {
    flex: 1,
  },
  qrItemTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1f2937',
  },
  qrItemDetails: {
    fontSize: 11,
    color: '#6b7280',
  },
  instructionsSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: '#1f2937',
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#2563eb',
  },
  modalContent: {
    flex: 1,
  },
  modalForm: {
    padding: 16,
    gap: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timeInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#374151',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#ffffff',
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#374151',
  },
  modalSubmitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  modalSubmitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
