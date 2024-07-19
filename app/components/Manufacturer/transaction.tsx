import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';

interface Transaction {
  _id: string;
  invoice_number: string;
  bill_amount: number;
  points: number;
  from_id: string | null;
  to_id: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setError('No token found');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://192.168.29.101:3000/api/manufacturer/transactions', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setTransactions(response.data.transactions);
      } catch (error) {
        // console.error('Error fetching transactions:', error);
        setError('Error fetching transactions. Please check console for details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      {transactions.map((transaction) => (
        <View key={transaction._id} style={styles.transactionItem}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionNumber}>
              <FontAwesome6 name="receipt" size={15} color="#fff" /> {transaction.invoice_number}
            </Text>
          </View>
          <View style={styles.transactionDetails}>
            <View style={styles.transactionRow}>
              <Text style={styles.label}>Bill Amount:</Text>
              <Text style={styles.transactionText}>₹{transaction.bill_amount}</Text>
            </View>
            <View style={styles.transactionRow}>
              <Text style={styles.label}>Points:</Text>
              <Text style={styles.transactionText}>{transaction.points}</Text>
            </View>
            <View style={styles.transactionRow}>
              <Text style={styles.label}>From:</Text>
              <Text style={styles.transactionText}>{transaction.from_id ?? 'N/A'}</Text>
            </View>
            <View style={styles.transactionRow}>
              <Text style={styles.label}>To:</Text>
              <Text style={styles.transactionText}>{transaction.to_id}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f0f5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f5',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    fontSize: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#563e2b',
    marginBottom: 20,
    textAlign: 'center',
  },
  transactionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  transactionHeader: {
    backgroundColor: '#2a4853',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDetails: {
    padding: 20,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  transactionText: {
    fontSize: 16,
    color: '#000',
  },
  transactionNumber: {
    fontSize: 16,
    color: '#fff',
  },
  label: {
    fontWeight: '600',
    color: '#563e2b',
    // color: '#c99d5b',
  },
});

export default Transactions;
