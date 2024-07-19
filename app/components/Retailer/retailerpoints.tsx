import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomDrawer from './CustomDrawer';

interface Transaction {
  date: string;
  type: string;
  points: number;
}

const RetailerPoints = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [pointsLeft, setPointsLeft] = useState<number>(0);
  const [pointsRedeemed, setPointsRedeemed] = useState<number>(0);
  const [pointsReceived, setPointsReceived] = useState<number>(0);
  const [last5Transactions, setLast5Transactions] = useState<Transaction[]>([]);
  const [couponCodes, setCouponCodes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(-300));

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const retailerId = await AsyncStorage.getItem('loggedId');
      if (!token || !retailerId) {
        console.error('No token or Id found');
        return;
      }
      const response = await axios.get('http://192.168.29.101:3000/api/retailer/points', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsername(response.data.username);
      setPointsLeft(response.data.pointsReceived - response.data.pointsRedeemed);
      setPointsRedeemed(response.data.pointsRedeemed);
      setPointsReceived(response.data.pointsReceived);
      setLast5Transactions(response.data.last5Entries);
      setCouponCodes(response.data.couponCodes); // Update state with coupon codes
    } catch (error) {
      // console.error('Error fetching points:', error);
      Alert.alert('Error fetching points');
    } finally {
      setLoading(false);
    }
  };

  const format12Hour = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionDate}>
        {new Date(item.date).toLocaleDateString()} • {format12Hour(item.date)}
      </Text>
      <Text style={styles.transactionDetails}>
        {item.type} • {item.points} points
      </Text>
    </View>
  );

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
    <>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
          <Text style={styles.drawerButtonText}>☰</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Welcome, {username}</Text>
        </View>

        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#007BFF" />
          ) : pointsLeft !== null ? (
            <>
              <View style={styles.cardsContainer}>
                <View style={[styles.card, styles.pointsLeft]}>
                  <Text style={styles.cardValue}>{pointsLeft}</Text>
                  <Text style={styles.cardLabel}>Points Left</Text>
                </View>
                <View style={[styles.card, styles.pointsRedeemed]}>
                  <Text style={styles.cardValue}>{pointsRedeemed}</Text>
                  <Text style={styles.cardLabel}>Points Redeemed</Text>
                </View>
                <View style={[styles.card, styles.pointsReceived]}>
                  <Text style={styles.cardValue}>{pointsReceived}</Text>
                  <Text style={styles.cardLabel}>Points Received</Text>
                </View>
              </View>

              <View style={styles.transactionsContainer}>
                <Text style={styles.transactionsTitle}>Last 5 Transactions</Text>
                <FlatList
                  data={last5Transactions}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
              
            </>
          ) : (
            <Text style={styles.noPointsText}>No points available</Text>
          )}
        </View>
      </SafeAreaView>

      <Animated.View style={[styles.drawerWrapper, { transform: [{ translateX: drawerAnim }] }]}>
        <CustomDrawer isOpen={isDrawerOpen} closeDrawer={closeDrawer} />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#007BFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cardsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  pointsLeft: {
    backgroundColor: '#3B82F6',
  },
  pointsRedeemed: {
    backgroundColor: '#10B981',
  },
  pointsReceived: {
    backgroundColor: '#EF4444',
  },
  couponCodes: {
    backgroundColor: '#FBBF24',
  },
  cardValue: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 5,
  },
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  transactionsTitle: {
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  transactionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 10,
  },
  transactionDate: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  transactionDetails: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  noPointsText: {
    fontSize: 18,
    color: '#EF4444',
    marginTop: 20,
    textAlign: 'center',
  },
  drawerButton: {
    position: 'absolute',
    top: 15,
    left: 10,
    zIndex: 10,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 10,
  },
  drawerButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  drawerWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 300,
    zIndex: 1000,
  },
  
});

export default RetailerPoints;
