const admin = require("firebase-admin");
const User = require("../user/user.model");

/**
 * Seed admin user on first server start.
 * Uses ADMIN_SEED_EMAIL, ADMIN_SEED_NAME, and ADMIN_SEED_PASSWORD from environment.
 * Creates the admin in both Firebase Auth and MongoDB so they can log in with email/password.
 */
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_SEED_EMAIL;
    const adminName = process.env.ADMIN_SEED_NAME || "Admin";
    const adminPassword = process.env.ADMIN_SEED_PASSWORD;

    if (!adminEmail) {
      console.log("ℹ️  No ADMIN_SEED_EMAIL set — skipping admin seed");
      return;
    }

    // Check if any admin exists in DB
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log(
        `ℹ️  Admin already exists: ${existingAdmin.email} — skipping seed`,
      );

      // Ensure the admin also exists in Firebase Auth
      if (adminPassword && !existingAdmin.firebaseUid) {
        try {
          let fbUser;
          try {
            fbUser = await admin.auth().getUserByEmail(adminEmail);
          } catch {
            // Create in Firebase if missing
            fbUser = await admin.auth().createUser({
              email: adminEmail,
              password: adminPassword,
              displayName: adminName,
              emailVerified: true,
            });
            console.log(
              `✅ Firebase auth user created for existing admin: ${adminEmail}`,
            );
          }
          existingAdmin.firebaseUid = fbUser.uid;
          await existingAdmin.save();
          console.log(`✅ Admin firebaseUid linked: ${fbUser.uid}`);
        } catch (fbErr) {
          console.error(
            "⚠️  Failed to link admin Firebase account:",
            fbErr.message,
          );
        }
      }
      return;
    }

    // Check if user with this email exists but isn't admin
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      existingUser.role = "admin";

      // Create Firebase user if password provided and no UID
      if (adminPassword && !existingUser.firebaseUid) {
        try {
          let fbUser;
          try {
            fbUser = await admin.auth().getUserByEmail(adminEmail);
          } catch {
            fbUser = await admin.auth().createUser({
              email: adminEmail,
              password: adminPassword,
              displayName: adminName,
              emailVerified: true,
            });
          }
          existingUser.firebaseUid = fbUser.uid;
        } catch (fbErr) {
          console.error("⚠️  Failed to create Firebase user:", fbErr.message);
        }
      }

      await existingUser.save();
      console.log(`✅ Existing user ${adminEmail} promoted to admin`);
      return;
    }

    // ── Create brand-new admin ──
    let firebaseUid = null;

    if (adminPassword) {
      // Create Firebase Auth user so admin can log in with email/password
      try {
        let fbUser;
        try {
          fbUser = await admin.auth().getUserByEmail(adminEmail);
          console.log(`ℹ️  Firebase user already exists for ${adminEmail}`);
        } catch {
          fbUser = await admin.auth().createUser({
            email: adminEmail,
            password: adminPassword,
            displayName: adminName,
            emailVerified: true,
          });
          console.log(`✅ Firebase auth user created: ${adminEmail}`);
        }
        firebaseUid = fbUser.uid;
      } catch (fbErr) {
        console.error("⚠️  Failed to create Firebase admin:", fbErr.message);
      }
    } else {
      console.log(
        "ℹ️  No ADMIN_SEED_PASSWORD set — admin won't have email/password login",
      );
    }

    // Create in MongoDB
    await User.create({
      email: adminEmail,
      name: adminName,
      role: "admin",
      firebaseUid,
    });

    console.log(
      `✅ Admin user seeded: ${adminEmail}${firebaseUid ? " (with Firebase auth)" : ""}`,
    );
  } catch (error) {
    console.error("❌ Admin seed error:", error.message);
  }
};

module.exports = { seedAdmin };
