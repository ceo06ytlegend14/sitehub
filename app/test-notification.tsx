import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Bell, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info } from 'lucide-react-native';
import { useNotifications } from '../contexts/NotificationContext';

export default function TestNotificationScreen() {
  const { addNotification } = useNotifications();

  const testNotifications = [
    {
      title: 'Success Notification',
      message: 'This is a success notification test',
      type: 'success' as const,
      icon: CheckCircle,
    },
    {
      title: 'Error Notification',
      message: 'This is an error notification test',
      type: 'error' as const,
      icon: AlertCircle,
    },
    {
      title: 'Info Notification',
      message: 'This is an info notification test',
      type: 'info' as const,
      icon: Info,
    },
  ];

  const handleTestNotification = (notification: typeof testNotifications[0]) => {
    addNotification({
      id: Date.now().toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      timestamp: new Date(),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Test Notifications</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Different Notification Types</Text>
          
          {testNotifications.map((notification, index) => (
            <TouchableOpacity
              key={index}
              style={styles.testButton}
              onPress={() => handleTestNotification(notification)}
            >
              <notification.icon size={20} color="#666" />
              <View style={styles.testButtonContent}>
                <Text style={styles.testButtonTitle}>{notification.title}</Text>
                <Text style={styles.testButtonMessage}>{notification.message}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instruction}>
            Tap any button above to trigger a test notification. 
            The notification will appear in the notification system and can be viewed 
            in the notifications screen.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  testButtonContent: {
    marginLeft: 12,
    flex: 1,
  },
  testButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  testButtonMessage: {
    fontSize: 14,
    color: '#666',
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});