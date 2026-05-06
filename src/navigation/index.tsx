import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CreateScreen from "../screens/CreateScreen";
import FocusScreen from "../screens/FocusScreen";
import HomeScreen from "../screens/HomeScreen"; 
import LoginScreen from "../screens/LoginScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabRoutes() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1A73E8",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: any = "ellipse-outline";

          if (route.name === "Estudos") iconName = "book-outline";
          else if (route.name === "Adicionar") iconName = "add-circle-outline";
          else if (route.name === "Cronômetro") iconName = "timer-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Estudos" component={HomeScreen} />
      <Tab.Screen name="Adicionar" component={CreateScreen} />
      <Tab.Screen name="Cronômetro" component={FocusScreen} />
    </Tab.Navigator>
  );
}

export default function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={TabRoutes} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
