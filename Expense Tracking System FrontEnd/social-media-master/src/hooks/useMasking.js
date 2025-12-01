import { useSelector, useDispatch } from "react-redux";
import { updateUserSettings } from "../Redux/UserSettings/userSettings.action";

/**
 * Custom hook to check if sensitive data should be masked
 * Based on user settings
 *
 * @returns {Object} Object with maskSensitiveData flag and helper functions
 */
export const useMasking = () => {
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.userSettings || {});
  const maskSensitiveData = settings?.maskSensitiveData || false;

  /**
   * Toggle masking state by updating backend settings
   */
  const toggleMasking = () => {
    // Create a clean object without system fields for the update request
    // The backend DTO (UpdateUserSettingsRequest) does not accept these fields
    const { 
      id, 
      userId, 
      createdAt, 
      updatedAt, 
      ...updatePayload 
    } = settings;
    
    dispatch(updateUserSettings({ ...updatePayload, maskSensitiveData: !maskSensitiveData }));
  };

  /**
   * Masks an amount value
   * @param {number} amount - The amount to mask
   * @param {boolean} partial - Whether to show partial amount
   * @returns {string} Masked or original amount
   */
  const maskAmount = (amount, partial = false) => {
    if (!maskSensitiveData) {
      return amount;
    }

    if (partial) {
      // Show last 2 digits: 1234.56 -> ***34.56
      const amountStr = amount.toFixed(2);
      if (amountStr.length <= 5) return "*****";
      return "***" + amountStr.substring(amountStr.length - 5);
    }

    return "*****";
  };

  /**
   * Returns a formatted masked string
   * @param {number} amount - The amount to format
   * @param {string} currency - Currency symbol (optional)
   * @param {boolean} partial - Whether to show partial amount
   * @returns {string} Formatted masked or original amount
   */
  const formatMaskedAmount = (amount, currency = "", partial = false) => {
    if (!maskSensitiveData) {
      return currency ? `${currency} ${amount.toFixed(2)}` : amount.toFixed(2);
    }

    const masked = maskAmount(amount, partial);
    return currency ? `${currency} ${masked}` : masked;
  };

  /**
   * Checks if data is currently being masked
   * @returns {boolean} True if masking is enabled
   */
  const isMasking = () => maskSensitiveData;

  return {
    maskSensitiveData,
    maskAmount,
    formatMaskedAmount,
    isMasking,
    toggleMasking,
  };
};
