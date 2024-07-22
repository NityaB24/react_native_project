import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RouteParams {
  userId: string;
}

const TransferPointsToUser = () => {
  const [retailerId, setRetailerId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [points, setPoints] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [billAmount, setBillAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { userId: routeUserId } = route.params;

  useEffect(() => {
    const fetchIdsAndKycStatus = async () => {
      const retailerId = await AsyncStorage.getItem('loggedId');
      setRetailerId(retailerId ?? '');
      setUserId(routeUserId);

      try {
        const response = await axios.get(`${process.env.EXPO_BACKEND}/api/retailer/kyc/status`, {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
          },
        });

        setKycStatus(response.data.status);
      } catch (error:any) {
        setError('Failed to fetch KYC status');
      }
    };

    fetchIdsAndKycStatus();
  }, [routeUserId]);

  const handleSubmit = async () => {
    const trimmedPoints = points.trim();
    const trimmedInvoiceNumber = invoiceNumber.trim();
    const trimmedBillAmount = billAmount.trim();

    if (!trimmedPoints || !trimmedInvoiceNumber || !trimmedBillAmount) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (parseInt(trimmedPoints) > parseFloat(trimmedBillAmount)) {
      setError('Points cannot be greater than bill amount');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${process.env.EXPO_BACKEND}/api/retailer/transfer-points`, {
        retailerId,
        userId,
        points: parseInt(trimmedPoints),
        invoice_number: trimmedInvoiceNumber,
        bill_amount: parseFloat(trimmedBillAmount),
      });

      setSuccessMessage('Points transferred successfully!');
      setPoints('');
    setInvoiceNumber('');
    setBillAmount('');
    } catch (error:any) {
      setError('Insufficient points');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const retailerId = await AsyncStorage.getItem('loggedId');
      setRetailerId(retailerId ?? '');
      setUserId(routeUserId);

      const response = await axios.get(`${process.env.EXPO_BACKEND}/api/kyc/status`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
        },
      });

      setKycStatus(response.data.status);
    } catch (error:any) {
      console.error('Error while refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [routeUserId]);

  const isButtonDisabled =
    loading || !points.trim() || !invoiceNumber.trim() || !billAmount.trim();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007BFF']}
              tintColor="#007BFF"
            />
          }
        >
          <View style={styles.inner}>
            <Text style={styles.title}>Transfer Points to User</Text>
            {error && <Text style={styles.error}>{error}</Text>}
            {successMessage && <Text style={styles.success}>{successMessage}</Text>}
            
            {kycStatus === 'pending' && (
              <Text style={styles.warning}>Your KYC is pending. You cannot transfer points until it is approved.</Text>
            )}
            {kycStatus === 'rejected' && (
              <Text style={styles.warning}>Your KYC was rejected. You cannot transfer points.</Text>
            )}

            {kycStatus === 'approved' && (
              <>
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
                    keyboardType="number-pad"
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
                    keyboardType="number-pad"
                    />
                </View>
                <TouchableOpacity
                  style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={isButtonDisabled}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.buttonText}>Transfer Points</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  inner: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-around',
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
  warning: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
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
