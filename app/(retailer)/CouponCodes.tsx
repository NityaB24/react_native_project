import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CouponCodes = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [couponCodes, setCouponCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const role = await AsyncStorage.getItem('role');
      const endpoint = `${process.env.EXPO_BACKEND}/api/retailer/points`;
  
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
      Alert.alert('Error fetching points');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchPoints();
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#34D399']} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#34D399" />
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
  header: {
    backgroundColor: '#007BFF',
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  couponCodesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  couponCodesTitle: {
    fontSize: 22,
    color: '#2a4853',
    marginBottom: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  couponCodeItem: {
    backgroundColor: 'lightgrey',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  couponCodeText: {
    fontSize: 18,
    color: '#2a4853',
    textAlign: 'center',
  },
  noCouponText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CouponCodes;
