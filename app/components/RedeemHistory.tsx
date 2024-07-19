import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Animated, Easing, Button, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

import UserDrawer from './User/CustomDrawer';
import RetailerDrawer from './Retailer/CustomDrawer';
interface Transaction {
    date: string;
    type: string;
    points: number;
    expiryDate: string;
}

const RedeemHistory = () => {
    const [allEntries, setAllEntries] = useState<Transaction[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerAnim] = useState(new Animated.Value(-300));
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
    const [storedRole, setStoredRole] = useState('');
    useEffect(() => {
        fetchPoints();
    }, []);

    const fetchPoints = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const role = await AsyncStorage.getItem('role');
            if(role) setStoredRole(role);
            const retailerId = await AsyncStorage.getItem('loggedId');
            if (!token) {
                console.error('No token found');
                return;
            }
            let endpoint = '';
            if (role === 'user') {
                endpoint = 'http://192.168.29.101:3000/api/users/allentries';
            } else if (role === 'retailer') {
                endpoint = 'http://192.168.29.101:3000/api/retailer/allentries';
            } else {
                console.error('Invalid role');
                return;
            }
            const response = await axios.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const redeemedEntries = response.data.allEntries.filter((entry: Transaction) => entry.type === 'redeemed');
            setAllEntries(redeemedEntries);
            setFilteredEntries(redeemedEntries); // Initially set all entries as filtered entries
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
            toValue: -300,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start(() => setIsDrawerOpen(false));
    };

    const applyFilter = () => {
        if (!startDate || !endDate) {
            // Alert or handle empty date selection
            return;
        }

        const filtered = allEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startDate && entryDate <= endDate;
        });

        setFilteredEntries(filtered);
    };

    const getDrawerComponent = () => {
        switch (storedRole) {
          case 'user':
            return <UserDrawer isOpen={isDrawerOpen} closeDrawer={closeDrawer} />;
          case 'retailer':
            return <RetailerDrawer isOpen={isDrawerOpen} closeDrawer={closeDrawer} />;
          default:
            return null;
        }
      };
    return (
        <>
            <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
                <Text style={styles.buttonText}>Menu</Text>
            </TouchableOpacity>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Redeem History</Text>
                </View>
                <View style={styles.filterContainer}>
                    <View style={styles.datePickerContainer}>
                        <Button title="Start Date" onPress={() => setShowStartDatePicker(true)} />
                        {showStartDatePicker && (
                            <DateTimePicker
                                value={startDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowStartDatePicker(false);
                                    setStartDate(selectedDate || startDate);
                                }}
                            />
                        )}
                        {startDate && <Text style={styles.selectedDateText}>{startDate.toLocaleDateString()}</Text>}
                    </View>
                    <View style={styles.datePickerContainer}>
                        <Button title="End Date" onPress={() => setShowEndDatePicker(true)} />
                        {showEndDatePicker && (
                            <DateTimePicker
                                value={endDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowEndDatePicker(false);
                                    setEndDate(selectedDate || endDate);
                                }}
                            />
                        )}
                        {endDate && <Text style={styles.selectedDateText}>{endDate.toLocaleDateString()}</Text>}
                    </View>
                    <TouchableOpacity style={styles.filterButton} onPress={applyFilter}>
                        <Text style={styles.filterButtonText}>Apply Filter</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.content}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#6B7280" />
                    ) : (
                        <FlatList
                            data={filteredEntries}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={styles.listContainer}
                        />
                    )}
                </View>
            </SafeAreaView>
            <Animated.View style={[styles.drawerWrapper, { transform: [{ translateX: drawerAnim }] }]}>
        {getDrawerComponent()}
      </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        padding: 16,
        backgroundColor: '#1F2937',
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    listContainer: {
        paddingBottom: 20,
    },
    transactionItem: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    transactionDate: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    transactionDetails: {
        fontSize: 16,
        color: '#111827',
        fontWeight: 'bold',
    },
    drawerButton: {
        backgroundColor: '#1F2937',
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#374151',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    drawerWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        backgroundColor: '#FFFFFF',
        zIndex: 1000,
        borderRightWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 10,
    },
    datePickerContainer: {
        alignItems: 'center',
    },
    selectedDateText: {
        marginTop: 5,
        fontSize: 14,
        color: '#111827',
    },
    filterButton: {
        backgroundColor: '#1F2937',
        padding: 10,
        borderRadius: 8,
    },
    filterButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default RedeemHistory;