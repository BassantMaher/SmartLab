import { auth, createData } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export const createAdminUser = async (email: string, password: string) => {
  try {
    // Validate email domain for admin
    if (!email.toLowerCase().endsWith("@admin.smartlab.com")) {
      throw new Error(
        "Invalid admin email domain. Must use @admin.smartlab.com"
      );
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const { uid } = userCredential.user;

    // Create admin user data in Realtime Database with strict role
    const adminData = {
      id: uid,
      email,
      name: email.split("@")[0],
      role: "admin",
      isVerifiedAdmin: true,
      createdAt: new Date().toISOString(),
    };

    // Save admin data to users collection
    await createData(`users/${uid}`, adminData);

    return { success: true, userId: uid };
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return {
      success: false,
      error: error.message || "Failed to create admin user",
    };
  }
};

// Usage example:
// import { createAdminUser } from '../utils/adminUtils';
// await createAdminUser('admin@example.com', 'securePassword123');
