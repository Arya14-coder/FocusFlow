/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} text
 * @property {boolean} completed
 * @property {number} poms - Number of poms assigned
 * @property {number} completedPoms - Number of poms completed
 */

/**
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} type - 'focus' | 'short-break' | 'long-break'
 * @property {number} duration - In seconds
 * @property {string} startTime - ISO String
 * @property {string} endTime - ISO String
 * @property {number} efficiency - 1-10
 * @property {string} notes
 * @property {string[]} taskIds - Tasks worked on during this session
 */

/**
 * @typedef {Object} Settings
 * @property {number} focusTime - In minutes
 * @property {number} shortBreak - In minutes
 * @property {number} longBreak - In minutes
 * @property {boolean} autoStartBreaks
 * @property {boolean} autoStartFocus
 */

export {};
