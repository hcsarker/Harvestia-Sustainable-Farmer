import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';

const AuthScreen: React.FC = () => {
  const { signIn, signUp } = useSessionContext();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const handleAuth = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
      } else {
        await signUp(formData.email, formData.password, {
          full_name: formData.fullName,
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🌱</Text>
        <Text style={styles.title}>Harvestia</Text>
        <Text style={styles.subtitle}>Sustainable Farming Platform</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Text>

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.fullName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
            autoCapitalize="words"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={formData.password}
          onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
          secureTextEntry
        />

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
            secureTextEntry
          />
        )}

        <TouchableOpacity
          style={styles.authButton}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.authButtonText}>
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchText}>
            {isLogin 
              ? "Don't have an account? Sign Up" 
              : "Already have an account? Sign In"
            }
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>What you'll get:</Text>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>📚</Text>
          <Text style={styles.featureText}>Interactive Learning Courses</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🎮</Text>
          <Text style={styles.featureText}>Engaging Mini Games</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>📖</Text>
          <Text style={styles.featureText}>Progressive Story Journey</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🏆</Text>
          <Text style={styles.featureText}>Achievements & Certificates</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#10B981',
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1fae5',
  },
  form: {
    padding: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  authButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    color: '#6b7280',
    fontSize: 14,
  },
  features: {
    padding: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 32,
  },
  featureText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default AuthScreen;