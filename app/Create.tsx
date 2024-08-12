import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import CustomModal from '../components/CustomModal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';

const Create = () => {
  const [formData, setFormData] = useState({
    createName: '',
    createPlace: '',
    createPassword: '',
    createPhone:'',
    role: ''
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [isAccountCreated, setIsAccountCreated] = useState(false);

  useEffect(() => {
    const { createName, createPlace, createPassword,createPhone } = formData;
    setIsButtonDisabled(!(createName.length >= 3 && createPlace.trim() && createPassword.trim()  && createPhone.trim().length == 10));
  }, [formData]);

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value.trim(),
    });
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setFormData({ ...formData, role });
    toggleModal();
  };

  const handleCreateAccount = async () => {
    try {
      const { createName, createPlace, createPassword, createPhone, role } = formData;
  
      if (createName.length < 3 || !createPlace.trim() || !createPassword.trim()) {
        setModalMessage('Invalid Phone Format or fill details properly');
        setModalVisible(true);
        return;
      }
  
      let registerEndpoint = '';
      switch (role) {
        case 'Plumber':
          registerEndpoint = `${process.env.EXPO_BACKEND}/api/users/register`;
          break;
        case 'Retailer':
          registerEndpoint = `${process.env.EXPO_BACKEND}/api/retailer/register`;
          break;
        default:
          setModalMessage('Invalid role selected');
          setModalVisible(true);
          return;
      }
  
      const userData = {
        name: createName,
        place: createPlace,
        password: createPassword,
        phone: createPhone
      };
  
      const response = await axios.post(registerEndpoint, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
  
      if (response.status === 200) {
        const { token, id, role } = response.data;
  
        if (token && id) {
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('loggedId', id);
          await AsyncStorage.setItem('role', role);
          setIsAccountCreated(true);
        }
  
        setModalMessage('Account created successfully');
      } else {
        setModalMessage('Failed to create account');
      }
    } catch (error:any) {

      setModalMessage(error.response ? error.response.data : error.message);
    } finally {
      setModalVisible(true);
      setFormData({
        createName: '',
        createPlace: '',
        createPassword: '',
        createPhone: '',
        role: ''
      });
    }
  };
  

  return (
    <>
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
              placeholderTextColor="#6c757d"
              selectionColor="#007bff"
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={formData.createPhone}
              onChangeText={(value) => handleChange('createPhone', value)}
              placeholderTextColor="#6c757d"
              selectionColor="#007bff"
              keyboardType="number-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Place"
              value={formData.createPlace}
              onChangeText={(value) => handleChange('createPlace', value)}
              placeholderTextColor="#6c757d"
              selectionColor="#007bff"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={formData.createPassword}
              onChangeText={(value) => handleChange('createPassword', value)}
              placeholderTextColor="#6c757d"
              selectionColor="#007bff"
            />
            <Text style={styles.subHeaderText}>Select Role:</Text>
            <TouchableOpacity style={styles.roleSelector} onPress={toggleModal}>
              <Text style={styles.roleSelectorText}>{selectedRole || 'Select a role'}</Text>
            </TouchableOpacity>
            <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
              <View style={styles.modalContainer}>
                <TouchableOpacity style={styles.modalItem} onPress={() => handleRoleSelect('Plumber')}>
                  <Text style={styles.modalItemText}>Plumber</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalItem} onPress={() => handleRoleSelect('Retailer')}>
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
  },
  formContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  section: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 26,
    marginBottom: 20,
    textAlign: 'center',
    color: '#212121',
    fontWeight: '700',
  },
  highlightText: {
    color: '#0288d1',
  },
  subHeaderText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#212121',
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
  roleSelector: {
    backgroundColor: '#f9fbe7',
    padding: 15,
    borderWidth: 1,
    borderColor: '#cfd8dc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  roleSelectorText: {
    fontSize: 16,
    color: '#424242',
  },
  button: {
    backgroundColor: '#0288d1',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#b3e5fc',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
  },
  modalItem: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 18,
    color: '#212121',
  },
});

export default Create;
