const admin = require("firebase-admin");

const initFirebase = () => {
  try {
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.warn("⚠️  Firebase config not set — Firebase features disabled");
      return null;
    }

    if (admin.apps.length > 0) {
      return admin.app();
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });

    console.log("✅ Firebase Admin initialized");
    return app;
  } catch (error) {
    console.error("❌ Firebase init error:", error.message);
    return null;
  }
};

module.exports = initFirebase;
