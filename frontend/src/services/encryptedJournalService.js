/**
 * Enhanced Journal Service with Field-Level Encryption
 * Only encrypts title and content fields for privacy protection
 * Uses user UID as encryption key - no repeated logins required
 */

import { journalService } from './journalService';
import { fieldEncryptionService } from './fieldEncryption';

class EncryptedJournalService {
  constructor() {
    this.baseService = journalService;
  }

  /**
   * Create journal entry with encrypted title and content
   */
  async createEntry(entryData, userId) {
    try {
      // Encrypt only title and content
      const encryptionResult = fieldEncryptionService.encryptJournalEntry(entryData, userId);

      if (!encryptionResult.success) {
        throw new Error(`Encryption failed: ${encryptionResult.error}`);
      }

      // Store encrypted entry using base service
      const result = await this.baseService.createEntry(encryptionResult.encryptedEntry, userId);

      return result;
    } catch (error) {
      console.error('Error creating encrypted journal entry:', error);
      throw error;
    }
  }

  /**
   * Get user entries and decrypt title and content
   */
  async getUserEntries(userId, limitCount = 50) {
    try {

      // Get encrypted entries from database
      const result = await this.baseService.getUserEntries(userId, limitCount);

      if (!result.success || !result.data) {
        return result;
      }

      // Decrypt title and content fields
      const decryptionResult = fieldEncryptionService.decryptJournalEntries(result.data, userId);

      if (!decryptionResult.success && decryptionResult.errors.length > 0) {
        console.warn(' Some entries failed to decrypt:', decryptionResult.errors);
      }

      return {
        success: true,
        data: decryptionResult.decryptedEntries,
        decryptionErrors: decryptionResult.errors || []
      };
    } catch (error) {
      console.error('❌ Error fetching encrypted journal entries:', error);
      throw error;
    }
  }

  /**
   * Get specific entry and decrypt title and content
   */
  async getEntry(entryId, userId) {
    try {
      // Get encrypted entry from database
      const result = await this.baseService.getEntry(entryId, userId);

      if (!result.success || !result.data) {
        return result;
      }

      // Decrypt title and content fields
      const decryptionResult = fieldEncryptionService.decryptJournalEntry(result.data, userId);

      if (!decryptionResult.success) {
        console.warn('Entry decryption failed:', decryptionResult.error);
        // Return original entry if decryption fails
        return result;
      }

      return {
        success: true,
        data: decryptionResult.decryptedEntry
      };
    } catch (error) {
      console.error('❌ Error fetching encrypted journal entry:', error);
      throw error;
    }
  }

  /**
   * Update journal entry with encrypted title and content
   */
  async updateEntry(entryId, updateData, userId) {
    try {
      // Encrypt only title and content in update data
      const encryptionResult = fieldEncryptionService.encryptJournalEntry(updateData, userId);

      if (!encryptionResult.success) {
        throw new Error(`Encryption failed: ${encryptionResult.error}`);
      }

      // Update encrypted entry
      const result = await this.baseService.updateEntry(entryId, encryptionResult.encryptedEntry, userId);

      return result;
    } catch (error) {
      console.error('Error updating encrypted journal entry:', error);
      throw error;
    }
  }

  /**
   * Delete journal entry (no decryption needed)
   */
  async deleteEntry(entryId, userId) {
    try {
      return await this.baseService.deleteEntry(entryId, userId);
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  }

  /**
   * Upload image (no encryption for images)
   */
  async uploadImage(file, userId, entryId) {
    try {
      return await this.baseService.uploadImage(file, userId, entryId);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Search entries (decrypt first, then search)
   */
  async searchEntries(userId, searchTerm) {
    try {
      // Get all entries first
      const entriesResult = await this.getUserEntries(userId);

      if (!entriesResult.success || !entriesResult.data) {
        return entriesResult;
      }

      // Search in decrypted content
      const searchResults = entriesResult.data.filter(entry => {
        const searchableText = `${entry.title || ''} ${entry.content || ''} ${entry.tags?.join(' ') || ''}`.toLowerCase();
        return searchableText.includes(searchTerm.toLowerCase());
      });

      return {
        success: true,
        data: searchResults
      };
    } catch (error) {
      console.error('Error searching encrypted journal entries:', error);
      throw error;
    }
  }

  /**
   * Get entries by mood (decrypt first, then filter)
   */
  async getEntriesByMood(userId, mood) {
    try {
      // Get all entries first
      const entriesResult = await this.getUserEntries(userId);

      if (!entriesResult.success || !entriesResult.data) {
        return entriesResult;
      }

      // Filter by mood (mood is not encrypted)
      const moodEntries = entriesResult.data.filter(entry => entry.mood === mood);

      return {
        success: true,
        data: moodEntries
      };
    } catch (error) {
      console.error('❌ Error fetching encrypted entries by mood:', error);
      throw error;
    }
  }

  /**
   * Get journal statistics (decrypt first, then analyze)
   */
  async getJournalStats(userId) {
    try {
      // Get all entries first
      const entriesResult = await this.getUserEntries(userId);

      if (!entriesResult.success || !entriesResult.data) {
        return entriesResult;
      }

      // Use base service stats calculation on decrypted data
      const entries = entriesResult.data;
      const stats = {
        totalEntries: entries.length,
        moodCounts: {},
        tagsCount: {},
        entriesThisMonth: 0,
        longestStreak: 0
      };

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      entries.forEach(entry => {
        // Count moods (not encrypted)
        if (entry.mood) {
          stats.moodCounts[entry.mood] = (stats.moodCounts[entry.mood] || 0) + 1;
        }

        // Count tags (not encrypted)
        if (entry.tags) {
          entry.tags.forEach(tag => {
            stats.tagsCount[tag] = (stats.tagsCount[tag] || 0) + 1;
          });
        }

        // Count entries this month
        if (entry.createdAt) {
          const entryDate = entry.createdAt.toDate();
          if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
            stats.entriesThisMonth++;
          }
        }
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error generating journal stats from encrypted data:', error);
      throw error;
    }
  }
}

export const encryptedJournalService = new EncryptedJournalService();
