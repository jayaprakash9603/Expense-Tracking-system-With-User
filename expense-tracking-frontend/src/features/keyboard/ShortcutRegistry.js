/**
 * ShortcutRegistry - Central registry for all keyboard shortcuts
 * 
 * This class manages the registration, validation, and conflict detection
 * of all keyboard shortcuts in the application.
 * 
 * Features:
 * - Auto-registration/unregistration with component lifecycle
 * - Conflict detection and resolution
 * - Shortcut validation
 * - User customization support
 */

export class ShortcutRegistry {
  constructor() {
    // Map of shortcut ID to shortcut config
    this.shortcuts = new Map();
    
    // Map of key combo to shortcut IDs (for conflict detection)
    this.keyMap = new Map();
    
    // User customizations (overrides default keys)
    this.customizations = new Map();
    
    // Disabled shortcuts
    this.disabled = new Set();
    
    // Load customizations from localStorage
    this._loadCustomizations();
  }

  /**
   * Load user customizations from localStorage
   */
  _loadCustomizations() {
    try {
      const stored = localStorage.getItem('shortcut_customizations');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.customizations = new Map(Object.entries(parsed.customizations || {}));
        this.disabled = new Set(parsed.disabled || []);
      }
    } catch (e) {
      console.warn('Failed to load shortcut customizations:', e);
    }
  }

  /**
   * Save user customizations to localStorage
   */
  _saveCustomizations() {
    try {
      localStorage.setItem('shortcut_customizations', JSON.stringify({
        customizations: Object.fromEntries(this.customizations),
        disabled: Array.from(this.disabled),
      }));
    } catch (e) {
      console.warn('Failed to save shortcut customizations:', e);
    }
  }

  /**
   * Normalize key combination string
   * @param {string} keys - Key combination (e.g., "Ctrl+N", "mod+shift+e")
   * @returns {string} Normalized key string
   */
  _normalizeKeys(keys) {
    if (!keys) return '';
    
    return keys
      .toLowerCase()
      .replace(/ctrl|cmd|meta/g, 'mod')
      .replace(/\s+/g, '')
      .split('+')
      .sort((a, b) => {
        // Sort modifiers first, then regular keys
        const modOrder = { mod: 0, alt: 1, shift: 2 };
        const aOrder = modOrder[a] ?? 99;
        const bOrder = modOrder[b] ?? 99;
        return aOrder - bOrder;
      })
      .join('+');
  }

  /**
   * Validate shortcut configuration
   * @param {Object} config - Shortcut configuration
   * @returns {Object} Validation result { valid, errors }
   */
  validate(config) {
    const errors = [];

    if (!config.id) {
      errors.push('Shortcut ID is required');
    }

    if (!config.keys && !config.defaultKeys) {
      errors.push('Key combination is required');
    }

    if (!config.description) {
      errors.push('Description is required');
    }

    if (config.action && typeof config.action !== 'function') {
      errors.push('Action must be a function');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if a key combination conflicts with existing shortcuts
   * @param {string} keys - Key combination to check
   * @param {string} scope - Scope of the shortcut
   * @param {string} excludeId - ID to exclude from conflict check
   * @returns {Object|null} Conflicting shortcut or null
   */
  checkConflict(keys, scope, excludeId = null) {
    const normalizedKeys = this._normalizeKeys(keys);
    const conflictIds = this.keyMap.get(normalizedKeys);

    if (!conflictIds || conflictIds.length === 0) return null;

    for (const id of conflictIds) {
      if (id === excludeId) continue;

      const existing = this.shortcuts.get(id);
      if (!existing) continue;

      // Check if scopes could conflict
      if (this._scopesConflict(scope, existing.scope)) {
        return existing;
      }
    }

    return null;
  }

  /**
   * Check if two scopes could conflict
   */
  _scopesConflict(scope1, scope2) {
    // GLOBAL conflicts with everything
    if (scope1 === 'GLOBAL' || scope2 === 'GLOBAL') {
      return true;
    }

    // Same scope always conflicts
    if (scope1 === scope2) {
      return true;
    }

    // MODAL can conflict with PAGE and COMPONENT
    if (scope1 === 'MODAL' && ['PAGE', 'COMPONENT'].includes(scope2)) {
      return true;
    }
    if (scope2 === 'MODAL' && ['PAGE', 'COMPONENT'].includes(scope1)) {
      return true;
    }

    return false;
  }

  /**
   * Register a new shortcut
   * @param {Object} config - Shortcut configuration
   * @returns {Object} Registration result { success, error, id }
   */
  register(config) {
    // Validate config
    const validation = this.validate(config);
    if (!validation.valid) {
      console.error('Invalid shortcut config:', validation.errors);
      return { success: false, error: validation.errors.join(', ') };
    }

    // Use customized keys if available
    const keys = this.customizations.get(config.id) || config.keys || config.defaultKeys;
    const normalizedKeys = this._normalizeKeys(keys);

    // Check for conflicts
    const conflict = this.checkConflict(normalizedKeys, config.scope || 'GLOBAL', config.id);
    if (conflict) {
      console.warn(
        `Shortcut conflict: "${config.id}" conflicts with "${conflict.id}" for keys "${keys}"`
      );
      // Allow registration but mark as conflicted
      config._conflictsWith = conflict.id;
    }

    // Build shortcut object
    const shortcut = {
      id: config.id,
      keys: normalizedKeys,
      originalKeys: config.keys || config.defaultKeys,
      description: config.description,
      category: config.category || 'General',
      scope: config.scope || 'GLOBAL',
      priority: config.priority || 'NORMAL',
      action: config.action,
      component: config.component,
      enabled: !this.disabled.has(config.id),
      globalOverride: config.globalOverride || false,
      _conflictsWith: config._conflictsWith,
    };

    // Store in shortcuts map
    this.shortcuts.set(config.id, shortcut);

    // Update key map for conflict detection
    if (!this.keyMap.has(normalizedKeys)) {
      this.keyMap.set(normalizedKeys, []);
    }
    const keyIds = this.keyMap.get(normalizedKeys);
    if (!keyIds.includes(config.id)) {
      keyIds.push(config.id);
    }

    return { success: true, id: config.id };
  }

  /**
   * Unregister a shortcut
   * @param {string} id - Shortcut ID
   */
  unregister(id) {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut) return;

    // Remove from key map
    const keyIds = this.keyMap.get(shortcut.keys);
    if (keyIds) {
      const index = keyIds.indexOf(id);
      if (index !== -1) {
        keyIds.splice(index, 1);
      }
      if (keyIds.length === 0) {
        this.keyMap.delete(shortcut.keys);
      }
    }

    // Remove from shortcuts
    this.shortcuts.delete(id);
  }

  /**
   * Update a shortcut's key combination
   * @param {string} id - Shortcut ID
   * @param {string} newKeys - New key combination
   * @returns {Object} Update result { success, error }
   */
  updateKeys(id, newKeys) {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut) {
      return { success: false, error: 'Shortcut not found' };
    }

    const normalizedKeys = this._normalizeKeys(newKeys);

    // Check for conflicts
    const conflict = this.checkConflict(normalizedKeys, shortcut.scope, id);
    if (conflict) {
      return { success: false, error: `Conflicts with "${conflict.description}"` };
    }

    // Remove old key mapping
    const oldKeyIds = this.keyMap.get(shortcut.keys);
    if (oldKeyIds) {
      const index = oldKeyIds.indexOf(id);
      if (index !== -1) {
        oldKeyIds.splice(index, 1);
      }
    }

    // Update shortcut
    shortcut.keys = normalizedKeys;

    // Add new key mapping
    if (!this.keyMap.has(normalizedKeys)) {
      this.keyMap.set(normalizedKeys, []);
    }
    this.keyMap.get(normalizedKeys).push(id);

    // Save customization
    this.customizations.set(id, newKeys);
    this._saveCustomizations();

    return { success: true };
  }

  /**
   * Reset a shortcut to its default keys
   * @param {string} id - Shortcut ID
   */
  resetToDefault(id) {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut) return;

    this.customizations.delete(id);
    this._saveCustomizations();

    // Re-register with default keys
    if (shortcut.originalKeys) {
      this.updateKeys(id, shortcut.originalKeys);
    }
  }

  /**
   * Reset all shortcuts to defaults
   */
  resetAllToDefaults() {
    this.customizations.clear();
    this.disabled.clear();
    this._saveCustomizations();

    // Re-register all shortcuts with original keys
    for (const [id, shortcut] of this.shortcuts) {
      if (shortcut.originalKeys) {
        this.updateKeys(id, shortcut.originalKeys);
      }
      shortcut.enabled = true;
    }
  }

  /**
   * Enable/disable a shortcut
   * @param {string} id - Shortcut ID
   * @param {boolean} enabled - Whether to enable
   */
  setEnabled(id, enabled) {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut) return;

    shortcut.enabled = enabled;

    if (enabled) {
      this.disabled.delete(id);
    } else {
      this.disabled.add(id);
    }

    this._saveCustomizations();
  }

  /**
   * Get all registered shortcuts
   * @returns {Array} Array of shortcut objects
   */
  getAllShortcuts() {
    return Array.from(this.shortcuts.values()).filter(s => s.enabled);
  }

  /**
   * Get a specific shortcut by ID
   * @param {string} id - Shortcut ID
   * @returns {Object|null} Shortcut object or null
   */
  getShortcut(id) {
    return this.shortcuts.get(id) || null;
  }

  /**
   * Get shortcuts by scope
   * @param {string} scope - Scope to filter by
   * @returns {Array} Array of shortcuts in that scope
   */
  getShortcutsByScope(scope) {
    return this.getAllShortcuts().filter(s => s.scope === scope);
  }

  /**
   * Get shortcuts by category
   * @param {string} category - Category to filter by
   * @returns {Array} Array of shortcuts in that category
   */
  getShortcutsByCategory(category) {
    return this.getAllShortcuts().filter(s => s.category === category);
  }

  /**
   * Export all shortcuts and customizations
   * @returns {Object} Export data
   */
  export() {
    return {
      shortcuts: Array.from(this.shortcuts.values()),
      customizations: Object.fromEntries(this.customizations),
      disabled: Array.from(this.disabled),
    };
  }

  /**
   * Import shortcuts customizations
   * @param {Object} data - Import data
   */
  import(data) {
    if (data.customizations) {
      this.customizations = new Map(Object.entries(data.customizations));
    }
    if (data.disabled) {
      this.disabled = new Set(data.disabled);
    }
    this._saveCustomizations();
  }
}

export default ShortcutRegistry;
