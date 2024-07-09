import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,Animated,Easing } from 'react-native';
import CustomModal from '../../components/Message/CustomModal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const createRetailer = () => {
  const [formData, setFormData] = useState({
    createName: '',
    createEmail: '',
    createPassword: ''
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCreateAccount = async () => {
    try {
      const userData = {
        fullname: formData.createName,
        email: formData.createEmail,
        password: formData.createPassword,
      };
  
      const response = await axios.post('http://192.168.1.4:3000/api/retailer/register', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Response status:', response.status);
  
      if (response.status === 200) {
        const token = response.data.token; // Assuming the API response includes the token
        const retailerId = response.data.id; // Assuming the API response includes the retailerId
  
        console.log('Token:', token);
        console.log('RetailerId:', retailerId);
  
        // Example: Store token and retailerId in AsyncStorage
        if (token && retailerId) {
          await AsyncStorage.setItem('token', token); // Store token in AsyncStorage
          await AsyncStorage.setItem('retailerId', retailerId.toString()); // Store retailerId in AsyncStorage (converted to string if necessary)
        }
  
        setModalMessage('Account created successfully');
      } else {
        setModalMessage('Failed to create account');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      setModalMessage('Failed to create account');
    } finally {
      setModalVisible(true);
    }
};


  return (
    <>
      <View style={styles.container}>
        <View style={styles.halfContainer}>
          <View style={styles.innerContainer}>
            <Text style={styles.headerText}>
              Welcome to <Text style={styles.highlightText}>Scatch</Text>
            </Text>
            <Text style={styles.subHeaderText}>Create Retailer account</Text>
            <View>
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
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={formData.createPassword}
                onChangeText={(value) => handleChange('createPassword', value)}
              />
              <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
                <Text style={styles.buttonText}>Create My Account</Text>
              </TouchableOpacity>
            </View>
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
    flexDirection: 'row',
    padding: 20,
    backgroundColor:'#fff',
  },
  halfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '100%',
    paddingHorizontal: 32,
  },
  headerText: {
    fontSize: 32,
    marginBottom: 5,
  },
  highlightText: {
    color: 'blue',
    fontWeight: 'bold',
  },
  subHeaderText: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    color:'#000',
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: 'blue',
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  }
});

export default createRetailer;
