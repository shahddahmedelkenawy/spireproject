/**
 * Knowledge base for the in-app help assistant (job seeker vs employer).
 * Matched via keyword / intent scoring in helpAssistantReply.js
 */

export const HELP_ASSISTANT_WELCOME =
  "Hi there! 😊 I'm your assistant. I'm here to help you with anything related to jobs or hiring. What would you like to do today?"

export const HELP_OFF_TOPIC_REPLY =
  'Thank you for your message 😊 A member of the Spire team will contact you soon.'

/** @typedef {{ id: string, question: string, keywords: string[], answer: string }} HelpEntry */

/** @type {HelpEntry[]} */
export const jobSeekerKnowledge = [
  {
    id: 'js-find-jobs',
    question: 'How can I find suitable jobs?',
    keywords: ['find', 'browse', 'search', 'jobs', 'opportunities', 'suitable', 'discover', 'where'],
    answer:
      'Easy 😊 Just go to the Jobs section and browse available opportunities. You can use filters to find what suits your skills and interests.',
  },
  {
    id: 'js-filter-skills',
    question: 'Can I filter jobs based on my skills?',
    keywords: ['filter', 'filters', 'skills', 'narrow', 'experience', 'location', 'job type', 'type'],
    answer:
      'Yes 👍 Use the filters to narrow down jobs by experience level, job type or location.',
  },
  {
    id: 'js-not-relevant',
    question: 'Why am I not seeing relevant jobs?',
    keywords: ['relevant', 'not seeing', 'no jobs', 'matches', 'incomplete', 'profile'],
    answer:
      'This might be because your profile is incomplete. Try adding your skills and experience to get better matches 💡',
  },
  {
    id: 'js-how-apply',
    question: 'How do I apply for a job?',
    keywords: ['apply', 'application', 'how do i apply', 'submit', 'recommended jobs', 'home'],
    answer: 'Simply open the Home page, go to recommended jobs and click Apply 🚀',
  },
  {
    id: 'js-multiple-apply',
    question: 'Can I apply to more than one job?',
    keywords: ['more than one', 'multiple', 'many', 'several', 'how many'],
    answer: 'Of course! You can apply to as many jobs as you like 🙌',
  },
  {
    id: 'js-cant-apply',
    question: "Why can't I apply for a job?",
    keywords: ["can't apply", 'cannot apply', 'unable', 'blocked', 'documents', 'complete profile'],
    answer:
      'Make sure your profile is complete and required documents are uploaded. That\'s usually the reason 😉',
  },
  {
    id: 'js-profile-before-apply',
    question: 'Do I need to complete my profile before applying?',
    keywords: ['complete profile', 'before applying', 'profile first', 'finish profile'],
    answer:
      'Yes, completing your profile helps employers understand your skills better and increases your chances ✨',
  },
  {
    id: 'js-pending',
    question: 'What does Pending mean?',
    keywords: ['pending', 'under review', 'waiting', 'status'],
    answer: 'It means your application is still under review. Hang tight ⏳',
  },
  {
    id: 'js-accepted',
    question: 'What does Accepted mean?',
    keywords: ['accepted', 'acceptance', 'selected', 'good news'],
    answer: 'Great news 🎉 It means the employer is interested in moving forward with you!',
  },
  {
    id: 'js-rejected',
    question: 'What does Rejected mean?',
    keywords: ['rejected', 'rejection', 'not selected', 'declined'],
    answer: "It means you weren't selected this time, but don't worry, keep applying 💪",
  },
  {
    id: 'js-response-time',
    question: 'How long does it take to get a response?',
    keywords: ['how long', 'response time', 'wait', 'hear back', 'timeline'],
    answer:
      "It depends on the employer, but you can always track updates in your Applications section.",
  },
  {
    id: 'js-contact-employer',
    question: 'Can I contact the employer directly?',
    keywords: ['contact', 'employer', 'directly', 'reach', 'message', 'talk'],
    answer: 'You can communicate through the system messages 💬',
  },
  {
    id: 'js-know-accepted',
    question: 'How will I know if I get accepted?',
    keywords: ['know accepted', 'if i get', 'accepted notification', 'tell me'],
    answer: "You'll receive a notification as soon as there's an update 🔔",
  },
  {
    id: 'js-qualify',
    question: 'How do I know if I qualify for a job?',
    keywords: ['qualify', 'eligible', 'requirements', 'match', 'fit'],
    answer:
      'Check the job requirements section. If your skills match most of them, go ahead and apply 👍',
  },
  {
    id: 'js-not-all-requirements',
    question: "Can I apply if I don't meet all requirements?",
    keywords: ['100%', 'all requirements', 'meet every', 'missing', 'still apply'],
    answer: "Yes! You don't have to match 100%. If you're close, give it a shot 💪",
  },
  {
    id: 'js-interview-selected',
    question: "How will I know if I'm selected for an interview?",
    keywords: ['interview', 'selected', 'invite', 'shortlisted for interview'],
    answer: "You'll get a notification with all the details 📩",
  },
  {
    id: 'js-interview-details-where',
    question: 'Where can I see interview details?',
    keywords: ['interview details', 'where', 'see interview', 'when is interview'],
    answer: 'Check your notifications or messages section.',
  },
  {
    id: 'js-profile-chances',
    question: 'Does my profile affect my chances?',
    keywords: ['profile', 'chances', 'odds', 'improve'],
    answer: 'Definitely! A complete profile increases your chances a lot 🌟',
  },
  {
    id: 'js-no-responses',
    question: 'Why am I not getting responses?',
    keywords: ['no responses', 'no reply', 'silent', 'nothing back', 'ghosted'],
    answer:
      'Try improving your profile, adding skills, or applying to more jobs. Small changes can make a big difference 😉',
  },
]

