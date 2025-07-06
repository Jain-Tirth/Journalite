import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    updateEmail,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "firebase/auth";

import { auth } from "./firebase";

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
            throw { response: { data: { message: error.message } } };
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
            throw { response: { data: { message: error.message } } };
        }
    },

    logout: async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            throw { response: { data: { message: error.message } } };
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
            throw { response: { data: { message: error.message } } };
        }
    }
}

// Export as authService for compatibility
export const authService = firebaseAuthService;