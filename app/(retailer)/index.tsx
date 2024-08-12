import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, SafeAreaView, RefreshControl, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Transaction {
  date: string;
  type: string;
  points: number;
}

const RetailerPoints = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [pointsLeft, setPointsLeft] = useState<number>(0);
  const [pointsRedeemed, setPointsRedeemed] = useState<number>(0);
  const [pointsSent, setPointsSent] = useState<number>(0);
  const [pointsReceived, setPointsReceived] = useState<number>(0);
  const [pointsExpiry, setPointsExpiry] = useState<number>(0);
  const [last5Transactions, setLast5Transactions] = useState<Transaction[]>([]);
  const [couponCodes, setCouponCodes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false); 
  const [kycStatus, setKycStatus] = useState<string | null>(null);

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
      const response = await axios.get(`${process.env.EXPO_BACKEND}/api/retailer/points`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsername(response.data.username);
      setPointsLeft(response.data.pointsReceived - response.data.pointsSent);
      setPointsRedeemed(response.data.pointsRedeemed);
      setPointsSent(response.data.pointsSent);
      setPointsReceived(response.data.pointsReceived);
      setPointsExpiry(response.data.expiringPoints);
      setLast5Transactions(response.data.last5Entries);
      setCouponCodes(response.data.couponCodes); 
      setKycStatus(response.data.kycStatus); 
    } catch (error) {
      console.error('Error fetching points:', error);
      Alert.alert('Error fetching points');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const today = new Date();
  const expiryDate = new Date(today);
  expiryDate.setDate(today.getDate() + 45);
  const formattedToday = formatDate(today);
  const formattedExpiryDate = formatDate(expiryDate);

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
      {item.type === 'received' && (
            <>
            <Text style={styles.transactionDetails}>
                        {item.type}  +{item.points} points
                    </Text>
            </>
            )}
            {(item.type === 'sent' || item.type === 'redeemed') && (
                <Text style={styles.transactionDetails}>
                    {item.type}  -{item.points} points
                </Text>
            )}
    </View>
  );

  const onRefresh = () => {
    setIsRefreshing(true); 
    fetchPoints(); 
  };

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {username}</Text>
      </View>
      {kycStatus === 'pending' && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>Your KYC is pending. Some features may be restricted.</Text>
        </View>
      )}
      {kycStatus === 'rejected' && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>Your KYC is rejected. Please submit the request again.</Text>
        </View>
      )}
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
                <Text style={styles.cardValue}>{pointsSent}</Text>
                <Text style={styles.cardLabel}>Points Transferred</Text>
              </View>
              <View style={[styles.card, styles.pointsExpiring]}>
                <Text style={styles.cardValue}>{pointsExpiry}</Text>
                <Text style={styles.cardLabel}>Points Expiring Soon</Text>
                <Text style={styles.dateRange}>
                  From {formattedToday} to {formattedExpiryDate}
                </Text>
              </View>
              <View style={[styles.card, styles.pointsReceived]}>
                <Text style={styles.cardValue}>{pointsReceived}</Text>
                <Text style={styles.cardLabel}>Points Received</Text>
              </View>
            </View>
            <View style={styles.transactionsContainer}>
              <Text style={styles.transactionsTitle}>Last 5 Transactions</Text>
            </View>
          </>
        ) : (
          <Text style={styles.noPointsText}>No points available</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={last5Transactions}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#1F2937']} 
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    backgroundColor: '#4C51BF',
    paddingVertical: 25,
    paddingHorizontal: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  warningContainer: {
    backgroundColor: '#FED7D7',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginVertical: 15,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#FC8181',
  },
  warningText: {
    color: '#C53030',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
  },
  cardsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  card: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  pointsLeft: {
    backgroundColor: '#4FD1C5',
  },
  pointsRedeemed: {
    backgroundColor: '#68D391',
  },
  pointsExpiring: {
    backgroundColor: '#F6AD55',
  },
  pointsReceived: {
    backgroundColor: '#FC8181',
  },
  cardValue: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cardLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 5,
    fontWeight: '500',
  },
  dateRange: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 5,
  },
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333333',
  },
  transactionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  transactionDate: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  transactionDetails: {
    fontSize: 16,
    color: '#2D3748',
    textAlign: 'center',
    marginTop: 5,
  },
  noPointsText: {
    fontSize: 18,
    color: '#F56565',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default RetailerPoints;
