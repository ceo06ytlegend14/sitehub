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
import { ArrowLeft, Plus, Search, CreditCard as Edit, Trash2, User, Mail, Phone, Briefcase, Shield, ShieldCheck } from 'lucide-react-native';
import { isAdminRole } from '@/utils/authz';

interface UserData {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: 'user' | 'admin' | 'super_admin';
  contact?: string;
  designation?: string;
  isActive: boolean;
}

export default function UserManagementScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    employeeId: '',
    role: 'user' as 'user' | 'admin',
    contact: '',
    designation: '',
  });

  // Redirect if not admin
  React.useEffect(() => {
    if (!user || !isAdminRole(user.role)) {
      router.replace('/(tabs)/');
    }
  }, [user]);

  // Mock users data
  const [users, setUsers] = useState<UserData[]>([
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@company.com',
      employeeId: 'EMP001',
      role: 'user',
      contact: '+1234567891',
      designation: 'Software Developer',
      isActive: true,
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@company.com',
      employeeId: 'EMP002',
      role: 'user',
      contact: '+1234567892',
      designation: 'UI/UX Designer',
      isActive: true,
    },
    {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@company.com',
      employeeId: 'ADMIN001',
      role: 'admin',
      contact: '+1234567890',
      designation: 'System Administrator',
      isActive: true,
    },
  ]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.employeeId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const user: UserData = {
      id: `user-${Date.now()}`,
      ...newUser,
      isActive: true,
    };

    setUsers(prev => [...prev, user]);
    setNewUser({
      name: '',
      email: '',
      employeeId: '',
      role: 'user',
      contact: '',
      designation: '',
    });
    setShowAddModal(false);
    Alert.alert('Success', 'User added successfully');
  };

  const handleEditUser = (userData: UserData) => {
    setEditingUser(userData);
    setNewUser({
      name: userData.name,
      email: userData.email,
      employeeId: userData.employeeId,
      role: userData.role,
      contact: userData.contact || '',
      designation: userData.designation || '',
    });
    setShowAddModal(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    setUsers(prev => prev.map(u => 
      u.id === editingUser.id 
        ? { ...u, ...newUser }
        : u
    ));
    
    setEditingUser(null);
    setNewUser({
      name: '',
      email: '',
      employeeId: '',
      role: 'user',
      contact: '',
      designation: '',
    });
    setShowAddModal(false);
    Alert.alert('Success', 'User updated successfully');
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    Alert.alert(
      'Ban/Remove User',
      `Choose action for ${userToDelete.name}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ban User',
          style: 'destructive',
          onPress: () => {
            setUsers(prev => prev.map(u => 
              u.id === userId ? { ...u, isActive: false } : u
            ));
            Alert.alert('User Banned', `${userToDelete.name} has been banned from the system`);
          },
        },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'This will permanently delete the user and all their data. This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    setUsers(prev => prev.filter(u => u.id !== userId));
                    Alert.alert('Success', 'User deleted permanently');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const UserModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editingUser ? 'Edit User' : 'Add New User'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setShowAddModal(false);
              setEditingUser(null);
              setNewUser({
                name: '',
                email: '',
                employeeId: '',
                role: 'user',
                contact: '',
                designation: '',
              });
            }}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.modalForm}>
            <TextInput
              style={styles.modalInput}
              placeholder="Full Name *"
              value={newUser.name}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, name: text }))}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Email *"
              value={newUser.email}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Employee ID *"
              value={newUser.employeeId}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, employeeId: text }))}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Contact"
              value={newUser.contact}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, contact: text }))}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Designation"
              value={newUser.designation}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, designation: text }))}
            />

            <View style={styles.roleSelector}>
              <Text style={styles.roleSelectorLabel}>Role:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    newUser.role === 'user' && styles.roleButtonActive
                  ]}
                  onPress={() => setNewUser(prev => ({ ...prev, role: 'user' }))}
                >
                  <Text style={[
                    styles.roleButtonText,
                    newUser.role === 'user' && styles.roleButtonTextActive
                  ]}>User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    newUser.role === 'admin' && styles.roleButtonActive
                  ]}
                  onPress={() => setNewUser(prev => ({ ...prev, role: 'admin' }))}
                >
                  <Text style={[
                    styles.roleButtonText,
                    newUser.role === 'admin' && styles.roleButtonTextActive
                  ]}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalSubmitButton}
              onPress={editingUser ? handleUpdateUser : handleAddUser}
            >
              <Text style={styles.modalSubmitButtonText}>
                {editingUser ? 'Update User' : 'Add User'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (!user || !isAdminRole(user.role)) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{users.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {users.filter(u => u.role === 'admin').length}
            </Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {users.filter(u => u.isActive).length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.usersList}>
          {filteredUsers.map((userData) => (
            <View key={userData.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{userData.name}</Text>
                  <View style={styles.userActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditUser(userData)}
                    >
                      <Edit size={16} color="#2563eb" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteUser(userData.id)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.userDetails}>
                  <View style={styles.userDetailRow}>
                    <Mail size={14} color="#6b7280" />
                    <Text style={styles.userDetailText}>{userData.email}</Text>
                  </View>
                  <View style={styles.userDetailRow}>
                    <User size={14} color="#6b7280" />
                    <Text style={styles.userDetailText}>{userData.employeeId}</Text>
                  </View>
                  {userData.contact && (
                    <View style={styles.userDetailRow}>
                      <Phone size={14} color="#6b7280" />
                      <Text style={styles.userDetailText}>{userData.contact}</Text>
                    </View>
                  )}
                  {userData.designation && (
                    <View style={styles.userDetailRow}>
                      <Briefcase size={14} color="#6b7280" />
                      <Text style={styles.userDetailText}>{userData.designation}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.userRole}>
                  {userData.role === 'admin' ? (
                    <ShieldCheck size={16} color="#ef4444" />
                  ) : (
                    <Shield size={16} color="#10b981" />
                  )}
                  <Text style={[
                    styles.roleText,
                    userData.role === 'admin' ? styles.adminRole : styles.userRole
                  ]}>
                    {userData.role.toUpperCase()}
                  </Text>
                  {!userData.isActive && (
                    <View style={styles.bannedBadge}>
                      <Text style={styles.bannedText}>BANNED</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <UserModal />
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
  searchContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  usersList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    gap: 12,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  userDetails: {
    gap: 6,
  },
  userDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userDetailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  userRole: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  adminRole: {
    color: '#ef4444',
  },
  bannedBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  bannedText: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: '700',
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
  roleSelector: {
    gap: 8,
  },
  roleSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  roleButtonTextActive: {
    color: '#ffffff',
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
