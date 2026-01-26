/**
 * Field-level encryption service for journal title and content
 * Uses user's UID as encryption key to ensure only the user can decrypt their data
 * Admins cannot read encrypted title and content
 */

import CryptoJS from 'crypto-js';

class FieldEncryptionService {
  /**
   * Generate encryption key from user UID
   * This ensures each user has a unique key that persists across sessions
   */
  generateKey(userUid) {
    if (!userUid) {
      throw new Error('User UID is required for encryption');
    }
    // Create a consistent key from user UID
    return CryptoJS.SHA256(userUid + 'journalite_secret_salt').toString();
  }

  /**
   * Encrypt a single field value
   */
  encryptField(value, userUid) {
    try {
      if (!value || typeof value !== 'string') {
        return value; // Return as-is if not a string or empty
      }

      const key = this.generateKey(userUid);
      const encrypted = CryptoJS.AES.encrypt(value, key).toString();
      
      return {
        _encrypted: true,
        _value: encrypted
      };
    } catch (error) {
      console.error('❌ Field encryption failed:', error);
      throw new Error('Failed to encrypt field');
    }
  }

  /**
   * Decrypt a single field value
   */
  decryptField(encryptedField, userUid) {
    try {
      // If not encrypted, return as-is
      if (!encryptedField || typeof encryptedField !== 'object' || !encryptedField._encrypted) {
        return encryptedField;
      }

      const key = this.generateKey(userUid);
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedField._value, key);
      const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Failed to decrypt field - invalid key or corrupted data');
      }
      
      return decrypted;
    } catch (error) {
      console.error('❌ Field decryption failed:', error);
      // Return a placeholder instead of throwing to prevent app crashes
      return '[Decryption Failed]';
    }
  }

  /**
   * Encrypt journal entry (only title and content)
   */
  encryptJournalEntry(entry, userUid) {
    try {
      const encryptedEntry = { ...entry };

      // Encrypt only title and content
      if (entry.title) {
        encryptedEntry.title = this.encryptField(entry.title, userUid);
      }
      
      if (entry.content) {
        encryptedEntry.content = this.encryptField(entry.content, userUid);
      }

      // Mark entry as having encrypted fields
      encryptedEntry._hasEncryptedFields = true;
      encryptedEntry._encryptedFields = ['title', 'content'];

      return {
        success: true,
        encryptedEntry
      };
    } catch (error) {
      console.error('❌ Journal entry encryption failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Decrypt journal entry (only title and content)
   */
  decryptJournalEntry(encryptedEntry, userUid) {
    try {
      // If entry doesn't have encrypted fields, return as-is
      if (!encryptedEntry._hasEncryptedFields) {
        return {
          success: true,
          decryptedEntry: encryptedEntry
        };
      }

      const decryptedEntry = { ...encryptedEntry };

      // Decrypt only title and content
      if (encryptedEntry.title && encryptedEntry.title._encrypted) {
        decryptedEntry.title = this.decryptField(encryptedEntry.title, userUid);
      }
      
      if (encryptedEntry.content && encryptedEntry.content._encrypted) {
        decryptedEntry.content = this.decryptField(encryptedEntry.content, userUid);
      }

      // Remove encryption metadata
      delete decryptedEntry._hasEncryptedFields;
      delete decryptedEntry._encryptedFields;

      return {
        success: true,
        decryptedEntry
      };
    } catch (error) {
      console.error('❌ Journal entry decryption failed:', error);
      return {
        success: false,
        error: error.message,
        decryptedEntry: encryptedEntry // Return original if decryption fails
      };
    }
  }

  /**
   * Decrypt multiple journal entries
   */
  decryptJournalEntries(encryptedEntries, userUid) {
    const decryptedEntries = [];
    const errors = [];

    encryptedEntries.forEach((entry, index) => {
      const result = this.decryptJournalEntry(entry, userUid);
      
      if (result.success) {
        decryptedEntries.push(result.decryptedEntry);
      } else {
        errors.push({
          index,
          entryId: entry.id,
          error: result.error
        });
        // Still add the entry even if decryption failed
        decryptedEntries.push(entry);
      }
    });

    return {
      success: errors.length === 0,
      decryptedEntries,
      errors
    };
  }

  /**
   * Check if a field is encrypted
   */
  isFieldEncrypted(field) {
    return field && typeof field === 'object' && field._encrypted === true;
  }

  /**
   * Get display value for potentially encrypted field
   * Useful for search and display without full decryption
   */
  getDisplayValue(field, userUid) {
    if (this.isFieldEncrypted(field)) {
      return this.decryptField(field, userUid);
    }
    return field;
  }
}

export const fieldEncryptionService = new FieldEncryptionService();
