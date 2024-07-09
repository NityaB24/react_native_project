import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import CustomModal from '../components/Message/CustomModal';
import CustomDrawer from '../components/Manufacturer/CustomDrawer';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    loginEmail: '',
    loginPassword: '',
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(-300));
  

  const handleChange = (name:string, value:string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = async () => {
    const userData = { email: formData.loginEmail, password: formData.loginPassword };

    try {
      const response = await axios.post('http://192.0.0.2:3000/api/manufacturer/login', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const token = response.data.token;
        const manuId = response.data.manu_id;

        if (token && manuId) {
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('manufacturerId', manuId);
          setModalMessage('Login successfully');
        } else {
          setModalMessage('Failed to Login: Token or userId not received');
        }
      } else {
        setModalMessage('Failed to Login: Invalid response status');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setModalMessage('Failed to Login: Server error');
    } finally {
      setModalVisible(true);
    }
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
      toValue: -300,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => setIsDrawerOpen(false));
  };

 
  return (
    <>
      <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
        <Text style={styles.drawerButtonText}>☰</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.headerText}>Welcome to <Text style={styles.highlightText}>Scatch</Text></Text>

          <View style={styles.section}>
            <Text style={styles.subHeaderText}>Login to Your Manufacturer Account</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.loginEmail}
              onChangeText={(value) => handleChange('loginEmail', value)}
              placeholderTextColor="#6c757d"
              selectionColor="#007bff"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={formData.loginPassword}
              onChangeText={(value) => handleChange('loginPassword', value)}
              placeholderTextColor="#6c757d"
              selectionColor="#007bff"
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
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
        <CustomDrawer isOpen={isDrawerOpen} closeDrawer={closeDrawer} />
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
    borderColor: '#ced4da',
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
    width: 300,
    zIndex: 1000,
  },
});

export default LoginScreen;
