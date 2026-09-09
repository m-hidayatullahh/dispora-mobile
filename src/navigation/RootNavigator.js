import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../theme';
import { useI18n } from '../i18n/i18n';

import HomeScreen from '../screens/HomeScreen';
import FacilitiesScreen from '../screens/FacilitiesScreen';
import FacilityDetailScreen from '../screens/FacilityDetailScreen';
import EventsScreen from '../screens/EventsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import NewsScreen from '../screens/NewsScreen';
import NewsDetailScreen from '../screens/NewsDetailScreen';
import MoreScreen from '../screens/MoreScreen';
import ChatScreen from '../screens/ChatScreen';
import HelpdeskScreen from '../screens/HelpdeskScreen';
import PaymentScreen from '../screens/PaymentScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ICONS = {
  Beranda: ['home', 'home-outline'],
  Fasilitas: ['business', 'business-outline'],
  Acara: ['calendar', 'calendar-outline'],
  Berita: ['newspaper', 'newspaper-outline'],
  Lainnya: ['grid', 'grid-outline'],
};

function Tabs() {
  const { colors } = useTheme();
  const { t } = useI18n();

  const labels = {
    Beranda: t('tab.home'),
    Fasilitas: t('tab.facilities'),
    Acara: t('tab.events'),
    Berita: t('tab.news'),
    Lainnya: t('tab.more'),
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabel: labels[route.name],
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
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
  const { colors, isDark } = useTheme();
  const { t } = useI18n();

  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    dark: isDark,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.base,
      card: colors.base,
      text: colors.text,
      border: colors.line,
      notification: colors.primary,
    },
  };

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
          name="FacilityDetail"
          component={FacilityDetailScreen}
          options={{ title: t('facilities.title') }}
        />
        <Stack.Screen
          name="EventDetail"
          component={EventDetailScreen}
          options={{ title: t('events.detail') }}
        />
        <Stack.Screen
          name="NewsDetail"
          component={NewsDetailScreen}
          options={{ title: t('news.detail') }}
        />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: t('chat.title') }} />
        <Stack.Screen
          name="Helpdesk"
          component={HelpdeskScreen}
          options={{ title: t('helpdesk.title') }}
        />
        <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: t('pay.title') }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('more.login') }} />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: t('more.register') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
