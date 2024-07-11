// src/components/CustomDrawer.js
import { Link } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CustomDrawerProps {
  isOpen: boolean;
  closeDrawer: () => void;
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({ isOpen, closeDrawer }) => {
  return (
    <View style={[styles.drawerContainer, isOpen ? styles.open : styles.closed]}>
      <TouchableOpacity onPress={closeDrawer}>
        <Text style={styles.closeButton}>&#10006;</Text>
      </TouchableOpacity>
      <Link href="/components/Manufacturer/Dashboard" style={styles.link}>
        <Text style={styles.linkText}>Transfer Points</Text>
      </Link>
      <View style={styles.divider} />
      <Link href="/components/Manufacturer/RedemptionRequests" style={styles.link}>
        <Text style={styles.linkText}>Approve Retailer Redeem</Text>
      </Link>
      <View style={styles.divider} />
      <Link href="/components/Manufacturer/User_redemption_request" style={styles.link}>
        <Text style={styles.linkText}>Approve Plumber Redeem</Text>
      </Link>
      <View style={styles.divider} />
      <Link href="/components/Manufacturer/transaction" style={styles.link}>
        <Text style={styles.linkText}>Transactions</Text>
      </Link>
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: '#fff',
    zIndex: 1000,
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    transform: [{ translateX: -250 }],
  },
  open: {
    transform: [{ translateX: 0 }],
  },
  closed: {
    transform: [{ translateX: -250 }],
  },
  closeButton: {
    fontSize: 24,
    alignSelf: 'flex-start',
    marginTop:20,
  },
  link: {
    marginVertical: 10,
  },
  linkText: {
    fontSize: 15,
  },
  divider: {
    marginTop: 2,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
});

export default CustomDrawer;
