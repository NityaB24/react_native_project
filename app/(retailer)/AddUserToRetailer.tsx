import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,Animated,Easing } from 'react-native';
import axios from 'axios';

import AsyncStorage from '@react-native-async-storage/async-storage';

const AddUserToRetailer = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const checkTokenAndUserId = async () => {
            const token = await AsyncStorage.getItem("token");
            const retailerId = await AsyncStorage.getItem('loggedId');
            
            if (!token || !retailerId) {
                console.error('No token or userId found');
            }
        };
        checkTokenAndUserId();
    }, []);
    

    const handleAddUser = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const retailerId = await AsyncStorage.getItem('loggedId');
            if (!token || !retailerId) {
                setMessage('No token or retailerId found');
                return;
            }
            const response = await axios.post(`${process.env.EXPO_BACKEND}/api/retailer/addusers`, { retailerId, email }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setMessage(`Plumber added successfully: ${response.data.user.email}`);
            // Alert.alert('Success', `User added successfully: ${response.data.user.email}`);
        } catch (error:any) {
            // console.error(error);
            
            Alert.alert('Error Occurred:\n Please check the entered mail ID');
        }
    };

    return (
        <>

        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Add New Plumber</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                    placeholder="Enter Plumber email"
                />
                <TouchableOpacity style={styles.button} onPress={handleAddUser}>
                    <Text style={styles.buttonText}>Add Plumber</Text>
                </TouchableOpacity>
                {message && (
                    <View style={styles.messageContainer}>
                        <Text>{message}</Text>
                    </View>
                )}
            </View>
        </View>
      </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
    },
    formContainer: {
        width: '90%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color:'#563e2b'
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 16,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
    },
    button: {
        backgroundColor: '#2a4853',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        color:'white'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    menu: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    messageContainer: {
        marginTop: 16,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#e5e7eb',
        alignItems: 'center',
    }
});

export default AddUserToRetailer;
