import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { auth, signInWithEmailAndPassword } from "../firebaseConfig";
import CustomButton from "../../components/CutomButton";

export default function LoginScreen({ navigation }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }
  
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      Alert.alert("Success", "Logged in successfully!");
    } catch (error) {
      console.error("Login Error:", error.code);
  
      let errorMessage = "An unexpected error occurred. Please try again.";
  
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
  
      Alert.alert("Login Failed", errorMessage);
    }
  };
  return (
    <View style={styles.container}>
          

      <ScrollView contentContainerStyle={styles.scrollView}>
        <TouchableOpacity onPress={() => navigation.navigate("Welcome")} style={styles.backButton}>
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
        <Text style={styles.title}>Log In</Text>

        <View style={styles.formContainer}>
          <TextInput
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
          />
          
          <CustomButton title="Log In" onPress={handleLogin} />
                  </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "white",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});