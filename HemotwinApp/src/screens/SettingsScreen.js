import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image, Modal, TextInput, Button } from "react-native";
import { auth, db } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("Settings");
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      const userEmail = auth.currentUser?.email;
      if (!userEmail) return;

      try {
        const userDoc = await getDoc(doc(db, "patients", userEmail.toLowerCase())); // Ensure lowercase email
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFullName(`${data.firstName || "User"} ${data.lastName || ""}`.trim()); // Show full name
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserName();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Confirm", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        onPress: async () => {
          try {
            await auth.signOut();
            Alert.alert("Success", "Logged out successfully.");
          } catch (error) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert("Confirm", "Are you sure you want to delete your account? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => setModalVisible(true), // Show password input modal
        style: "destructive",
      },
    ]);
  };

  const confirmDelete = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "No authenticated user found.");
        return;
      }

      if (!password) {
        Alert.alert("Error", "Password is required.");
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, password);

      // Reauthenticate the user
      await reauthenticateWithCredential(user, credential);

      const userEmail = user.email.toLowerCase(); // Firestore uses lowercase emails as keys

      // Delete user data from Firestore
      await Promise.all([
        deleteDoc(doc(db, "patients", userEmail)),
        deleteDoc(doc(db, "healthData", userEmail)),
      ]);

      // Delete user authentication from Firebase Auth
      await deleteUser(user);

      Alert.alert("Account Deleted", "Your account and data have been removed.");
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back to Home Button */}
      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Home</Text>
      </TouchableOpacity>

      {/* Full Name as Title */}
      <Text style={styles.title}>{fullName}</Text>

      {/* Settings Buttons */}
      <TouchableOpacity onPress={() => Alert.alert("Feature in Progress", "This feature is still under development.")} style={[styles.button]}>
        <Text style={styles.buttonText}>Account & Information</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Privacy")} style={[styles.button, styles.notificationsButton]}>
        <Text style={styles.buttonText}>Privacy</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Alert.alert("Feature in Progress", "This feature is still under development.")} style={[styles.button, styles.notificationsButton]}>
        <Text style={styles.buttonText}>Notifications</Text>
      </TouchableOpacity>

      {/* Donate Button with Heart Icon */}
      <TouchableOpacity onPress={() => Alert.alert("Feature in Progress", "This feature is still under development.")} style={[styles.button, styles.donateButton]}>
        <Text style={ styles.donateButtontext}>Donate</Text>
        <Image source={require("../../assets/heart.png")} style={styles.heartIcon} />
      </TouchableOpacity>

      {/* Log Out & Delete Account Buttons in Same Row */}
      <View style={styles.bottomRow}>
        <TouchableOpacity onPress={handleLogout} style={[styles.bottomButton, styles.logoutButton]}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteAccount} style={[styles.bottomButton, styles.deleteButton]}>
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Password Input Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 16, marginBottom: 15 }}>Enter your password to confirm deletion:</Text>
            <TextInput
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
            <TouchableOpacity onPress={confirmDelete}  style={[styles.modalButtonDelete]}>
          <Text style={styles.buttonText}>Confirm Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalButtonCancel]}>
          <Text style={styles.buttonText}>Cancel Delete</Text>
        </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8", alignItems: "center", justifyContent: "center", padding: 20 },
  backButton: { position: "absolute", top: 40, left: 20, backgroundColor: "rgba(0,0,0,0.6)", padding: 10, borderRadius: 8 },
  backButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  title: { fontSize: 40, fontWeight: "bold", color: "#cd2f2e", marginBottom: 40, textAlign: "center" },
  button: { width: "100%", padding:20, borderRadius: 10, alignItems: "center", marginBottom: 15, flexDirection: "row", justifyContent: "center" , backgroundColor:"#d76b73"},
  buttonText: { color: "white", fontSize: 19, fontWeight: "bold" },
  donateButton: { backgroundColor: "#e47971", height: 85 },
  donateButtontext: { color: "white", fontSize: 30, fontWeight: "bold" },
  heartIcon: { width: 30, height: 30, marginLeft: 10, tintColor: "white" },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", position: "absolute", bottom: 55, width: "100%", paddingHorizontal: 15 },
  bottomButton: { flex: 1, padding: 10, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  logoutButton: { backgroundColor: "#f8b6ad" },
  deleteButton: { backgroundColor: "#f8b6ad" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "90%" ,},
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 10, width: "100%" },
  modalButtonDelete:{marginBottom:10,padding:15, alignItems: "center", backgroundColor:"#a2272c"},
  modalButtonCancel:{padding:15, alignItems: "center", backgroundColor:"grey"}

});