import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Animated, Easing, TouchableOpacity,RefreshControl, Button } from 'react-native';
import axios from 'axios';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Define a type for the retailer object
interface Retailer {
  _id: string;
  name: string;
  email: string;
  pointsReceived: number;
}

const Dashboard = () => {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [manuId, setManuId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  // Fetch retailers on component mount
  useEffect(() => {
    fetchRetailers();
  }, []);

  const fetchRetailers = async () => {
    try {
      const fetchedToken = await AsyncStorage.getItem('token');
      const fetchedManuId = await AsyncStorage.getItem('loggedId');

      setToken(fetchedToken);
      setManuId(fetchedManuId);

      if (fetchedToken && fetchedManuId) {
        const response = await axios.get(`${process.env.EXPO_BACKEND}/api/retailer`, {
          headers: {
            Authorization: `Bearer ${fetchedToken}`,
          },
        });
        setRetailers(response.data);
      } else {
        setMessage('Token or Manufacturer ID is missing');
      }
    } catch (error:any) {
      // console.error('Error fetching retailers:', error);
      setMessage('Failed to fetch retailers');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  if (loading || !token || !manuId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }
  const onRefresh = () => {
    setIsRefreshing(true); // Set refreshing indicator
    fetchRetailers(); // Fetch data again
};


  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollViewContainer} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#34D399']} />}>
        <Text style={styles.title}>Retailers</Text>
        {message ? (
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message}</Text>
          </View>
        ) : (
          retailers.map(retailer => (
            <View key={retailer._id} style={styles.retailerCard}>
              <Text style={styles.retailerName}>{retailer.name}</Text>
              <Text style={styles.retailerInfo}>
                <Text style={styles.label}>Email:</Text> {retailer.email}
              </Text>
              <Text style={styles.retailerInfo}>
                <Text style={styles.label}>Points:</Text> {retailer.pointsReceived}
              </Text>
              <Link href={`/TransferPointsToRetailer/${retailer._id}`}>
                <Text style={styles.buttonText}>Transfer Points</Text>
              </Link>
            </View>
          ))
        )}
      </ScrollView>

    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  scrollViewContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#e9ecef',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#343a40',
  },
  messageContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#ffc107',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#343a40',
    fontSize: 16,
  },
  retailerCard: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#6c757d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  retailerName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#495057',
  },
  retailerInfo: {
    fontSize: 16,
    marginBottom: 4,
    color: '#6c757d',
  },
  label: {
    fontWeight: 'bold',
    color: '#495057',
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  buttonText: {
    color: '#007bff',
    fontWeight: 'bold',
    marginTop:5,
  },
  transferButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
});

export default Dashboard;
