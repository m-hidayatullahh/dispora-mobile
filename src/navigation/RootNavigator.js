import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import FacilitiesScreen from '../screens/FacilitiesScreen';
import EventsScreen from '../screens/EventsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import NewsScreen from '../screens/NewsScreen';
import NewsDetailScreen from '../screens/NewsDetailScreen';
import MoreScreen from '../screens/MoreScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.base,
    card: colors.base,
    text: colors.text,
    border: colors.line,
    notification: colors.primary,
  },
};

const ICONS = {
  Beranda: ['home', 'home-outline'],
  Fasilitas: ['business', 'business-outline'],
  Acara: ['calendar', 'calendar-outline'],
  Berita: ['newspaper', 'newspaper-outline'],
  Lainnya: ['grid', 'grid-outline'],
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = ICONS[route.name] || ['ellipse', 'ellipse-outline'];
          return <Ionicons name={focused ? active : inactive} size={size - 3} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Beranda" component={HomeScreen} />
      <Tab.Screen name="Fasilitas" component={FacilitiesScreen} />
      <Tab.Screen name="Acara" component={EventsScreen} />
      <Tab.Screen name="Berita" component={NewsScreen} />
      <Tab.Screen name="Lainnya" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.base },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800', fontSize: 16 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.base },
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="EventDetail"
          component={EventDetailScreen}
          options={{ title: 'Detail acara' }}
        />
        <Stack.Screen
          name="NewsDetail"
          component={NewsDetailScreen}
          options={{ title: 'Detail berita' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
