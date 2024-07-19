import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
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
        'http://192.168.29.101:3000/api/manufacturer/transfer-points',
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
        Alert.alert('Success', 'Points transferred successfully!');
      } else {
        setError('Failed to transfer points');
      }
    } catch (error) {
      // console.error('Error transferring points:', error);
      setError('Error transferring points. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transfer Points</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {successMessage && <Text style={styles.success}>{successMessage}</Text>}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Retailer ID</Text>
        <TextInput style={[styles.input, styles.disabledInput]} value={retailerId} editable={false} />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Points</Text>
        <TextInput
          style={styles.input}
          value={points}
          onChangeText={setPoints}
          keyboardType="numeric"
          placeholder="Enter points"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Invoice Number</Text>
        <TextInput
          style={styles.input}
          value={invoiceNumber}
          onChangeText={setInvoiceNumber}
          placeholder="Enter invoice number"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Bill Amount</Text>
        <TextInput
          style={styles.input}
          value={billAmount}
          onChangeText={setBillAmount}
          keyboardType="numeric"
          placeholder="Enter bill amount"
        />
      </View>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.buttonText}>Transfer Points</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f7',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    textAlign: 'center',
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#e9ecef',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransferPointsToRetailer;
