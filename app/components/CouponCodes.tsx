import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, Dimensions, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import UserDrawer from './User/CustomDrawer';
import RetailerDrawer from './Retailer/CustomDrawer';

const CouponCodes = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [couponCodes, setCouponCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(-300));
  const [drawerComponent, setDrawerComponent] = useState<JSX.Element | null>(null);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const role = await AsyncStorage.getItem('role');
      const endpoint = role === 'retailer'
        ? 'http://192.168.29.101:3000/api/retailer/points'
        : 'http://192.168.29.101:3000/api/users/points';
  
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

      // Set drawer component based on role
      if (role === 'user') {
        setDrawerComponent(<UserDrawer isOpen={isDrawerOpen} closeDrawer={closeDrawer} />);
      } else if (role === 'retailer') {
        setDrawerComponent(<RetailerDrawer isOpen={isDrawerOpen} closeDrawer={closeDrawer} />);
      }
    } catch (error) {
      // console.error('Error fetching points:', error);
      Alert.alert('Error fetching points');
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
        toValue: -300,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
    }).start(() => setIsDrawerOpen(false));
};

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
          <FontAwesome name="bars" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Welcome, {username}</Text>
      </View>

      {/* Content */}
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

      {/* Drawer */}
      {drawerComponent && (
        <Animated.View style={[styles.drawerWrapper, { transform: [{ translateX: drawerAnim }] }]}>
          {drawerComponent}
        </Animated.View>
      )}
    </View>
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
  drawerWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    // width: Dimensions.get('window').width * 0.8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000,
  },
});

export default CouponCodes;