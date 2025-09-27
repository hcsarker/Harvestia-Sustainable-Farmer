import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';
import { useNavigation } from '@react-navigation/native';

interface Certificate {
  id: string;
  title: string;
  issueDate: string;
  description: string;
  type: 'course' | 'achievement' | 'skill';
  verified: boolean;
}

const CertificatesScreen: React.FC = () => {
  const { session } = useSessionContext();
  const navigation = useNavigation();

  const certificates: Certificate[] = session ? [
    {
      id: 'cert1',
      title: 'Sustainable Farming Fundamentals',
      issueDate: '2024-03-15',
      description: 'Completed comprehensive course on sustainable farming practices',
      type: 'course',
      verified: true,
    },
    {
      id: 'cert2',
      title: 'Water Management Expert',
      issueDate: '2024-03-10',
      description: 'Mastered efficient irrigation and water conservation techniques',
      type: 'skill',
      verified: true,
    },
    {
      id: 'cert3',
      title: 'Pest Control Specialist',
      issueDate: '2024-02-28',
      description: 'Expert in integrated pest management using natural methods',
      type: 'achievement',
      verified: true,
    },
  ] : [];

  const sampleCertificates: Certificate[] = [
    {
      id: 'sample1',
      title: 'Sustainable Farming Fundamentals',
      issueDate: 'Available after completion',
      description: 'Complete the fundamentals course to earn this certificate',
      type: 'course',
      verified: false,
    },
    {
      id: 'sample2',
      title: 'Climate-Smart Agriculture',
      issueDate: 'Available after completion',
      description: 'Master climate adaptation techniques for modern farming',
      type: 'skill',
      verified: false,
    },
    {
      id: 'sample3',
      title: 'Organic Farming Expert',
      issueDate: 'Available after completion',
      description: 'Become certified in organic farming practices and certification',
      type: 'achievement',
      verified: false,
    },
  ];

  const displayCerts = session ? certificates : sampleCertificates;

  const getCertificateIcon = (type: Certificate['type']) => {
    switch (type) {
      case 'course':
        return '📜';
      case 'skill':
        return '🎯';
      case 'achievement':
        return '🏆';
    }
  };

  const getCertificateColor = (type: Certificate['type']) => {
    switch (type) {
      case 'course':
        return '#3B82F6';
      case 'skill':
        return '#10B981';
      case 'achievement':
        return '#F59E0B';
    }
  };

  const handleCertificatePress = (certificate: Certificate) => {
    if (!session) {
      Alert.alert(
        'Sign In Required',
        'Sign in to view and download your certificates.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Auth' as never) },
        ]
      );
      return;
    }

    Alert.alert(
      certificate.title,
      `${certificate.description}\n\nIssued: ${certificate.issueDate}\nVerified: ${certificate.verified ? 'Yes' : 'Pending'}\n\nWould you like to download or share this certificate?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => Alert.alert('Download', 'Certificate downloaded to your device!') },
        { text: 'Share', onPress: () => Alert.alert('Share', 'Certificate shared successfully!') },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎓 Certificates</Text>
        <Text style={styles.subtitle}>
          {session 
            ? 'Your earned certificates and achievements' 
            : 'Certificates you can earn through learning'
          }
        </Text>

        {!session && (
          <View style={styles.guestNotice}>
            <Text style={styles.guestNoticeText}>
              🏆 Explore available certificates! Sign in to earn and download them.
            </Text>
          </View>
        )}
      </View>

      {/* Statistics */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>📊 Certificate Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {session ? certificates.filter(c => c.verified).length : '0'}
            </Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {session ? certificates.length : sampleCertificates.length}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {session ? Math.round((certificates.filter(c => c.verified).length / certificates.length) * 100) : 0}%
            </Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
        </View>
      </View>

      {/* Certificates List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {session ? 'Your Certificates' : 'Available Certificates'}
        </Text>
        
        {displayCerts.length > 0 ? (
          displayCerts.map((certificate) => (
            <TouchableOpacity
              key={certificate.id}
              style={[
                styles.certificateCard,
                !certificate.verified && styles.unverifiedCard,
              ]}
              onPress={() => handleCertificatePress(certificate)}
            >
              <View style={styles.certificateHeader}>
                <View style={styles.certificateLeft}>
                  <Text style={styles.certificateIcon}>
                    {getCertificateIcon(certificate.type)}
                  </Text>
                  <View style={styles.certificateInfo}>
                    <Text style={[
                      styles.certificateTitle,
                      !certificate.verified && styles.unverifiedTitle,
                    ]}>
                      {certificate.title}
                    </Text>
                    <Text style={[
                      styles.certificateDescription,
                      !certificate.verified && styles.unverifiedDescription,
                    ]}>
                      {certificate.description}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.certificateRight}>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: getCertificateColor(certificate.type) },
                    ]}
                  >
                    <Text style={styles.typeBadgeText}>
                      {certificate.type.charAt(0).toUpperCase() + certificate.type.slice(1)}
                    </Text>
                  </View>
                  
                  {certificate.verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓ Verified</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.certificateFooter}>
                <Text style={[
                  styles.issueDate,
                  !certificate.verified && styles.unverifiedDate,
                ]}>
                  📅 {certificate.issueDate}
                </Text>
                
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    !certificate.verified && styles.earnButton,
                  ]}
                  onPress={() => handleCertificatePress(certificate)}
                >
                  <Text style={styles.actionButtonText}>
                    {session && certificate.verified ? 'View' : 'Earn'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎓</Text>
            <Text style={styles.emptyTitle}>No Certificates Yet</Text>
            <Text style={styles.emptyDescription}>
              Complete courses and achievements to earn your first certificate!
            </Text>
          </View>
        )}
      </View>

      {/* How to Earn */}
      <View style={styles.howToEarnCard}>
        <Text style={styles.howToEarnTitle}>🎯 How to Earn Certificates</Text>
        
        <View style={styles.earnStep}>
          <Text style={styles.stepIcon}>1️⃣</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Complete Courses</Text>
            <Text style={styles.stepDescription}>
              Finish learning modules and pass quizzes with 80%+ scores
            </Text>
          </View>
        </View>

        <View style={styles.earnStep}>
          <Text style={styles.stepIcon}>2️⃣</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Demonstrate Skills</Text>
            <Text style={styles.stepDescription}>
              Complete practical simulations and real-world challenges
            </Text>
          </View>
        </View>

        <View style={styles.earnStep}>
          <Text style={styles.stepIcon}>3️⃣</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Get Verified</Text>
            <Text style={styles.stepDescription}>
              Certificates are automatically verified and ready to download
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#F59E0B',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fef3c7',
  },
  guestNotice: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  guestNoticeText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: -10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  certificateCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unverifiedCard: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  certificateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  certificateLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 16,
  },
  certificateIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  certificateInfo: {
    flex: 1,
  },
  certificateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  unverifiedTitle: {
    color: '#6b7280',
  },
  certificateDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  unverifiedDescription: {
    fontStyle: 'italic',
  },
  certificateRight: {
    alignItems: 'flex-end',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '600',
  },
  certificateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issueDate: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  unverifiedDate: {
    fontStyle: 'italic',
    color: '#9ca3af',
  },
  actionButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  earnButton: {
    backgroundColor: '#6b7280',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  howToEarnCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  howToEarnTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
  },
  earnStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default CertificatesScreen;