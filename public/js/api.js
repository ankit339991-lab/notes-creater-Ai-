/**
 * TubeNotes AI - Client API Service
 * Encapsulates backend communication with error handling and polling.
 */

export const Api = {
  /**
   * Submits a YouTube URL to start generating study notes
   * @param {string} url 
   * @param {object} options 
   * @returns {Promise<{ taskId: string, checkStatusUrl: string }>}
   */
  async generateNotes(url, options = {}) {
    const response = await fetch('/api/generate-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, ...options })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to initiate note generation.');
    }

    return data;
  },

  /**
   * Polls the status of a note generation task
   * @param {string} taskId 
   * @returns {Promise<object>} Task status
   */
  async checkTaskStatus(taskId) {
    const response = await fetch(`/api/tasks/${taskId}`);
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to check task status.');
    }
    return data.task;
  },

  /**
   * Fetches the generated notes by note ID
   * @param {string} notesId 
   * @returns {Promise<object>}
   */
  async getNotes(notesId) {
    const response = await fetch(`/api/notes/${notesId}`);
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch study notes.');
    }
    return data.note;
  },

  /**
   * Fetches recent notes history
   * @returns {Promise<Array>}
   */
  async listAllNotes() {
    const response = await fetch('/api/notes');
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch notes list.');
    }
    return data.notes || [];
  },

  /**
   * Deletes a note by ID
   * @param {string} notesId 
   */
  async deleteNote(notesId) {
    const response = await fetch(`/api/notes/${notesId}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete note.');
    }
    return data;
  },

  /**
   * Checks backend health
   */
  async checkHealth() {
    try {
      const res = await fetch('/api/health');
      return res.ok;
    } catch {
      return false;
    }
  }
};

