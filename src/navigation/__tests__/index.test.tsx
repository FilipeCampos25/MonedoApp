import React from "react";
import { render } from "@testing-library/react-native";

import { useAuth } from "../../context/AuthContext";
import Routes from "..";

jest.mock("../../context/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("../../screens/AccountScreen", () => {
  const react = require("react");
  const { Text } = require("react-native");
  return () => react.createElement(Text, null, "account-screen");
});
jest.mock("../../screens/CreateScreen", () => {
  const react = require("react");
  const { Text } = require("react-native");
  return () => react.createElement(Text, null, "create-screen");
});
jest.mock("../../screens/FocusScreen", () => {
  const react = require("react");
  const { Text } = require("react-native");
  return () => react.createElement(Text, null, "focus-screen");
});
jest.mock("../../screens/HomeScreen", () => {
  const react = require("react");
  const { Text } = require("react-native");
  return () => react.createElement(Text, null, "home-screen");
});
jest.mock("../../screens/LoginScreen", () => {
  const react = require("react");
  const { Text } = require("react-native");
  return () => react.createElement(Text, null, "login-screen");
});

function mockNavigatorFactory() {
  const react = require("react");
  const { View } = require("react-native");
  return {
    Navigator: ({ children, screenOptions }: any) => {
      const icon = typeof screenOptions === "function"
        ? screenOptions({ route: { name: "Estudos" } }).tabBarIcon({
            color: "blue",
            size: 20,
          })
        : null;
      return react.createElement(View, null, icon, children);
    },
    Screen: ({ component: Component }: any) =>
      Component ? react.createElement(Component) : null,
  };
}

jest.mock("@react-navigation/bottom-tabs", () => ({
  createBottomTabNavigator: mockNavigatorFactory,
}));
jest.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: mockNavigatorFactory,
}));
jest.mock("@react-navigation/native", () => ({
  NavigationContainer: ({ children }: any) => {
    const react = require("react");
    const { View } = require("react-native");
    return react.createElement(View, null, children);
  },
}));

const useAuthMock = useAuth as jest.Mock;

it("renders the loading navigation state", async () => {
  useAuthMock.mockReturnValue({ loading: true, token: null });
  const loading = await render(<Routes />);
  expect(loading.toJSON()).toBeTruthy();
});

it("renders public navigation", async () => {
  useAuthMock.mockReturnValue({ loading: false, token: null });
  const publicRoutes = await render(<Routes />);
  expect(publicRoutes.getByText("login-screen")).toBeTruthy();
});

it("renders authenticated navigation", async () => {
  useAuthMock.mockReturnValue({ loading: false, token: "token" });
  const privateRoutes = await render(<Routes />);
  expect(privateRoutes.getByText("home-screen")).toBeTruthy();
  expect(privateRoutes.getByText("account-screen")).toBeTruthy();
});
