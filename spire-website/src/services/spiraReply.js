/**
 * Spira assistant replies — conversational help using the in-app knowledge base.
 * @see getHelpAssistantReply
 */
import { getHelpAssistantReply } from './helpAssistantReply'

/**
 * @param {string} userMessage
 * @param {{ role?: 'jobseeker' | 'employer' }} [options]
 */
export function getSpiraReply(userMessage, options = {}) {
  return getHelpAssistantReply(userMessage, options)
}
