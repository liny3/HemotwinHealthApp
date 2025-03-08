import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, TextInput, Modal } from "react-native";
import { auth, db } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";

export default function PrivacyScreen() {
  const navigation = useNavigation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState("********");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetModalVisible, setResetModalVisible] = useState(false);

  useEffect(() => {
    const fetchPassword = async () => {
      const userEmail = auth.currentUser?.email;
      if (!userEmail) return;

      try {
        const userDoc = await getDoc(doc(db, "patients", userEmail.toLowerCase()));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setPassword(data.password || "********"); // Fetch stored password (if any)
        }
      } catch (error) {
        console.error("Error fetching password:", error);
      }
    };

    fetchPassword();
  }, []);

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        await updateDoc(doc(db, "patients", user.email.toLowerCase()), { password: newPassword });
        setPassword(newPassword);
        Alert.alert("Success", "Password updated successfully!");
        setResetModalVisible(false);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back to Settings Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Settings</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Privacy Settings</Text>

      {/* Password Visibility Toggle */}
      <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={[styles.button, styles.passwordButton]}>
        <Text style={styles.buttonText}>Password: {passwordVisible ? password : "********"}</Text>
      </TouchableOpacity>

      {/* Reset Password */}
      <TouchableOpacity onPress={() => setResetModalVisible(true)} style={[styles.button, styles.resetButton]}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>

      {/* Reset Password Modal */}
      <Modal visible={resetModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <TextInput placeholder="New Password" secureTextEntry style={styles.input} value={newPassword} onChangeText={setNewPassword} />
            <TextInput placeholder="Confirm Password" secureTextEntry style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} />


            <View style={styles.modalButtonRow}>
            <TouchableOpacity onPress={() => setResetModalVisible(false)} style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePasswordReset} style={[styles.modalButton, styles.confirmButton]}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              
            </View>
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
  title: { fontSize: 30, fontWeight: "bold", color: "#cd2f2e", marginBottom: 40, textAlign: "center" },
  button: { width: "100%", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 15 },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  passwordButton: { backgroundColor: "#d76b73" },
  resetButton: { backgroundColor: "#e47971" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "89%", backgroundColor: "white", padding: 20, borderRadius: 10, alignItems: "center" },
  modalTitle: { fontSize: 25, fontWeight: "bold", marginBottom: 20 },
  modalButton: { width: "100%", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 15 },
  input: { width: "100%", borderWidth: 1, padding: 15, marginBottom:20, borderRadius: 5 },
  modalButtonRow: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  confirmButton: { backgroundColor: "#e47971", width:"45%" },
  cancelButton: { backgroundColor: "#a2272c",  width:"45%" },
});