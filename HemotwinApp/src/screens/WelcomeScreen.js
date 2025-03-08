import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CustomButton from "../../components/CutomButton";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to My Hematwin!</Text>
      <Text style={styles.subtitle}>Track your health with ease.</Text>

      <View style={styles.buttonContainer}>
        <CustomButton title="Log In" onPress={() => navigation.navigate("Login")} />
        <CustomButton title="Sign Up" onPress={() => navigation.navigate("Auth", { isSignUp: true })} style={styles.signupButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    alignItems: "center",
  },
  signupButton: {
    marginTop: 10,
  },
});