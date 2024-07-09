import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabTwoScreen() {
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [retailerId, setRetailerId] = useState('');
  const [manuId, setManuId] = useState('');

  // Function to load token and IDs from AsyncStorage
  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      const retailerId = await AsyncStorage.getItem('retailerId');
      const manuId = await AsyncStorage.getItem('manuId');

      console.log('Token:', token);
    console.log('UserId:', userId);
    console.log('RetailerId:', retailerId);
    console.log('ManuId:', manuId);

      setToken(token || '');
      setUserId(userId || '');
      setRetailerId(retailerId || '');
      setManuId(manuId || '');
    } catch (error) {
      console.error('Error loading user data:', error);
      // Handle error loading data from AsyncStorage
    }
  };

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="code-slash" style={styles.headerImage} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>

      {/* Always show User Routes */}
      {token && userId && (
      <Collapsible title="User Routes">
        <Link href="/components/User/userpoints">
          <ThemedText type="link">Check User Points</ThemedText>
        </Link>
        <Link href="/components/User/RedeemptionForm">
          <ThemedText type="link">Redeem Points</ThemedText>
        </Link>
      </Collapsible>)}

      {/* Conditionally render Retailer Routes */}
      {/* {token && retailerId && ( */}
        <Collapsible title="Retailer Routes">
          <Link href="/components/Retailer/retailer">
            <ThemedText type="link">Login retailer</ThemedText>
          </Link>
          <Link href="/components/Retailer/retailerpoints">
            <ThemedText type="link">Check points</ThemedText>
          </Link>
          <Link href="/components/Retailer/RetailerRedeem">
            <ThemedText type="link">Redeem points</ThemedText>
          </Link>
          <Link href="/components/Retailer/AddUserToRetailer">
            <ThemedText type="link">Add New User</ThemedText>
          </Link>
          <Link href="/components/Retailer/RetailerUsers">
            <ThemedText type="link">All users</ThemedText>
          </Link>
          <Link href="/components/Retailer/retailerHistory">
            <ThemedText type="link">History</ThemedText>
          </Link>
        </Collapsible>
      {/* )} */}

      {/* Conditionally render Manufacturer Routes */}
      {/* {token && manuId && ( */}
        <Collapsible title="Manufacturer Routes">
          <Link href="/components/Manufacturer/login">
            <ThemedText type="link">Login manufacturer</ThemedText>
          </Link>
          <Link href="/components/Manufacturer/Dashboard">
            <ThemedText type="link">Dashboard</ThemedText>
          </Link>
          <Link href="/components/Manufacturer/RedemptionRequests">
            <ThemedText type="link">Approve Redeem</ThemedText>
          </Link>
          <Link href="/components/Manufacturer/User_redemption_request">
            <ThemedText type="link">Approve User Redeem</ThemedText>
          </Link>
          <Link href="/components/Manufacturer/transaction">
            <ThemedText type="link">Transactions</ThemedText>
          </Link>
        </Collapsible>
      {/* )} */}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
