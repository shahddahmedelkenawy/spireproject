/** Virtual peer id for the in-app assistant (not a Firestore user). */
export const ASSISTANT_PEER_ID = 'spire-assistant'

/** Default labels for the assistant row (replace via CMS/API later). */
export const assistantConversationDefaults = {
  peerId: ASSISTANT_PEER_ID,
  name: 'Spira',
  badge: 'AI Assistant',
  preview: 'Ask me anything about your job journey.',
}
