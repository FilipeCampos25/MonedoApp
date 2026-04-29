import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import CreateScreen from "../screens/CreateScreen";
import LoginScreen from "../screens/LoginScreen";

function MetasScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Metas (em breve)</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabRoutes() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1A73E8",
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "Estudos") iconName = "book-outline";
          else if (route.name === "Adicionar") iconName = "add-circle-outline";
          else if (route.name === "Metas") iconName = "flag-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Estudos" component={HomeScreen} />
      <Tab.Screen name="Adicionar" component={CreateScreen} />
      <Tab.Screen name="Metas" component={MetasScreen} />
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
