import React from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/context/Auth';
import { Drawer } from 'expo-router/drawer';
import { Entypo, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import CustomDrawerContent from '../../components/custom';
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
    <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
       <Drawer.Screen
        name="index"
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={20}   />
          ),
        }}
      />
      <Drawer.Screen
        name="RedeemptionForm"
        options={{
          title: 'Redeem Points',
          drawerIcon: ({ color, focused }) => (
            <MaterialIcons name={focused ? 'redeem' : 'redeem'} color={color} size={20}   />
          ),
        }}
      />
       <Drawer.Screen
        name="CouponCodes"
        options={{
          title: 'Coupon Codes',
          drawerIcon: ({ color, focused }) => (
            <FontAwesome name={focused ? 'ticket' : 'ticket'} color={color} size={20}   />
          ),
        }}
      />
      
      <Drawer.Screen
        name="pointsHistory"
        options={{
          title: 'Points History',
          drawerIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'history' : 'history'} color={color} size={20}   />
          )
        }}
      />
      <Drawer.Screen
        name="RedeemHistory"
        options={{
          title: 'Redeem History',
          drawerIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'history' : 'history'} color={color} size={20}   />
          )
        }}
      />
      
      <Drawer.Screen
        name="S3_kyc"
        options={{
          title: 'KYC',
          drawerIcon: ({ color, focused }) => (
            <FontAwesome name={focused ? 'id-card' : 'id-card-o'} color={color} size={20}   />
          )
        }}
      />

      <Drawer.Screen
            name="Scheme"
            options={{
              title: 'Scheme',
              drawerIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'document-text' : 'document-text-outline'} color={color} size={20}   />
              ),
            }}
            />
            <Drawer.Screen
          name="Profile"
          options={{
            title: 'Profile',
            drawerIcon: ({ color, focused }) => (
              <FontAwesome name={focused ? 'user-circle' : 'user-circle-o'} color={color} size={20} />
            )
          }}
        />
    </Drawer>

    </AuthProvider>
  );
}
