import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Animated, Easing, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Link } from 'expo-router';
import CustomDrawer from './CustomDrawer';

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
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerAnim] = useState(new Animated.Value(-300));

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
            const response = await axios.get('http://192.168.29.101:3000/api/retailer/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data.users);
        } catch (error) {
            setMessage('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
                <FontAwesome name="bars" size={30} color="#000" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
                                <Link href={`/components/TransferPointsToUser/${user._id}`} style={styles.button}>
                                    <Text style={styles.buttonText}>Transfer Points</Text>
                                </Link>
                                <TouchableOpacity onPress={fetchUsers} style={[styles.button, styles.reloadButton]}>
                                    <Text style={styles.buttonText}>Reload</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
            <Animated.View style={[styles.drawerWrapper, { transform: [{ translateX: drawerAnim }] }]}>
                <CustomDrawer isOpen={isDrawerOpen} closeDrawer={closeDrawer} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    drawerButton: {
        alignSelf: 'flex-start',
        margin: 20,
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
    linkText: {
        color: '#1A73E8',
        textDecorationLine: 'underline',
        marginTop: 8,
        textAlign: 'center',
    },
    drawerWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 1000,
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
    reloadButton: {
        backgroundColor: '#34D399',
        marginRight: 0, // Remove the margin from the last button
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default RetailerUsers;
