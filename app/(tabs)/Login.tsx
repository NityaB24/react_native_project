import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Easing, ActivityIndicator } from 'react-native';
import CustomModal from '../components/Message/CustomModal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';

import UserDrawer from '../components/User/CustomDrawer';
import RetailerDrawer from '../components/Retailer/CustomDrawer';
import ManufacturerDrawer from '../components/Manufacturer/CustomDrawer';

import { ThemedText } from '@/components/ThemedText';
import { Link } from 'expo-router';

const HomeScreen = () => {
  const [formData, setFormData] = useState({
    loginEmail: '',
    loginPassword: '',
    role: '',
  });
  const [isModalVisible, setisModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(-250));
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleModal = () => {
    setisModalVisible(!isModalVisible);
  };

  const handleRoleSelect = (role:string) => {
    setSelectedRole(role);
    setFormData({ ...formData, role: role });
    toggleModal();
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: -250,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => setIsDrawerOpen(false));
  };

  const handleChange = (name:string, value:string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = async () => {
    const { loginEmail, loginPassword, role } = formData;

    if (!loginEmail || !loginPassword) {
      setModalMessage('Please enter both email and password');
      setModalVisible(true);
      return;
    }

    let loginEndpoint = '';
    switch (role) {
      case 'user':
        loginEndpoint = 'http://192.168.29.101:3000/api/users/login';
        break;
      case 'retailer':
        loginEndpoint = 'http://192.168.29.101:3000/api/retailer/login';
        break;
      case 'manufacturer':
        loginEndpoint = 'http://192.168.29.101:3000/api/manufacturer/login';
        break;
      default:
        setModalMessage('There might be some issue: Select the role again');
        setModalVisible(true);
        return;
    }

    try {
      setIsLoading(true);
      const userData = { email: loginEmail, password: loginPassword };
      const response = await axios.post(loginEndpoint, userData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 200) {
        const token = response.data.token;
        const userId = response.data.id;
        const userRole = response.data.role;

        console.log('Token:', token);
        console.log('UserId:', userId);
        console.log('Role:', userRole);

        if (token && userId) {
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('loggedId', userId);
          await AsyncStorage.setItem('role', userRole);
          setModalMessage('Login successfully');
          setIsLoggedIn(true);
          openDrawer();
        } else {
          setModalMessage('Failed to Login: Token or userId not received');
        }
      } else {
        setModalMessage('Failed to Login: Invalid response status');
      }
    } catch (error) {
      console.log('Error logging in:', error);
      setModalMessage('Incorrect Email or Password');
    } finally {
      setIsLoading(false);
      setModalVisible(true);
      setFormData({
        loginEmail: '',
        loginPassword: '',
        role: '',
      });
    }
  };

  const getDrawerComponent = () => {
    switch (selectedRole) {
      case 'user':
        return <UserDrawer isOpen={isDrawerOpen} closeDrawer={closeDrawer} />;
      case 'retailer':
        return <RetailerDrawer isOpen={isDrawerOpen} closeDrawer={closeDrawer} />;
      case 'admin':
        return <ManufacturerDrawer isOpen={isDrawerOpen} closeDrawer={closeDrawer} />;
      default:
        return null;
    }
  };

  return (
    <>
      {isLoggedIn && (
        <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
          <Text style={styles.drawerButtonText}>☰</Text>
        </TouchableOpacity>
      )}
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.headerText}>Welcome to <Text style={styles.highlightText}>Scatch</Text></Text>
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
                <TouchableOpacity style={styles.modalItem} onPress={() => handleRoleSelect('user')}>
                  <Text>User</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalItem} onPress={() => handleRoleSelect('retailer')}>
                  <Text>Retailer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalItem} onPress={() => handleRoleSelect('manufacturer')}>
                  <Text>Manufacturer</Text>
                </TouchableOpacity>
              </View>
            </Modal>
            <TouchableOpacity
              style={[styles.button, (isLoading || !formData.loginEmail || !formData.loginPassword) ? { backgroundColor: '#ccc' } : null]}
              disabled={isLoading || !formData.loginEmail || !formData.loginPassword}
              onPress={handleLogin}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
            {selectedRole !== 'admin' && (
              <Link href={'/components/Create'}>
                <ThemedText type="link" style={styles.createAccountLink}>Create Account</ThemedText>
              </Link>
            )}
          </View>
        </View>
      </View>

      <CustomModal
        visible={modalVisible}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
      <Animated.View style={[styles.drawerWrapper, { transform: [{ translateX: drawerAnim }] }]}>
        {getDrawerComponent()}
      </Animated.View>
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
  drawerButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  drawerButtonText: {
    fontSize: 24,
    color: '#007BFF',
  },
  drawerWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
  },
});

export default HomeScreen;
