/**
 * Rule-based replies for Spira (in-app assistant). Replace with API/LLM later if needed.
 */
export function getSpiraReply(userMessage) {
  const t = (userMessage || '').trim().toLowerCase()
  if (!t) {
    return "I'm here to help with your job search, applications, and career questions. What would you like to know?"
  }
  if (/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(t)) {
    return "Hi! I'm Spira. I can help with résumés, interviews, applications, and navigating SPIRE. What do you need today?"
  }
  if (/\b(thanks|thank you|ty)\b/.test(t)) {
    return "You're welcome — good luck with your next step!"
  }
  if (/\b(resume|cv|cover letter)\b/.test(t)) {
    return 'For your résumé: keep it concise, match keywords to the job posting, and lead with impact (numbers where you can). Want tips for a specific role or section?'
  }
  if (/\b(interview)\b/.test(t)) {
    return 'Interview prep: research the company, prepare STAR stories for behavioral questions, and have 2–3 questions ready for them. Practice out loud if you can.'
  }
  if (/\b(apply|application|job)\b/.test(t)) {
    return 'When you apply: tailor your message to the role, follow any instructions in the posting, and keep your profile on SPIRE up to date so employers see the best version of you.'
  }
  if (/\b(salary|pay|negotiat)\b/.test(t)) {
    return 'Salary discussions work best with a range in mind from trusted sources, and after you understand the full role and benefits. Happy to help you phrase a professional reply.'
  }
  if (/\b(spira|who are you|what can you do)\b/.test(t)) {
    return "I'm Spira, your in-app assistant on SPIRE. I can offer quick guidance on job search, applications, and using the app — ask me anything!"
  }
  return "Thanks for your message. I can help with applications, profiles, interviews, and using SPIRE. Try asking about your résumé, a job search tip, or how to message an employer."
}
