import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useRoute,RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RouteParams {
    userId: string;
}
const TransferPointsToUser = () => {
    const [retailerId, setRetailerId] = useState<string>('');
    const [userId, setUserId] = useState('');
    const [points, setPoints] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [billAmount, setBillAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { userId: routeUserId } = route.params;


    useEffect(() => {
        const fetchIds = async () => {
            const retailerId = await AsyncStorage.getItem('retailerId');
            setRetailerId(retailerId ?? ''); // Replace with actual logic to get the logged-in retailer ID
            setUserId(routeUserId);
        };

        fetchIds();
    }, [routeUserId]);

    const handleSubmit = async () => {
        setLoading(true);

        try {
            await axios.post('http://192.0.0.2:3000/api/retailer/transfer-points', {
                retailerId,
                userId,
                points: parseInt(points),
                invoice_number: invoiceNumber,
                bill_amount: parseFloat(billAmount),
            });

            setSuccessMessage('Points transferred successfully!');
            setLoading(false);
            setError(null);
        } catch (error) {
            setLoading(false);
            console.error
            ('Insufficient Points');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Transfer Points to User</Text>
            {error && <Text style={styles.error}>{error}</Text>}
            {successMessage && <Text style={styles.success}>{successMessage}</Text>}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Retailer ID</Text>
                <TextInput
                    style={styles.input}
                    value={retailerId}
                    onChangeText={setRetailerId}
                    editable={false}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>User ID</Text>
                <TextInput
                    style={styles.input}
                    value={userId}
                    onChangeText={setUserId}
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

export default TransferPointsToUser;
