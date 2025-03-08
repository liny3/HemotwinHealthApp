import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";
import PatientProfile from "./screens/PatientData";
import BloodTest from "./screens/BloodTest";
import LeukemiaRiskAssessment from "./screens/LeukemiaMenu";
import Suggestions from "./screens/Suggestions";
import SettingsScreen from "./screens/SettingsScreen";
import HealthData from "./screens/HealthDataMenu"
import MyRiskAssessment from "./screens/MyRiskAssessment"
import LeukemiaInfo from "./screens/LeukemiaInfo"
import PrivacyScreen from "./screens/PrivacyScreen";
import OcrPlayground from "./screens/OCRtest";

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null; // Prevents flickering during auth check

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} initialParams={{ userId: user?.uid }} />
            <Stack.Screen name="Profile" component={PatientProfile} />
            <Stack.Screen name="HealthData" component={HealthData} />
            <Stack.Screen name="BloodTest" component={BloodTest} />
            <Stack.Screen name="RiskAssessment" component={LeukemiaRiskAssessment} />
            <Stack.Screen name="MyRiskAssessment" component={MyRiskAssessment} />
            <Stack.Screen name="LeukemiaInfo" component={LeukemiaInfo} />
            <Stack.Screen name="ActionSuggestions" component={Suggestions} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen}/>
            <Stack.Screen name="OCR" component={OcrPlayground}/>

          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}