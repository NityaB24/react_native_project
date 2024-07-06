import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, SafeAreaView ,TouchableOpacity,Animated,Easing} from 'react-native';
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
    const [loading, setLoading] = useState<boolean>(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerAnim] = useState(new Animated.Value(-250));
    useEffect(() => {
        fetchPoints();
    }, []);

    const fetchPoints = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }
            const response = await axios.get('http://192.0.0.2:3000/api/retailer/points', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsername(response.data.username);
            setPointsLeft(response.data.pointsReceived - response.data.pointsRedeemed);
            setPointsRedeemed(response.data.pointsRedeemed);
            setPointsReceived(response.data.pointsReceived);
            setLast5Transactions(response.data.last5Entries);
        } catch (error) {
            console.error('Error fetching points:', error);
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
            <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()} • {format12Hour(item.date)}</Text>
            <Text style={styles.transactionDetails}>{item.type} • {item.points} points</Text>
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
          toValue: -250,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }).start(() => setIsDrawerOpen(false));
      };

    return (
        <>
        <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
        <Text style={styles.buttonText}>Menu</Text>
      </TouchableOpacity>
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome {username}</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#6B7280" />
                ) : pointsLeft !== null ? (
                    <View style={styles.pointsContainer}>
                        <View style={styles.pointBox}>
                            <Text style={styles.pointValue}>{pointsLeft}</Text>
                            <Text style={[styles.pointLabel, styles.pointsLeftLabel]}>Points Left</Text>
                        </View>
                        <View style={styles.pointBox}>
                            <Text style={styles.pointValue}>{pointsRedeemed}</Text>
                            <Text style={[styles.pointLabel, styles.pointsRedeemedLabel]}>Points Redeemed</Text>
                        </View>
                        <View style={styles.pointBox}>
                            <Text style={styles.pointValue}>{pointsReceived}</Text>
                            <Text style={[styles.pointLabel, styles.pointsReceivedLabel]}>Points Received</Text>
                        </View>
                        <View style={styles.transactionsContainer}>
                            <Text style={styles.transactionsTitle}>Last 5 Transactions</Text>
                            <FlatList
                                data={last5Transactions}
                                renderItem={renderItem}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>
                    </View>
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
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
        color: '#111827',
    },
    pointsContainer: {
        width: '100%',
        alignItems: 'center',
    },
    pointBox: {
        backgroundColor: '#4B5563',
        paddingVertical: 20,
        paddingHorizontal: 24,
        marginBottom: 16,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    pointValue: {
        fontSize: 28,
        color: '#D1D5DB',
        fontWeight: '600',
    },
    pointLabel: {
        fontSize: 18,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    pointsLeftLabel: {
        color: '#3B82F6',
    },
    pointsRedeemedLabel: {
        color: '#10B981',
    },
    pointsReceivedLabel: {
        color: '#EF4444',
    },
    transactionsContainer: {
        backgroundColor: '#374151',
        padding: 16,
        marginTop: 20,
        borderRadius: 12,
        width: '100%',
    },
    transactionsTitle: {
        fontSize: 20,
        color: '#8B5CF6',
        marginBottom: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    transactionItem: {
        marginBottom: 12,
    },
    transactionDate: {
        fontSize: 14,
        color: '#D1D5DB',
        textAlign: 'center',
    },
    transactionDetails: {
        fontSize: 16,
        color: '#D1D5DB',
        textAlign: 'center',
    },
    noPointsText: {
        fontSize: 18,
        color: '#EF4444',
        marginTop: 20,
        textAlign: 'center',
    },
    buttonText: {
        color: 'black',
        fontWeight: 'bold',
      },
      drawerButton: {
        backgroundColor: 'white',
        padding: 15,
        borderBottomWidth:1,
        borderColor:'black',
        alignItems: 'center',
        marginTop: 0,
      },
      drawerWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 250,
        zIndex: 1000,
      },
});

export default RetailerPoints;