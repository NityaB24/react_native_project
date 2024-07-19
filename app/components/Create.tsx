import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import CustomModal from './Message/CustomModal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';

import UserDrawer from '../components/User/CustomDrawer';
import RetailerDrawer from '../components/Retailer/CustomDrawer';
import ManufacturerDrawer from '../components/Manufacturer/CustomDrawer';

const Create = () => {
  const [formData, setFormData] = useState({
    createName: '',
    createEmail: '',
    createPassword: '',
    role: ''
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(-250));
  const [isAccountCreated, setIsAccountCreated] = useState(false);

  useEffect(() => {
    const { createName, createEmail, createPassword } = formData;
    setIsButtonDisabled(!(createName.trim().length >= 3 && createEmail.trim() && createPassword.trim() && createEmail.includes('@')));
  }, [formData]);

  const handleChange = (name:string, value:string) => {
    setFormData({
      ...formData,
      [name]: value.trim(),
    });
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

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleRoleSelect = (role:string) => {
    setSelectedRole(role);
    setFormData({ ...formData, role });
    toggleModal();
  };

  const handleCreateAccount = async () => {
    try {
      const { createName, createEmail, createPassword, role } = formData;

      if (createName.trim().length < 3 || !createEmail.trim() || !createPassword.trim() || !createEmail.includes('@')) {
        setModalMessage('Invalid Email Format or fill details properly');
        setModalVisible(true);
        return;
      }

      let registerEndpoint = '';
      switch (role) {
        case 'user':
          registerEndpoint = 'http://192.168.29.101:3000/api/users/register';
          break;
        case 'retailer':
          registerEndpoint = 'http://192.168.29.101:3000/api/retailer/register';
          break;
        default:
          setModalMessage('Invalid role selected');
          setModalVisible(true);
          return;
      }

      const userData = {
        name: createName,
        email: createEmail,
        password: createPassword,
      };

      const response = await axios.post(registerEndpoint, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const { token, id, role } = response.data;

        if (token && id) {
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('userId', id);
          await AsyncStorage.setItem('role', role);
          setIsAccountCreated(true);
          openDrawer();
        }

        setModalMessage('Account created successfully');
      } else {
        setModalMessage('Failed to create account');
      }
    } catch (error) {
      console.log('Error creating account:', error);
      setModalMessage('Failed to create account');
    } finally {
      setModalVisible(true);
      setFormData({
        createName: '',
        createEmail: '',
        createPassword: '',
        role: ''
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
      {isAccountCreated && (
        <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
          <Text style={styles.drawerButtonText}>☰</Text>
        </TouchableOpacity>
      )}
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.headerText}>Welcome to <Text style={styles.highlightText}>Scatch</Text></Text>
          <View style={styles.section}>
            <Text style={styles.subHeaderText}>Create New Account</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.createName}
              onChangeText={(value) => handleChange('createName', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.createEmail}
              onChangeText={(value) => handleChange('createEmail', value)}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={formData.createPassword}
              onChangeText={(value) => handleChange('createPassword', value)}
            />
            <Text style={styles.subHeaderText}>Select Role:</Text>
            <TouchableOpacity style={styles.roleSelector} onPress={toggleModal}>
              <Text style={styles.roleSelectorText}>{selectedRole || 'Select a role'}</Text>
            </TouchableOpacity>
            <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
              <View style={styles.modalContainer}>
                <TouchableOpacity style={styles.modalItem} onPress={() => handleRoleSelect('user')}>
                  <Text style={styles.modalItemText}>User</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalItem} onPress={() => handleRoleSelect('retailer')}>
                  <Text style={styles.modalItemText}>Retailer</Text>
                </TouchableOpacity>
              </View>
            </Modal>
            <TouchableOpacity
              style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
              onPress={handleCreateAccount}
              disabled={isButtonDisabled}
            >
              <Text style={styles.buttonText}>Create My Account</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
    // marginTop:20,
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  formContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  section: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333333',
    fontWeight: '700',
  },
  highlightText: {
    color: '#007BFF',
  },
  subHeaderText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333333',
  },
  input: {
    backgroundColor: '#f0f0f0',
    color: '#333333',
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  roleSelector: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:15,
  },
  roleSelectorText: {
    fontSize: 16,
    color: '#555555',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'lightblue',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
  },
  modalItem: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 18,
    color: '#333333',
  },
  drawerButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  drawerButtonText: {
    fontSize: 24,
    color: '#ff6347',
  },
  drawerWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
    backgroundColor: '#ffffff',
    width: 250,
  },
});

export default Create;
