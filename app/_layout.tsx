import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../context/Auth';
import { useEffect } from 'react';

const StackLayout = () => {
    const { authState } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (authState?.attemptedLogin && !authState?.authenticated) {
            // Do not redirect if the login was attempted but failed
            return;
          }
        if (!authState?.role) {
            router.replace('/'); // Redirect to home if not authenticated
        } else {
            switch (authState.role) {
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
        }
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
