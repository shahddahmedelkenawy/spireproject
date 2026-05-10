/** Virtual peer id for the in-app assistant (not a Firestore user). */
export const ASSISTANT_PEER_ID = 'spire-assistant'

/** Default labels for the assistant row (replace via CMS/API later). */
export const assistantConversationDefaults = {
  peerId: ASSISTANT_PEER_ID,
  name: 'Spira',
  badge: 'Your assistant',
  preview: 'Jobs, hiring & using Spire. Ask me anything.',
}

/** localStorage: last seen Spira *inbound* message doc id (for list unread dot). */
export function spireAssistantSeenMsgKey(uid) {
  return `spireAssistantSeenMsg:${uid || ''}`
}
