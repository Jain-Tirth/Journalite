/**
 * Journal Service - Base Firebase operations for journal entries
 * Handles CRUD operations, image uploads, and statistics
 * Works with Firestore database and Firebase Storage
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from './firebase';

class JournalService {
  constructor() {
    this.collectionName = 'journalEntries';
  }

  /**
   * Create a new journal entry
   */
  async createEntry(entryData, userId) {
    try {
      console.log('📝 Creating journal entry for user:', userId);

      const entry = {
        ...entryData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        images: entryData.images || []
      };

      const docRef = await addDoc(collection(db, this.collectionName), entry);
      
      console.log('✅ Journal entry created with ID:', docRef.id);
      return {
        success: true,
        data: { id: docRef.id, ...entry }
      };
    } catch (error) {
      console.error('❌ Error creating journal entry:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get a specific journal entry by ID
   */
  async getEntry(entryId, userId) {
    try {
      console.log('📖 Fetching journal entry:', entryId);

      const docRef = doc(db, this.collectionName, entryId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Journal entry not found');
      }

      const entry = { id: docSnap.id, ...docSnap.data() };

      // Verify ownership
      if (entry.userId !== userId) {
        throw new Error('Unauthorized access to journal entry');
      }

      // Convert Firestore timestamps to JavaScript dates
      if (entry.createdAt && entry.createdAt.toDate) {
        entry.createdAt = entry.createdAt.toDate();
      }
      if (entry.updatedAt && entry.updatedAt.toDate) {
        entry.updatedAt = entry.updatedAt.toDate();
      }

      console.log('✅ Journal entry fetched successfully');
      return {
        success: true,
        data: entry
      };
    } catch (error) {
      console.error('❌ Error fetching journal entry:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all journal entries for a user
   */
  async getUserEntries(userId, limitCount = 50) {
    try {
      console.log('📚 Fetching journal entries for user:', userId);

      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const entries = [];

      querySnapshot.forEach((doc) => {
        const entry = { id: doc.id, ...doc.data() };
        
        // Convert Firestore timestamps to JavaScript dates
        if (entry.createdAt && entry.createdAt.toDate) {
          entry.createdAt = entry.createdAt.toDate();
        }
        if (entry.updatedAt && entry.updatedAt.toDate) {
          entry.updatedAt = entry.updatedAt.toDate();
        }

        entries.push(entry);
      });

      console.log(`✅ Fetched ${entries.length} journal entries`);
      return {
        success: true,
        data: entries
      };
    } catch (error) {
      console.error('❌ Error fetching journal entries:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update a journal entry
   */
  async updateEntry(entryId, updateData, userId) {
    try {
      console.log('📝 Updating journal entry:', entryId);

      // First verify ownership
      const existingEntry = await this.getEntry(entryId, userId);
      if (!existingEntry.success) {
        throw new Error('Journal entry not found or unauthorized');
      }

      const docRef = doc(db, this.collectionName, entryId);
      const updatedEntry = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updatedEntry);

      console.log('✅ Journal entry updated successfully');
      return {
        success: true,
        data: { id: entryId, ...updatedEntry }
      };
    } catch (error) {
      console.error('❌ Error updating journal entry:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a journal entry
   */
  async deleteEntry(entryId, userId) {
    try {
      console.log('🗑️ Deleting journal entry:', entryId);

      // First verify ownership and get entry data
      const existingEntry = await this.getEntry(entryId, userId);
      if (!existingEntry.success) {
        throw new Error('Journal entry not found or unauthorized');
      }

      // Delete associated images from storage
      if (existingEntry.data.images && existingEntry.data.images.length > 0) {
        await this.deleteEntryImages(existingEntry.data.images);
      }

      // Delete the document
      const docRef = doc(db, this.collectionName, entryId);
      await deleteDoc(docRef);

      console.log('✅ Journal entry deleted successfully');
      return {
        success: true,
        message: 'Journal entry deleted successfully'
      };
    } catch (error) {
      console.error('❌ Error deleting journal entry:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload image to Firebase Storage
   */
  async uploadImage(file, userId, entryId) {
    try {
      console.log('📸 Uploading image for entry:', entryId);

      // Create unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}_${file.name}`;
      const imagePath = `journal_images/${userId}/${entryId}/${filename}`;

      // Upload to Firebase Storage
      const storageRef = ref(storage, imagePath);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log('✅ Image uploaded successfully');
      return {
        success: true,
        data: {
          url: downloadURL,
          path: imagePath,
          filename: filename
        }
      };
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete images from Firebase Storage
   */
  async deleteEntryImages(imageUrls) {
    try {
      console.log('🗑️ Deleting entry images');

      const deletePromises = imageUrls.map(async (imageUrl) => {
        try {
          // Extract path from URL
          const url = new URL(imageUrl);
          const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
          if (pathMatch) {
            const imagePath = decodeURIComponent(pathMatch[1]);
            const imageRef = ref(storage, imagePath);
            await deleteObject(imageRef);
            console.log('✅ Deleted image:', imagePath);
          }
        } catch (error) {
          console.warn('⚠️ Failed to delete image:', imageUrl, error);
        }
      });

      await Promise.all(deletePromises);
      console.log('✅ All images deleted');
    } catch (error) {
      console.error('❌ Error deleting images:', error);
    }
  }

  /**
   * Search journal entries by text content
   */
  async searchEntries(userId, searchTerm, limitCount = 20) {
    try {
      console.log('🔍 Searching journal entries for:', searchTerm);

      // Get all user entries first (Firestore doesn't support full-text search)
      const allEntries = await this.getUserEntries(userId, 200);

      if (!allEntries.success) {
        return allEntries;
      }

      // Filter entries based on search term
      const searchTermLower = searchTerm.toLowerCase();
      const filteredEntries = allEntries.data.filter(entry => {
        return (
          entry.title?.toLowerCase().includes(searchTermLower) ||
          entry.content?.toLowerCase().includes(searchTermLower) ||
          entry.tags?.some(tag => tag.toLowerCase().includes(searchTermLower))
        );
      }).slice(0, limitCount);

      console.log(`✅ Found ${filteredEntries.length} matching entries`);
      return {
        success: true,
        data: filteredEntries
      };
    } catch (error) {
      console.error('❌ Error searching journal entries:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get journal statistics for a user
   */
  async getJournalStats(userId) {
    try {
      console.log('📊 Calculating journal statistics for user:', userId);

      const entriesResult = await this.getUserEntries(userId, 1000);

      if (!entriesResult.success) {
        return entriesResult;
      }

      const entries = entriesResult.data;
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculate statistics
      const stats = {
        totalEntries: entries.length,
        moodCounts: {},
        tagsCount: {},
        entriesThisMonth: 0,
        longestStreak: 0,
        averageWordsPerEntry: 0,
        totalWords: 0,
        firstEntryDate: null,
        lastEntryDate: null
      };

      let totalWords = 0;
      const entryDates = new Set();

      entries.forEach(entry => {
        // Count moods
        if (entry.mood) {
          stats.moodCounts[entry.mood] = (stats.moodCounts[entry.mood] || 0) + 1;
        }

        // Count tags
        if (entry.tags && Array.isArray(entry.tags)) {
          entry.tags.forEach(tag => {
            stats.tagsCount[tag] = (stats.tagsCount[tag] || 0) + 1;
          });
        }

        // Count entries this month
        if (entry.createdAt && entry.createdAt >= thisMonth) {
          stats.entriesThisMonth++;
        }

        // Calculate word count
        if (entry.content) {
          const wordCount = entry.content.split(/\s+/).filter(word => word.length > 0).length;
          totalWords += wordCount;
        }

        // Track entry dates for streak calculation
        if (entry.createdAt) {
          const dateStr = entry.createdAt.toISOString().split('T')[0];
          entryDates.add(dateStr);
        }
      });

      // Calculate averages and dates
      stats.totalWords = totalWords;
      stats.averageWordsPerEntry = entries.length > 0 ? Math.round(totalWords / entries.length) : 0;

      if (entries.length > 0) {
        stats.firstEntryDate = entries[entries.length - 1].createdAt;
        stats.lastEntryDate = entries[0].createdAt;
      }

      // Calculate longest streak
      stats.longestStreak = this.calculateLongestStreak(Array.from(entryDates));

      console.log('✅ Journal statistics calculated');
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ Error calculating journal statistics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate the longest writing streak
   */
  calculateLongestStreak(dates) {
    if (dates.length === 0) return 0;

    // Sort dates
    const sortedDates = dates.sort();
    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currentDate = new Date(sortedDates[i]);
      const diffTime = currentDate - prevDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }

  /**
   * Get entries by mood
   */
  async getEntriesByMood(userId, mood, limitCount = 20) {
    try {
      console.log('😊 Fetching entries by mood:', mood);

      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('mood', '==', mood),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const entries = [];

      querySnapshot.forEach((doc) => {
        const entry = { id: doc.id, ...doc.data() };

        // Convert Firestore timestamps
        if (entry.createdAt && entry.createdAt.toDate) {
          entry.createdAt = entry.createdAt.toDate();
        }
        if (entry.updatedAt && entry.updatedAt.toDate) {
          entry.updatedAt = entry.updatedAt.toDate();
        }

        entries.push(entry);
      });

      console.log(`✅ Found ${entries.length} entries with mood: ${mood}`);
      return {
        success: true,
        data: entries
      };
    } catch (error) {
      console.error('❌ Error fetching entries by mood:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get entries by date range
   */
  async getEntriesByDateRange(userId, startDate, endDate, limitCount = 50) {
    try {
      console.log('📅 Fetching entries by date range');

      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const entries = [];

      querySnapshot.forEach((doc) => {
        const entry = { id: doc.id, ...doc.data() };

        // Convert Firestore timestamps
        if (entry.createdAt && entry.createdAt.toDate) {
          entry.createdAt = entry.createdAt.toDate();
        }
        if (entry.updatedAt && entry.updatedAt.toDate) {
          entry.updatedAt = entry.updatedAt.toDate();
        }

        entries.push(entry);
      });

      console.log(`✅ Found ${entries.length} entries in date range`);
      return {
        success: true,
        data: entries
      };
    } catch (error) {
      console.error('❌ Error fetching entries by date range:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const journalService = new JournalService();
