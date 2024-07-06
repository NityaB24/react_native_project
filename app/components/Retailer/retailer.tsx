import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,Animated,Easing } from 'react-native';
import CustomModal from '../../components/Message/CustomModal';
import CustomDrawer from './CustomDrawer';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const retailer = () => {
  const [formData, setFormData] = useState({
    createName: '',
    createEmail: '',
    createPassword: '',
    loginEmail: '',
    loginPassword: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(-250));
  
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
  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCreateAccount = async () => {
    try {
      // HOME Wifi  http://192.168.29.101:3000 
      // Office Wifi http://192.168.1.4:3000
      const response = await fetch('http://192.168.1.4:3000/api/retailer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname: formData.createName,
          email: formData.createEmail,
          password: formData.createPassword,
        }),
      });
  
      console.log('Response status:', response.status);
  
      if (response.status === 200) {
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
  

  const handleLogin = async () => {
    console.log(formData.loginEmail, formData.loginPassword);
    const userData = { email: formData.loginEmail, password: formData.loginPassword };

    try {
        const response = await axios.post('http://192.0.0.2:3000/api/retailer/login', userData, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.status === 200) {
            const token = response.data.token; // Adjust based on actual response structure
            const retailerId = response.data.id; // Assuming the API response includes userId

            console.log('Token:', token);
            console.log('retailerId:', retailerId);

            if (token && retailerId) {
                await AsyncStorage.setItem('token', token); // Store token in AsyncStorage
                await AsyncStorage.setItem('retailerId', retailerId); // Store userId in AsyncStorage
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
        setModalVisible(true); // Show modal after login attempt
    }
};


  return (
    <>
    <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
        <Text style={styles.buttonText}>Menu</Text>
      </TouchableOpacity>
      <View style={styles.container}>
        {/* <View style={styles.halfContainer}>
          <View style={styles.innerContainer}>
            <Text style={styles.headerText}>
              Welcome to <Text style={styles.highlightText}>Scatch</Text>
            </Text>
            <Text style={styles.subHeaderText}>Create your account</Text>
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
        </View> */}
        
        <View style={styles.halfContainer}>
          <View style={styles.innerContainer}>
            <Text style={styles.subHeaderText}>Login to your Retailer account</Text>
            <View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData.loginEmail}
                onChangeText={(value) => handleChange('loginEmail', value)}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={formData.loginPassword}
                onChangeText={(value) => handleChange('loginPassword', value)}
              />
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
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
      <Animated.View style={[styles.drawerWrapper, { transform: [{ translateX: drawerAnim }] }]}>
        <CustomDrawer isOpen={isDrawerOpen} closeDrawer={closeDrawer} />
      </Animated.View>
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
  },
  drawerButton: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth:1,
    borderColor:'black',
    alignItems: 'center',
    marginTop: 0,
  },
  drawerWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 250,
    zIndex: 1000,
  },
});

export default retailer;
