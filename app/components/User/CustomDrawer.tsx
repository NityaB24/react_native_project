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
        <Text style={styles.closeButton}>X</Text>
      </TouchableOpacity>
      <Link href="/components/User/userpoints" style={styles.link}>
        <Text style={styles.linkText}>Check Points</Text>
      </Link>
      <View style={styles.divider} />
      <Link href="/components/User/RedeemptionForm" style={styles.link}>
        <Text style={styles.linkText}>Redeem Points</Text>
      </Link>
      <View style={styles.divider} />
      {/* Add more content below the divider if needed */}
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
    alignSelf: 'flex-end',
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
