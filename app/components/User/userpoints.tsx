import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, SafeAreaView,TouchableOpacity,Animated,Easing, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomDrawer from './CustomDrawer';


// Define the transaction type
interface Transaction {
    date: string;
    type: string;
    points: number;
}

const userpoints = () => {
    const [username, setUsername] = useState<string | null>(null);
    const [coupon, setCoupon] = useState<string | null>(null);
    const [points, setPoints] = useState<number | null>(null);
    const [pointsRedeemed, setPointsRedeemed] = useState<number | null>(null);
    const [pointsReceived, setPointsReceived] = useState<number | null>(null);
    const [last5Transactions, setLast5Transactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerAnim] = useState(new Animated.Value(-250));
    
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
  
    

    useEffect(() => {
        fetchPoints();
    }, []);

    const fetchPoints = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token'); // Fetch token from AsyncStorage
            if (!token) {
                console.error('No token found');
                return;
            }
            const response = await axios.get('http://192.168.29.101:3000/api/users/points', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsername(response.data.name);
            setCoupon(response.data.couponCodes)
            setPoints(response.data.pointsReceived -response.data.pointsRedeemed);
            setPointsRedeemed(response.data.pointsRedeemed);
            setPointsReceived(response.data.pointsReceived);
            setLast5Transactions(response.data.last5Entries);
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
            hour12: true
        });
    };

    const renderItem = ({ item }: { item: Transaction }) => (
        <View style={styles.transactionItem}>
            <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()} , {format12Hour(item.date)}</Text>
            <Text style={styles.transactionDetails}>{item.type} {item.points} points</Text>
        </View>
    );

    return (
        <>
    {/* <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
        <Text style={styles.buttonText}>Menu</Text>
      </TouchableOpacity> */}
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
          ) : points !== null ? (
            <>
              <View style={styles.cardsContainer}>
                <View style={[styles.card, styles.pointsLeft]}>
                  <Text style={styles.cardValue}>{points}</Text>
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
      zIndex: 100, // Increase zIndex to ensure it's above other elements
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
      zIndex: 1001,
    },
  });

export default userpoints;
