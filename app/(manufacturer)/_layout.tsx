import { Tabs } from 'expo-router';
import React, { useContext } from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/context/Auth'; // Import useAuth to access auth context
import { Drawer } from 'expo-router/drawer';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { authState } = useAuth(); // Get authState from context

  return (
    <AuthProvider>
      <Drawer>
        <Drawer.Screen
          name="index"
          options={{
            title: 'Transfer Points',
            drawerIcon: ({ color, focused }) => (
              <FontAwesome6 name={focused ? 'arrow-right-arrow-left' : 'arrow-right-arrow-left'} color={color} size={20}   />
            ),
          }}
        />
        <Drawer.Screen
          name="RedemptionRequests"
          options={{
            title: 'Approve Retailer Redeem',
            drawerIcon: ({ color, focused }) => (
              <MaterialCommunityIcons name={focused ? 'account-check' : 'account-check-outline'} color={color} size={20}   />
            ),
          }}
        />
        <Drawer.Screen
          name="User_redemption_request"
          options={{
            title: 'Approve Plumber Redeem',
            drawerIcon: ({ color, focused }) => (
              <MaterialCommunityIcons name={focused ? 'account-check' : 'account-check-outline'} color={color} size={20}   />
            ),
          }}
        />
        <Drawer.Screen
          name="transaction"
          options={{
            title: 'Transactions',
            drawerIcon: ({ color, focused }) => (
              <MaterialCommunityIcons name={focused ? 'book-multiple' : 'book-multiple-outline'} color={color} size={20}   />
            ),
          }}
        />
        <Drawer.Screen
          name="Retailer_kyc"
          options={{
            title: 'Retailer KYC Request',
            drawerIcon: ({ color, focused }) => (
              <MaterialCommunityIcons name={focused ? 'account-clock' : 'account-clock-outline'} color={color} size={20}   />
            ),
          }}
        />
        <Drawer.Screen
          name="Plumber_kyc"
          options={{
            title: 'Plumber KYC Request',
            drawerIcon: ({ color, focused }) => (
              <MaterialCommunityIcons name={focused ? 'account-clock-outline' : 'account-clock'} color={color} size={20}   />
            ),
          }}
        />
        <Drawer.Screen
          name="Scheme"
          options={{
            title: 'Upload Schemes',
            drawerIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'document-text' : 'document-text-outline'} color={color} size={20} />
            ),
          }}
        />
          
          <Drawer.Screen
            name="Logout"
            options={{
              title: 'Logout',
              drawerIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'exit' : 'exit-outline'} color={color} size={20}   />
              ),
            }}
          />
          <Drawer.Screen
            name="TransferPointsToRetailer/[retailerId]"
            options={{
              title: 'Retailer Id',
              drawerLabel: () => null,
              drawerIcon: () => null,
              unmountOnBlur: false,
              freezeOnBlur:true,
            }}
          />


      </Drawer>
    </AuthProvider>
  );
}
