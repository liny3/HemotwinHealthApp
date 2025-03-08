import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Alert, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import CustomButton from "../../components/CutomButton"; // Fixed import
import { useNavigation } from "@react-navigation/native";

export default function PatientProfile() {
  const navigation = useNavigation();
  const userEmail = auth.currentUser?.email;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userEmail) {
        Alert.alert("Error", "User email not found.");
        return;
      }

      const normalizedEmail = userEmail.toLowerCase();
      console.log("Fetching data for user:", normalizedEmail);

      try {
        const profileRef = doc(db, "patients", normalizedEmail);
        const docSnap = await getDoc(profileRef);

        if (docSnap.exists()) {
          console.log("Profile Data:", docSnap.data());
          setProfile(docSnap.data());
        } else {
          console.log("Firestore document does not exist for:", normalizedEmail);
          Alert.alert("Error", "Patient data not found.");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Error", "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userEmail]);

  const updateProfile = async () => {
    if (!userEmail) {
      Alert.alert("Error", "User email not found.");
      return;
    }

    const normalizedEmail = userEmail.toLowerCase();

    try {
      const profileRef = doc(db, "patients", normalizedEmail);
      await setDoc(profileRef, profile, { merge: true });
      Alert.alert("Success", "Profile updated!");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="red" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  // Desired order of fields
  const fieldOrder = [
    "firstName", "lastName", "ethnicity", "weight", "height", "dob",
    "sex", "email", "exercise", "allergies", "patientId"
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back to Home Button */}
      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Home</Text>
      </TouchableOpacity>

      {/* Content container to push everything down */}
      <View style={styles.content}>
        <Text style={styles.title}>My Profile</Text>

        {profile ? (
          fieldOrder.map((key) => 
            profile[key] !== undefined && ( // Only render if the field exists in Firestore
              <View key={key} style={styles.inputContainer}>
                <Text style={styles.label}>{key.replace(/([A-Z])/g, " $1")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter ${key}`}
                  value={profile[key]?.toString() || ""}
                  onChangeText={(text) => setProfile({ ...profile, [key]: text })}
                />
              </View>
            )
          )
        ) : (
          <Text style={styles.noDataText}>No profile data found.</Text>
        )}

        <CustomButton title="Update Profile" onPress={updateProfile} color="#cd2f2e" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    padding: 20,
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
  content: {
    marginTop: 50, // Pushes everything down
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#cd2f2e",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "gray",
    textTransform: "capitalize",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cd2f2e",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  noDataText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "gray",
  },
});