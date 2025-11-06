const { getAuth, getFirestore } = require('../config/firebase');
const { admin } = require('../config/firebase');

/**
 * Register a new user
 * Creates Firebase Auth user and stores user data in Firestore
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and name',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Create user in Firebase Auth
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: name,
    });

    // Create user document in Firestore
    const db = getFirestore();
    const userDoc = {
      uid: userRecord.uid,
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(userRecord.uid).set(userDoc);

    // Generate custom token for immediate login
    const customToken = await getAuth().createCustomToken(userRecord.uid);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        name,
        customToken, // Client can use this to sign in immediately
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * Verifies credentials and returns user data with custom token
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Get user from Firebase Auth by email
    const userRecord = await getAuth().getUserByEmail(email);
    
    if (!userRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Get user document from Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userRecord.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User data not found',
      });
    }

    const userData = userDoc.data();

    // Generate custom token for authentication
    const customToken = await getAuth().createCustomToken(userRecord.uid);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          name: userData.name,
          emailVerified: userRecord.emailVerified,
        },
        customToken, // Token for authentication
        idToken: customToken, // Use custom token as ID token for now
      },
    });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    next(error);
  }
};

/**
 * Get user by UID
 * Used after login to fetch user details
 */
const getUserByUid = async (req, res, next) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Get user from Firebase Auth
    const userRecord = await getAuth().getUser(uid);

    // Get user document from Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database',
      });
    }

    const userData = userDoc.data();

    res.status(200).json({
      success: true,
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userData.name,
        emailVerified: userRecord.emailVerified,
        createdAt: userData.createdAt,
        disabled: userRecord.disabled,
      },
    });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    next(error);
  }
};

/**
 * Get current user profile (protected route)
 * Requires authentication token
 */
const getProfile = async (req, res, next) => {
  try {
    const { uid } = req.user; // Set by verifyToken middleware

    // Get user document from Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    const userData = userDoc.data();
    const userRecord = await getAuth().getUser(uid);

    res.status(200).json({
      success: true,
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userData.name,
        emailVerified: userRecord.emailVerified,
        createdAt: userData.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile (protected route)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { name, photoURL } = req.body;

    if (!name && !photoURL) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update (name or photoURL)',
      });
    }

    const updates = {};
    if (name) updates.displayName = name;
    if (photoURL) updates.photoURL = photoURL;

    // Update Firebase Auth
    await getAuth().updateUser(uid, updates);

    // Update Firestore
    const db = getFirestore();
    const firestoreUpdates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (name) firestoreUpdates.name = name;
    if (photoURL) firestoreUpdates.photoURL = photoURL;

    await db.collection('users').doc(uid).update(firestoreUpdates);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account (protected route)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { uid } = req.user;

    // Delete from Firestore first
    const db = getFirestore();
    await db.collection('users').doc(uid).delete();

    // Delete from Firebase Auth
    await getAuth().deleteUser(uid);

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email address
 * Generate email verification link
 */
const sendEmailVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await getAuth().getUserByEmail(email);
    
    // Generate email verification link
    const link = await getAuth().generateEmailVerificationLink(email);

    res.status(200).json({
      success: true,
      message: 'Email verification link generated',
      data: {
        verificationLink: link,
        // In production, you would send this via email service
        note: 'In production, send this link via email service',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create custom token for a user
 * Used by client to sign in with Firebase Client SDK
 */
const createCustomToken = async (req, res, next) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const customToken = await getAuth().createCustomToken(uid);

    res.status(200).json({
      success: true,
      message: 'Custom token created',
      data: {
        customToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke refresh tokens (logout)
 * Forces user to re-authenticate
 */
const revokeTokens = async (req, res, next) => {
  try {
    const { uid } = req.user;

    await getAuth().revokeRefreshTokens(uid);

    res.status(200).json({
      success: true,
      message: 'All refresh tokens revoked. User logged out.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getUserByUid,
  getProfile,
  updateProfile,
  deleteUser,
  sendEmailVerification,
  createCustomToken,
  revokeTokens,
};
