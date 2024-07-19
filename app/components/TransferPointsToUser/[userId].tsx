import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, Animated, Easing, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRoute, RouteProp } from '@react-navigation/native';
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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { userId: routeUserId } = route.params;

  useEffect(() => {
    const fetchIds = async () => {
      const retailerId = await AsyncStorage.getItem('loggedId');
      setRetailerId(retailerId ?? '');
      setUserId(routeUserId);
    };

    fetchIds();
  }, [routeUserId]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await axios.post('http://192.168.29.101:3000/api/retailer/transfer-points', {
        retailerId,
        userId,
        points: parseInt(points),
        invoice_number: invoiceNumber,
        bill_amount: parseFloat(billAmount),
      });

      setSuccessMessage('Points transferred successfully!');
    } catch (error) {
      setError('Insufficient Points');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transfer Points to User</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {successMessage && <Text style={styles.success}>{successMessage}</Text>}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Retailer ID</Text>
        <TextInput style={styles.input} value={retailerId} editable={false} />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>User ID</Text>
        <TextInput style={styles.input} value={userId} editable={false} />
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
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Transfer Points</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  drawerButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1F2937',
  },
  error: {
    backgroundColor: '#F8D7DA',
    color: '#721C24',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
    textAlign: 'center',
  },
  success: {
    backgroundColor: '#D4EDDA',
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
    color: '#1F2937',
  },
  input: {
    height: 40,
    borderColor: '#CBD5E0',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TransferPointsToUser;
