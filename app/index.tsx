import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import CustomModal from '../components/CustomModal';
import Modal from 'react-native-modal';
import { ThemedText } from '@/components/ThemedText';
import { Link } from 'expo-router';
import { useAuth } from '../context/Auth';
import { Role } from '../context/Auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const { onLogin, authState } = useAuth();

  const [formData, setFormData] = useState({
    loginEmail: '',
    loginPassword: '',
    role: '',
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setFormData({ ...formData, role: role });
    toggleModal();
  };

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    const checkRole = async () => {
      const storedRole = await AsyncStorage.getItem('role');
      if (storedRole) {
        setSelectedRole(storedRole); // Set selectedRole based on stored role
      }
    };

    checkRole();
  }, []);

  useEffect(() => {
    if (authState?.attemptedLogin && authState?.authenticated) {
      // setModalMessage('Login successful');
      // setModalVisible(true);
    } else if (authState?.attemptedLogin && authState?.error) {
      setModalMessage(authState.error);
      setModalVisible(true);
    }
  }, [authState]);

  const handleLogin = async () => {
    const { loginEmail, loginPassword, role } = formData;

    if (!loginEmail || !loginPassword) {
      setModalMessage('Please enter both email and password');
      setModalVisible(true);
      return;
    }

    if (!onLogin) {
      setModalMessage('Login function is not available');
      setModalVisible(true);
      return;
    }

    try {
      setIsLoading(true);
      await onLogin(loginEmail, loginPassword, role as Role);
    } catch (error:any) {
      setModalMessage('An unexpected error occurred');
      console.log(error);
      setModalVisible(true);
    } finally {
      setIsLoading(false);
      setFormData({
        loginEmail: '',
        loginPassword: '',
        role: '',
      });
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.headerText}>
            Welcome to <Text style={styles.highlightText}>Scatch</Text>
          </Text>
          <View style={styles.section}>
            <Text style={styles.subHeaderText}>Login to Your Account</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.loginEmail}
              onChangeText={(value) => handleChange('loginEmail', value)}
              placeholderTextColor="#6c757d"
              selectionColor="#007bff"
              editable={!isLoading}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={formData.loginPassword}
              onChangeText={(value) => handleChange('loginPassword', value)}
              placeholderTextColor="#6c757d"
              selectionColor="#007bff"
              editable={!isLoading}
            />
            <Text style={styles.subHeaderText}>Select Role:</Text>
            <TouchableOpacity style={styles.input} onPress={toggleModal} disabled={isLoading}>
              <Text>{selectedRole || 'Select a role'}</Text>
            </TouchableOpacity>

            <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
              <View style={styles.modalContainer}>
                <TouchableOpacity style={styles.modalItem} onPress={() => handleRoleSelect(Role.USER)}>
                  <Text>User</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalItem} onPress={() => handleRoleSelect(Role.RETAILER)}>
                  <Text>Retailer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalItem} onPress={() => handleRoleSelect(Role.MANUFACTURER)}>
                  <Text>Manufacturer</Text>
                </TouchableOpacity>
              </View>
            </Modal>
            <TouchableOpacity
              style={[
                styles.button,
                (isLoading || !formData.loginEmail || !formData.loginPassword) ? { backgroundColor: '#ccc' } : null,
              ]}
              disabled={isLoading || !formData.loginEmail || !formData.loginPassword}
              onPress={handleLogin}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
            {selectedRole !== Role.MANUFACTURER && (
              <Link href={'/Create'}>
                <ThemedText type="link" style={styles.createAccountLink}>
                  Create Account
                </ThemedText>
              </Link>
            )}
          </View>
        </View>
      </View>

      <CustomModal visible={modalVisible} message={modalMessage} onClose={() => setModalVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#111827',
  },
  highlightText: {
    color: '#007BFF',
  },
  section: {
    marginBottom: 20,
  },
  subHeaderText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    color: '#4B5563',
  },
  input: {
    backgroundColor: '#F9FAFB',
    color: '#333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'grey',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  createAccountLink: {
    textAlign: 'center',
    marginTop: 10,
    color: '#007BFF',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default HomeScreen;
