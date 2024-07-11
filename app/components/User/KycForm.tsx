import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KYCForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        front: '',
        back: '',
        profilePhoto: '',
        panCard: '',
        name: '',
        currentAddress: '',
        city: '',
        state: '',
        phoneNumber: '',
        emailAddress: ''
    });
    const [message, setMessage] = useState('');

    const handleSubmit = async () => {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');

        try {
            if (step === 1) {
                await axios.post('http://192.0.0.2/api/kyc/address-proof', { userId, front: formData.front, back: formData.back }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                setMessage('Address proof updated successfully');
                setStep(2);
            } else if (step === 2) {
                await axios.post('http://192.0.0.2/api/kyc/profile-photo', { userId, profilePhoto: formData.profilePhoto }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                setMessage('Profile photo updated successfully');
                setStep(3);
            } else if (step === 3) {
                await axios.post('http://192.0.0.2/api/kyc/pan-card', { userId, panCard: formData.panCard }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                setMessage('PAN card updated successfully');
                setStep(4);
            } else if (step === 4) {
                await axios.post('http://192.0.0.2/api/kyc/update-address', { userId, ...formData }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                setMessage('KYC process completed successfully');
            }
        } catch (error) {
            setMessage('error');
            
            
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.form}>
                <Text style={styles.title}>KYC Process</Text>
                {step === 1 && (
                    <>
                        <TextInput
                            style={styles.input}
                            value={formData.front}
                            onChangeText={(text) => setFormData({ ...formData, front: text })}
                            placeholder="Front side of Aadhar card"
                        />
                        <TextInput
                            style={styles.input}
                            value={formData.back}
                            onChangeText={(text) => setFormData({ ...formData, back: text })}
                            placeholder="Back side of Aadhar card"
                        />
                    </>
                )}
                {step === 2 && (
                    <TextInput
                        style={styles.input}
                        value={formData.profilePhoto}
                        onChangeText={(text) => setFormData({ ...formData, profilePhoto: text })}
                        placeholder="Profile photo URL"
                    />
                )}
                {step === 3 && (
                    <TextInput
                        style={styles.input}
                        value={formData.panCard}
                        onChangeText={(text) => setFormData({ ...formData, panCard: text })}
                        placeholder="PAN card number"
                    />
                )}
                {step === 4 && (
                    <>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Name"
                        />
                        <TextInput
                            style={styles.input}
                            value={formData.currentAddress}
                            onChangeText={(text) => setFormData({ ...formData, currentAddress: text })}
                            placeholder="Current address"
                        />
                        <TextInput
                            style={styles.input}
                            value={formData.city}
                            onChangeText={(text) => setFormData({ ...formData, city: text })}
                            placeholder="City"
                        />
                        <TextInput
                            style={styles.input}
                            value={formData.state}
                            onChangeText={(text) => setFormData({ ...formData, state: text })}
                            placeholder="State"
                        />
                        <TextInput
                            style={styles.input}
                            value={formData.phoneNumber}
                            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                            placeholder="Phone number"
                        />
                        <TextInput
                            style={styles.input}
                            value={formData.emailAddress}
                            onChangeText={(text) => setFormData({ ...formData, emailAddress: text })}
                            placeholder="Email address"
                        />
                    </>
                )}
                <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                    <Text style={styles.buttonText}>{step === 4 ? 'Complete KYC' : 'Next'}</Text>
                </TouchableOpacity>
                {message && (
                    <View style={styles.messageContainer}>
                        <Text style={styles.message}>{message}</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#f3f4f6',
    },
    form: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    button: {
        backgroundColor: '#1f2937',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    messageContainer: {
        marginTop: 20,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    message: {
        textAlign: 'center',
        color: 'red',
    },
});

export default KYCForm;
