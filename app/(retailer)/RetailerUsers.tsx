import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';

interface User {
    _id: string;
    name: string;
    email: string;
    points: number;
}

const RetailerUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false); // State for pull-to-refresh

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const retailerId = await AsyncStorage.getItem('loggedId');
            if (!token || !retailerId) {
                setMessage('No token or retailerId found');
                return;
            }
            const response = await axios.get(`${process.env.EXPO_BACKEND}/api/retailer/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data.users);
        } catch (error:any) {
            setMessage('Error fetching users');
        } finally {
            setLoading(false);
            setIsRefreshing(false); // Turn off refreshing indicator
        }
    };

    const onRefresh = () => {
        setIsRefreshing(true); // Set refreshing indicator
        fetchUsers(); // Fetch users again
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={['#1A73E8']} // Customize the colors of the refresh indicator
                    />
                }
            >
                <Text style={styles.title}>Plumbers</Text>
                {loading && <ActivityIndicator size="large" color="#0000ff" />}
                {message ? (
                    <View style={styles.messageContainer}>
                        <Text style={styles.message}>{message}</Text>
                    </View>
                ) : (
                    users.map(user => (
                        <View key={user._id} style={styles.userCard}>
                            <Text style={styles.username}>{user.name}</Text>
                            <Text style={styles.userInfo}>
                                <Text style={styles.label}>Email:</Text> {user.email}
                            </Text>
                            <Text style={styles.userInfo}>
                                <Text style={styles.label}>Points:</Text> {user.points}
                            </Text>
                            <View style={styles.buttonContainer}>
                                <Link href={`/TransferPointsToUser/${user._id}`} style={styles.button}>
                                    <Text style={styles.buttonText}>Transfer Points</Text>
                                </Link>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollViewContent: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#1F2937',
    },
    messageContainer: {
        marginTop: 20,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
    },
    message: {
        textAlign: 'center',
        color: 'red',
    },
    userCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    userInfo: {
        fontSize: 16,
        marginBottom: 4,
        color: '#555',
    },
    label: {
        fontWeight: 'bold',
        color: '#555',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        flex: 1,
        backgroundColor: '#1A73E8',
        padding: 10,
        alignItems: 'center',
        marginRight: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        alignItems:'center',
        justifyContent:'center'
    },
});

export default RetailerUsers;
