import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

const CouponCodes = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [couponCodes, setCouponCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const role = await AsyncStorage.getItem('role');
      const endpoint = role === 'retailer'
        ? `${process.env.EXPO_BACKEND}/api/retailer/points`
        : `${process.env.EXPO_BACKEND}/api/users/points`;
  
      if (!token || !role) {
        console.log('No token or role found');
        return;
      }
  
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  

      setUsername(response.data.username);
      setCouponCodes(response.data.couponCodes);

    } catch (error) {
      // console.error('Error fetching points:', error);
      Alert.alert('Error fetching points');
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
    <View style={styles.container}>
        <Text style={styles.headerTitle}>Welcome, {username}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <View style={styles.couponCodesContainer}>
            <Text style={styles.couponCodesTitle}>Coupon Codes</Text>
            {couponCodes.length > 0 ? (
              couponCodes.map((code, index) => (
                <View key={index} style={styles.couponCodeItem}>
                  <Text style={styles.couponCodeText}>{code}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noCouponText}>No Coupon Codes Available</Text>
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuButton: {
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  couponCodesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  couponCodesTitle: {
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  couponCodeItem: {
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  couponCodeText: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  noCouponText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
  },

});

export default CouponCodes;