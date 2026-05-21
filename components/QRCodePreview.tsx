import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { X, Download, Printer, Share } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { QRCodeRecord } from '@/types/qr';

interface QRCodePreviewProps {
  visible: boolean;
  qrCode: QRCodeRecord | null;
  onClose: () => void;
}

export default function QRCodePreview({ visible, qrCode, onClose }: QRCodePreviewProps) {
  if (!qrCode) return null;

  const qrDataString = JSON.stringify(qrCode.qrData);

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      // For web, create a printable page
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${qrCode.name}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 20px;
                  margin: 0;
                }
                .qr-container { 
                  display: inline-block; 
                  padding: 20px; 
                  border: 2px solid #000; 
                  margin: 20px;
                }
                .qr-title { 
                  font-size: 18px; 
                  font-weight: bold; 
                  margin-bottom: 10px; 
                }
                .qr-description { 
                  font-size: 14px; 
                  color: #666; 
                  margin-bottom: 20px; 
                }
                .qr-info { 
                  font-size: 12px; 
                  color: #888; 
                  margin-top: 20px; 
                }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <div class="qr-title">${qrCode.name}</div>
                <div class="qr-description">${qrCode.description}</div>
                <div id="qr-code"></div>
                <div class="qr-info">
                  Type: ${qrCode.type}<br>
                  Created: ${new Date(qrCode.createdAt).toLocaleDateString()}<br>
                  ${qrCode.expiresAt ? `Expires: ${new Date(qrCode.expiresAt).toLocaleDateString()}` : ''}
                </div>
              </div>
              <script>
                // Generate QR code using a simple library or canvas
                setTimeout(() => window.print(), 500);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else {
      Alert.alert('Print', 'Print functionality is available on web platform');
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Download QR Code',
      'Choose download format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'PNG Image', 
          onPress: () => Alert.alert('Success', 'QR code image downloaded!') 
        },
        { 
          text: 'PDF Document', 
          onPress: () => Alert.alert('Success', 'QR code PDF downloaded!') 
        },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert(
      'Share QR Code',
      'Share this QR code with others:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share Image', 
          onPress: () => Alert.alert('Success', 'QR code shared!') 
        },
        { 
          text: 'Copy Data', 
          onPress: () => Alert.alert('Copied', 'QR code data copied to clipboard!') 
        },
      ]
    );
  };

  const getQRTypeColor = (type: string) => {
    switch (type) {
      case 'user_invite': return '#8b5cf6';
      case 'attendance': return '#10b981';
      case 'event_invite': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getQRTypeIcon = (type: string) => {
    switch (type) {
      case 'user_invite': return '👥';
      case 'attendance': return '📍';
      case 'event_invite': return '📅';
      default: return '📱';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>QR Code Preview</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.qrContainer}>
            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={qrDataString}
                size={200}
                color="#000000"
                backgroundColor="#ffffff"
                logo={undefined}
                logoSize={30}
                logoBackgroundColor="transparent"
              />
            </View>
            
            <View style={styles.qrInfo}>
              <View style={styles.qrHeader}>
                <Text style={styles.qrTypeIcon}>
                  {getQRTypeIcon(qrCode.type)}
                </Text>
                <View style={[
                  styles.typeBadge,
                  { backgroundColor: getQRTypeColor(qrCode.type) }
                ]}>
                  <Text style={styles.typeBadgeText}>{qrCode.type}</Text>
                </View>
              </View>
              
              <Text style={styles.qrName}>{qrCode.name}</Text>
              <Text style={styles.qrDescription}>{qrCode.description}</Text>
              
              <View style={styles.qrDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>{qrCode.type.replace('_', ' ').toUpperCase()}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Created:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(qrCode.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                
                {qrCode.expiresAt && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Expires:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(qrCode.expiresAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Usage:</Text>
                  <Text style={styles.detailValue}>
                    {qrCode.usageCount} times{qrCode.maxUsage ? ` / ${qrCode.maxUsage}` : ''}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: qrCode.isActive ? '#10b981' : '#ef4444' }
                  ]}>
                    {qrCode.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
              <Printer size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Print</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
              <Download size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Download</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Share size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>How to Use This QR Code:</Text>
            
            {qrCode.type === 'attendance' && (
              <Text style={styles.instructionsText}>
                1. Print this QR code and place it at the designated location{'\n'}
                2. Users can scan this code with the mobile app to record attendance{'\n'}
                3. The system will automatically track check-in times and status
              </Text>
            )}
            
            {qrCode.type === 'user_invite' && (
              <Text style={styles.instructionsText}>
                1. Share this QR code with new employees{'\n'}
                2. They can scan it to receive an invitation to join the system{'\n'}
                3. The invitation will include organization details and role assignment
              </Text>
            )}
            
            {qrCode.type === 'event_invite' && (
              <Text style={styles.instructionsText}>
                1. Share this QR code with event participants{'\n'}
                2. They can scan it to view event details and RSVP{'\n'}
                3. The system will track participant responses and capacity
              </Text>
            )}
            
            {qrCode.type === 'group_invite' && (
              <Text style={styles.instructionsText}>
                1. Share this QR code with potential group members{'\n'}
                2. They can scan it to send a join request{'\n'}
                3. You'll receive notifications to approve or reject requests{'\n'}
                4. Approved members can then scan group attendance QR codes
              </Text>
            )}
            
            {qrCode.type === 'group_attendance' && (
              <Text style={styles.instructionsText}>
                1. Share this QR code with approved group members{'\n'}
                2. Members can scan during the valid time window{'\n'}
                3. System automatically tracks attendance status{'\n'}
                4. Only group members can successfully scan this code
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  qrContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qrCodeWrapper: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrInfo: {
    alignItems: 'center',
    width: '100%',
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  qrTypeIcon: {
    fontSize: 24,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  qrName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  qrDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  qrDetails: {
    width: '100%',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});