/** @type {HelpEntry[]} */
export const employerKnowledge = [
  {
    id: 'em-post',
    question: 'How do I post a job?',
    keywords: ['post a job', 'post job', 'new job', 'create job', 'listing', 'posting'],
    answer: 'Just go to Post Job section and click on Post a New Job ➕',
  },
  {
    id: 'em-include',
    question: 'What should I include in a job post?',
    keywords: ['include', 'job post', 'write', 'title', 'description', 'requirements'],
    answer:
      'Add a clear title, job description, required skills, and responsibilities. The clearer, the better 👍',
  },
  {
    id: 'em-attractive',
    question: 'How do I make my job post more attractive?',
    keywords: ['attractive', 'stand out', 'better post', 'more applicants', 'compelling'],
    answer: "Keep it clear, highlight benefits, and be specific about what you're looking for ✨",
  },
  {
    id: 'em-edit',
    question: 'How do I edit a job post?',
    keywords: ['edit', 'change job', 'update post', 'modify'],
    answer: 'Open your job and click Edit ✏️',
  },
  {
    id: 'em-close',
    question: 'How do I close a job vacancy?',
    keywords: ['close', 'delete', 'remove job', 'filled', 'vacancy'],
    answer:
      'You can delete it from the post job page once you\'ve found the right candidate ✅',
  },
  {
    id: 'em-no-apps',
    question: 'Why is my job not receiving applications?',
    keywords: ['no applications', 'no applicants', 'not receiving', 'zero applications'],
    answer:
      'Try improving the job description or requirements, or make sure it\'s visible and complete 👀',
  },
  {
    id: 'em-where-applicants',
    question: 'Where can I find applicants?',
    keywords: ['find applicants', 'applicants page', 'list', 'where applicants', 'candidate list'],
    answer: 'Open the Applicants page and click View or Search for Applicants 👥',
  },
  {
    id: 'em-review',
    question: 'How do I review applicants?',
    keywords: ['review', 'look at', 'see applicants', 'profiles', 'documents'],
    answer:
      'You can view their profiles, skills, and documents directly from the applicants list.',
  },
  {
    id: 'em-shortlist',
    question: 'How do I shortlist candidates?',
    keywords: ['shortlist', 'shortlisted', 'favorite', 'mark'],
    answer: 'Select the candidate and update their status to shortlisted ⭐',
  },
  {
    id: 'em-accept-reject',
    question: 'How do I accept or reject an applicant?',
    keywords: ['accept', 'reject', 'decline', 'status', 'decision'],
    answer: 'Just update their application status with one click 👍',
  },
  {
    id: 'em-best-candidate',
    question: 'How do I choose the best candidate?',
    keywords: ['best', 'choose', 'compare', 'decide', 'pick'],
    answer: 'Look at their skills, experience, and how well they match your job requirements 🎯',
  },
  {
    id: 'em-schedule-interview',
    question: 'How do I schedule an interview?',
    keywords: ['schedule', 'interview', 'invite interview', 'set up interview'],
    answer: 'Select a candidate and send them interview details through the system messages 📅',
  },
  {
    id: 'em-interview-times',
    question: 'Can I manage interview times?',
    keywords: ['reschedule', 'interview time', 'change time', 'manage interview'],
    answer: 'Yes, you can update or reschedule interviews anytime.',
  },
  {
    id: 'em-contact-applicants',
    question: 'How can I contact applicants?',
    keywords: ['contact', 'message', 'reach', 'applicants', 'candidates'],
    answer: 'Use the messaging feature to communicate with them directly 💬',
  },
  {
    id: 'em-attract-more',
    question: 'How can I attract more applicants?',
    keywords: ['attract more', 'more candidates', 'visibility', 'hiring'],
    answer: 'Write clear job descriptions and highlight what makes your company great 🌟',
  },
  {
    id: 'em-not-qualified',
    question: 'Why am I not getting qualified candidates?',
    keywords: ['qualified', 'not qualified', 'weak candidates', 'requirements too strict', 'flexible'],
    answer: 'Try adjusting your requirements or making them more flexible.',
  },
]
