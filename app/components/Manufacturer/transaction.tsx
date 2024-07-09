import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

        const response = await axios.get('http://192.0.0.2:3000/api/manufacturer/transactions', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setTransactions(response.data.transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
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
        <ActivityIndicator size="large" color="#007bff" />
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
          <Text style={styles.transactionText}><Text style={styles.label}>Invoice:</Text> {transaction.invoice_number}</Text>
          <Text style={styles.transactionText}><Text style={styles.label}>Bill Amount:</Text> {transaction.bill_amount}</Text>
          <Text style={styles.transactionText}><Text style={styles.label}>Points:</Text> {transaction.points}</Text>
          <Text style={styles.transactionText}><Text style={styles.label}>From ID:</Text> {transaction.from_id ?? 'N/A'}</Text>
          <Text style={styles.transactionText}><Text style={styles.label}>To ID:</Text> {transaction.to_id}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f7f9fc',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f9fc',
  },
  errorText: {
    color: '#ff4d4f',
    textAlign: 'center',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  transactionItem: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  transactionText: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 5,
  },
  label: {
    fontWeight: '600',
    color: '#1f2937',
  },
});

export default Transactions;
