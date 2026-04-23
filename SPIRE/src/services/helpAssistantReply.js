import {
  HELP_OFF_TOPIC_REPLY,
  jobSeekerKnowledge,
  employerKnowledge,
} from 'src/data/helpAssistantKnowledge'

const STOP = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'for',
  'to',
  'of',
  'in',
  'is',
  'are',
  'my',
  'me',
  'i',
  'you',
  'your',
  'it',
  'be',
  'on',
  'at',
  'do',
  'does',
  'did',
  'how',
  'what',
  'when',
  'where',
  'why',
  'can',
])

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * @param {string} userText
 * @param {import('src/data/helpAssistantKnowledge').HelpEntry[]} entries
 */
function scoreAll(userText, entries) {
  const u = normalize(userText)
  return entries.map((entry) => {
    let s = 0
    for (const kw of entry.keywords) {
      if (u.includes(kw.toLowerCase())) s += 5
    }
    const qWords = entry.question
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
    for (const w of qWords) {
      if (u.includes(w)) s += 1.2
    }
    return { entry, score: s }
  })
}

const GREETING_RE =
  /^(hi+|hello|hey|hiya|good\s*(morning|afternoon|evening)|gm|howdy|sup)\b|what'?s up/i

function isGreeting(u) {
  return GREETING_RE.test(u.trim()) && u.length < 80
}

function isThanks(u) {
  return /\b(thanks|thank you|ty|thx|cheers|appreciate)\b/.test(u)
}

/**
 * @param {string} userMessage
 * @param {{ role?: 'jobseeker' | 'employer' }} [options]
 */
export function getHelpAssistantReply(userMessage, options = {}) {
  const role = options.role === 'employer' ? 'employer' : 'jobseeker'
  const kb = role === 'employer' ? employerKnowledge : jobSeekerKnowledge
  const t = normalize(userMessage)

  if (!t) {
    return "I'm here for jobs and hiring on Spire. What would you like to know?"
  }

  if (isThanks(t)) {
    return role === 'employer'
      ? "You're welcome 😊 Anything else about hiring or your postings?"
      : "You're welcome 😊 Anything else about jobs or your applications?"
  }

  if (isGreeting(t)) {
    return role === 'employer'
      ? "Hey! 😊 I can help with job posts, applicants, and messaging on Spire. What do you need?"
      : "Hey! 😊 What would you like to know? I can help with applications, your profile, or using Spire."
  }

  const scored = scoreAll(t, kb).sort((a, b) => b.score - a.score)
  const best = scored[0]
  const second = scored[1]

  if (!best || best.score < 4) {
    return HELP_OFF_TOPIC_REPLY
  }

  const clearWinner =
    best.score >= 8 ||
    (best.score >= 5 && (!second || best.score >= second.score * 1.45)) ||
    (best.score >= 4 && (!second || best.score - second.score >= 2.5))

  if (clearWinner) {
    return best.entry.answer
  }

  if (best.score >= 4.5) {
    return best.entry.answer
  }

  return HELP_OFF_TOPIC_REPLY
}
