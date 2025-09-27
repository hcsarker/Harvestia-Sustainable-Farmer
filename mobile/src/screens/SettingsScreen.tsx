import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen: React.FC = () => {
  const { session, signOut } = useSessionContext();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const authSection = session ? null : {
    title: 'Account',
    items: [
      {
        label: 'Sign In',
        onPress: () => navigation.navigate('Auth' as never),
        type: 'button' as const,
      },
    ],
  };

  const settingSections = [
    ...(authSection ? [authSection] : []),
    {
      title: 'Preferences',
      items: [
        {
          label: 'Push Notifications',
          value: notifications,
          onToggle: setNotifications,
          type: 'switch' as const,
        },
        {
          label: 'Dark Mode',
          value: darkMode,
          onToggle: setDarkMode,
          type: 'switch' as const,
        },
        {
          label: 'Sound Effects',
          value: soundEnabled,
          onToggle: setSoundEnabled,
          type: 'switch' as const,
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          label: 'Clear Cache',
          onPress: () => Alert.alert('Cache cleared successfully!'),
          type: 'button' as const,
        },
        {
          label: 'Export Progress',
          onPress: () => Alert.alert('Progress exported!'),
          type: 'button' as const,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          label: 'Version',
          value: '1.0.0',
          type: 'text' as const,
        },
        {
          label: 'Privacy Policy',
          onPress: () => Alert.alert('Privacy Policy', 'Opens privacy policy'),
          type: 'button' as const,
        },
        {
          label: 'Terms of Service',
          onPress: () => Alert.alert('Terms', 'Opens terms of service'),
          type: 'button' as const,
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Settings</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </View>

      {settingSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={styles.settingItem}
              onPress={item.onPress}
              disabled={item.type === 'switch' || item.type === 'text'}
            >
              <Text style={styles.settingLabel}>{item.label}</Text>
              
              {item.type === 'switch' && (
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#e5e7eb', true: '#10B981' }}
                  thumbColor={item.value ? '#ffffff' : '#ffffff'}
                />
              )}
              
              {item.type === 'text' && (
                <Text style={styles.settingValue}>{item.value}</Text>
              )}
              
              {item.type === 'button' && (
                <Text style={styles.settingArrow}>›</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {session && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>🚪 Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with 💚 for sustainable farming
        </Text>
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
    backgroundColor: '#6b7280',
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
    color: '#d1d5db',
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    color: '#6b7280',
  },
  settingArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default SettingsScreen;