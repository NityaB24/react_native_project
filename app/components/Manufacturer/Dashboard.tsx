import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Animated, Easing, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomDrawer from './CustomDrawer';
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(-250));
  const [token, setToken] = useState<string | null>(null);
  const [manuId, setManuId] = useState<string | null>(null);

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
        const response = await axios.get('http://192.168.29.101:3000/api/retailer', {
          headers: {
            Authorization: `Bearer ${fetchedToken}`,
          },
        });
        setRetailers(response.data);
      } else {
        setMessage('Token or Manufacturer ID is missing');
      }
    } catch (error) {
      // console.error('Error fetching retailers:', error);
      setMessage('Failed to fetch retailers');
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: -250,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => setIsDrawerOpen(false));
  };

  if (loading || !token || !manuId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
        <Text style={styles.buttonText}>Menu</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
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
              <Link href={`/components/Manufacturer/TransferPointsToRetailer/${retailer._id}`}>
                <Text style={styles.linkText}>Transfer Points</Text>
              </Link>
            </View>
          ))
        )}
      </ScrollView>
      <Animated.View style={[styles.drawerWrapper, { transform: [{ translateX: drawerAnim }] }]}>
        {/* Assuming you have a CustomDrawer component */}
        <CustomDrawer isOpen={isDrawerOpen} closeDrawer={closeDrawer} />
      </Animated.View>
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
  drawerButton: {
    backgroundColor: '#007bff',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#0056b3',
  },
  drawerWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 250,
    zIndex: 1000,
    backgroundColor: '#343a40',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Dashboard;
