import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    updateEmail,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendPasswordResetEmail
} from "firebase/auth";

import { auth } from "./firebase";

const getFriendlyAuthMessage = (error, fallbackMessage) => {
    const code = error?.code;

    switch (code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'You entered an invalid email or password.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-disabled':
            return 'This account is disabled. Please contact support.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please wait a moment and try again.';
        case 'auth/email-already-in-use':
            return 'An account already exists with this email.';
        case 'auth/weak-password':
            return 'Please choose a stronger password (at least 6 characters).';
        case 'auth/requires-recent-login':
            return 'Please log in again to update your profile.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection and try again.';
        default:
            return fallbackMessage;
    }
};

export const firebaseAuthService = {
    register: async (userData) => {
        try {
            console.log('📝 Attempting registration with:', userData.email);
            console.log('🔥 Firebase auth instance:', auth);

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                userData.email,
                userData.password
            );

            // Update the user profile with the name
            await updateProfile(userCredential.user, {
                displayName: userData.name
            });

            // Return user data in the format expected by the app
            return {
                data: {
                    token: await userCredential.user.getIdToken(),
                    user: {
                        id: userCredential.user.uid,
                        uid: userCredential.user.uid, // Add uid for compatibility
                        name: userCredential.user.displayName,
                        displayName: userCredential.user.displayName, // Add displayName for compatibility
                        email: userCredential.user.email,
                        role: userData.role || 'USER' // Default role
                    }
                }
            };
        } catch (error) {
            console.error('❌ Registration error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            const message = getFriendlyAuthMessage(error, 'Unable to create your account. Please try again.');
            const friendlyError = new Error(message);
            friendlyError.response = { data: { message } };
            throw friendlyError;
        }
    },

    login: async (credentials) => {
        try {
            console.log('🔐 Attempting login with:', credentials.email);
            console.log('🔥 Firebase auth instance:', auth);
            console.log('🌐 Firebase config:', auth.app.options);

            const userCredential = await signInWithEmailAndPassword(
                auth,
                credentials.email,
                credentials.password
            );

            // For simplicity, we'll use a default role since Firebase custom claims
            // require Cloud Functions to set up, which is beyond the scope of this example
            const role = 'USER';

            // Return user data in the format expected by the app
            return {
                data: {
                    token: await userCredential.user.getIdToken(),
                    user: {
                        id: userCredential.user.uid,
                        uid: userCredential.user.uid, // Add uid for compatibility
                        name: userCredential.user.displayName,
                        displayName: userCredential.user.displayName, // Add displayName for compatibility
                        email: userCredential.user.email,
                        role: role
                    }
                }
            };
        } catch (error) {
            console.error('❌ Login error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            const message = getFriendlyAuthMessage(error, 'Unable to log you in. Please try again.');
            const friendlyError = new Error(message);
            friendlyError.response = { data: { message } };
            throw friendlyError;
        }
    },

    logout: async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            const message = getFriendlyAuthMessage(error, 'Unable to log out. Please try again.');
            const friendlyError = new Error(message);
            friendlyError.response = { data: { message } };
            throw friendlyError;
        }
    },

    getCurrentUser: () => {
        return new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(
                auth,
                (user) => {
                    unsubscribe();
                    if (user) {
                        // For simplicity, we'll use a default role
                        const role = 'USER';

                        resolve({
                            data: {
                                id: user.uid,
                                uid: user.uid, // Add uid for compatibility
                                name: user.displayName,
                                displayName: user.displayName, // Add displayName for compatibility
                                email: user.email,
                                role: role
                            }
                        });
                    } else {
                        resolve(null);
                    }
                },
                reject
            );
        });
    },

    updateProfile: async (userData) => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Not authenticated');

            // Update profile if name is provided
            if (userData.name) {
                await updateProfile(user, {
                    displayName: userData.name
                });
            }

            // Update email if provided
            if (userData.email && userData.email !== user.email) {
                // In a real app, you might want to verify the email change
                // This is simplified for the example
                await updateEmail(user, userData.email);
            }

            // Update password if provided
            if (userData.currentPassword && userData.newPassword) {
                // Re-authenticate user first (required for sensitive operations)
                const credential = EmailAuthProvider.credential(
                    user.email,
                    userData.currentPassword
                );
                await reauthenticateWithCredential(user, credential);

                // Then update password
                await updatePassword(user, userData.newPassword);
            }

            return { data: { success: true } };
        } catch (error) {
            const message = getFriendlyAuthMessage(error, 'Unable to update your profile. Please try again.');
            const friendlyError = new Error(message);
            friendlyError.response = { data: { message } };
            throw friendlyError;
        }
    },

    resetPassword: async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { data: { success: true } };
        } catch (error) {
            const message = getFriendlyAuthMessage(error, 'Unable to send reset link. Please try again.');
            const friendlyError = new Error(message);
            friendlyError.response = { data: { message } };
            throw friendlyError;
        }
    }
}

// Export as authService for compatibility
export const authService = firebaseAuthService;