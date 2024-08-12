import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../context/Auth';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StackLayout = () => {
    const { authState } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const checkAsyncStorage = async () => {
            const role = await AsyncStorage.getItem('role');
            const token = await AsyncStorage.getItem('token');
            const id = await AsyncStorage.getItem('loggedId');

            const retailerId = role === 'retailer' ? await AsyncStorage.getItem('loggedId') : null;
            const userId = role === 'user' ? await AsyncStorage.getItem('loggedId') : null;
            const fetchedManuId = role === 'manufacturer' ? await AsyncStorage.getItem('loggedId') : null;

            // console.log(role);
            // console.log(retailerId);
            // console.log(token);
            if (role && token) {
                switch (role) {
                    case 'retailer':
                        router.replace('/(retailer)');
                        break;
                    case 'user':
                        router.replace('/(user)');
                        break;
                    case 'manufacturer':
                        router.replace('/(manufacturer)');
                        break;
                    default:
                        router.replace('/'); // Handle unexpected roles
                        break;
                }
            } else if (authState?.attemptedLogin && !authState?.authenticated) {
                // Do not redirect if the login was attempted but failed
                return;
            } else if (!authState?.role) {
                router.replace('/'); // Redirect to home if not authenticated
            }
        };

        checkAsyncStorage();
    }, [authState, router]);

    return (
        <Stack>
            <Stack.Screen name="index" options={{headerShown: false }} />
            <Stack.Screen name="(user)" options={{ headerShown: false }} />
            <Stack.Screen name="(retailer)" options={{ headerShown: false }} />
            <Stack.Screen name="(manufacturer)" options={{ headerShown: false }} />
            {/* <Stack.Screen name="(usertabs)" options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
        </Stack>
    );
};

const RootLayoutNav = () => {
    return (
        <AuthProvider>
            <StackLayout />
        </AuthProvider>
    );
};

export default RootLayoutNav;
