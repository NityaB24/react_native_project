import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RouteParams {
    retailerId: string;
}

const TransferPointsToRetailer = () => {
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { retailerId } = route.params;

    const [points, setPoints] = useState<string>('');
    const [invoiceNumber, setInvoiceNumber] = useState<string>('');
    const [billAmount, setBillAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('');

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setError('No token found');
                setLoading(false);
                return;
            }

            const response = await axios.post(
                'http://exp://127.0.0.1:8081:3000/api/manufacturer/transfer-points',
                {
                    retailerId,
                    points: parseInt(points),
                    invoice_number: invoiceNumber,
                    bill_amount: parseFloat(billAmount),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                setSuccessMessage('Points transferred successfully!');
                setError(null);
            } else {
                setError('Failed to transfer points');
            }
        } catch (error) {
            console.error('Error transferring points:', error);
            setError('Error transferring points. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Transfer Points to Retailer</Text>
            {error && <Text style={styles.error}>{error}</Text>}
            {successMessage && <Text style={styles.success}>{successMessage}</Text>}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Retailer ID</Text>
                <TextInput
                    style={styles.input}
                    value={retailerId}
                    editable={false}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Points</Text>
                <TextInput
                    style={styles.input}
                    value={points}
                    onChangeText={setPoints}
                    keyboardType="numeric"
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Invoice Number</Text>
                <TextInput
                    style={styles.input}
                    value={invoiceNumber}
                    onChangeText={setInvoiceNumber}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Bill Amount</Text>
                <TextInput
                    style={styles.input}
                    value={billAmount}
                    onChangeText={setBillAmount}
                    keyboardType="numeric"
                />
            </View>
            <Button
                title={loading ? 'Transferring...' : 'Transfer Points'}
                onPress={handleSubmit}
                disabled={loading}
                color="#1f2937"
            />
            {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f3f4f6',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    error: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: 10,
        borderRadius: 4,
        marginBottom: 10,
        textAlign: 'center',
    },
    success: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: 10,
        borderRadius: 4,
        marginBottom: 10,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
    },
    loader: {
        marginTop: 20,
    },
});

export default TransferPointsToRetailer;
