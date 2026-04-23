import { db } from 'src/boot/firebase'
import {
  addDoc,
  collection,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  doc,
} from 'firebase/firestore'
import { getJobById, listCompanyJobs } from './jobService'
import { getCompany, listCompaniesByOwner } from './companyService'
import { getUserProfile } from './userService'
import { addNotification } from './notificationService'
import { getMedicalProfileByUser } from './iqTestService'

function mapDbJobTypeToFormLabel(type) {
  const t = (type || 'fulltime').toLowerCase()
  if (t === 'parttime') return 'Part Time'
  if (t === 'freelancer') return 'Freelancer'
  if (t === 'volunteer') return 'Volunteer'
  return 'Full Time'
}

/** Aligns with dashboard / Home experience filter options */
function mapSeekerToExperienceLevel(seeker) {
  const e = seeker?.experienceLevel || seeker?.experience
  if (typeof e === 'string') {
    const x = e.toLowerCase()
    if (x.includes('entry')) return 'Entry level'
    if (x.includes('junior')) return 'Junior'
    if (x.includes('mid')) return 'Mid level'
    if (x.includes('senior')) return 'Senior'
  }
  return 'Mid level'
}

/** Aligns with dashboard disability filter pills */
function normalizeWorkModeLabel(v) {
  if (!v) return ''
  if (v === 'Flexible') return 'Flexible hours'
  return String(v).trim()
}

function normalizeDisabilityType(raw) {
  const s = String(raw || '').toLowerCase()
  if (!s) return 'Physical'
  if (s.includes('visual')) return 'Visual'
  if (s.includes('hear')) return 'Hearing'
  if (s.includes('intellect')) return 'Intellectual'
  if (s.includes('mental')) return 'Mental health'
  if (s.includes('neuro')) return 'Neurodivergent'
  if (s.includes('mobility') || s.includes('physical')) return 'Physical'
  return 'Physical'
}

export async function createApplication(payload) {
  const existing = query(
    collection(db, 'applications'),
    where('jobId', '==', payload.jobId),
    where('jobSeekerId', '==', payload.jobSeekerId)
  )
  const existingSnap = await getDocs(existing)
  if (!existingSnap.empty) {
    return existingSnap.docs[0].id
  }

  const job = await getJobById(payload.jobId)
  const companyId = job?.companyId || null

  const ref = await addDoc(collection(db, 'applications'), {
    jobId: payload.jobId,
    jobSeekerId: payload.jobSeekerId,
    ...(companyId ? { companyId } : {}),
    status: payload.status || 'pending',
    answers: payload.answers || {},
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'applications', ref.id), { id: ref.id })

  try {
    const jobLabel = job?.title || job?.name || 'this role'

    try {
      await addNotification({
        userId: payload.jobSeekerId,
        type: 'application',
        message: `You applied to ${jobLabel}. The employer may review your profile soon.`,
        title: 'Application sent',
        subtitle: `Your application to ${jobLabel} was submitted.`,
        icon: 'send',
        jobId: payload.jobId,
        triggeredBy: payload.jobSeekerId,
      })
    } catch (e) {
      console.warn('Could not notify job seeker of application:', e)
    }

    if (companyId) {
      try {
        const company = await getCompany(companyId)
        if (company?.ownerId) {
          const seeker = await getUserProfile(payload.jobSeekerId)
          await addNotification({
            userId: company.ownerId,
            type: 'application',
            message: `${seeker?.name || 'Someone'} applied to ${jobLabel}.`,
            title: 'New job application',
            subtitle: `${seeker?.name || 'Someone'} applied to ${job.title || job.name || 'your job'}.`,
            icon: 'work',
            senderId: payload.jobSeekerId,
            senderName: seeker?.name || '',
            senderImage: seeker?.profilePhotoUrl || '',
            companyLogo: company?.logo || '',
            jobId: payload.jobId,
          })
        }
      } catch (e) {
        console.warn('Could not notify employer of application:', e)
      }
    }
  } catch (e) {
    console.warn('Could not load job for application notifications:', e)
  }

  return ref.id
}

export async function updateApplicationStatus(applicationId, status, triggeredBy = null) {
  const appRef = doc(db, 'applications', applicationId)
  const snap = await getDoc(appRef)
  const prev = snap.exists() ? snap.data() : null

  /*
   * Backfill companyId in its own write so Firestore rules can authorize employers via
   * employerOwnsApplicationByCompanyId() before status-only updates.
   */
  if (prev && !prev.companyId && prev.jobId) {
    try {
      const job = await getJobById(prev.jobId)
      if (job?.companyId) {
        await updateDoc(appRef, { companyId: job.companyId })
      }
    } catch {
      /* ignore */
    }
  }

  await updateDoc(appRef, { status })

  if (prev?.jobSeekerId && triggeredBy) {
    try {
      let companyLogo = ''
      let jobTitle = 'this position'
      if (prev.jobId) {
        const job = await getJobById(prev.jobId)
        jobTitle = job?.title || job?.name || jobTitle
        if (job?.companyId) {
          const co = await getCompany(job.companyId)
          companyLogo = co?.logo || ''
        }
      }
      const statusStr = String(status || '').toLowerCase()
      let statusMessage
      if (statusStr === 'accepted') {
        statusMessage = `Your application for ${jobTitle} was accepted by the employer.`
      } else if (statusStr === 'rejected') {
        statusMessage = `Your application for ${jobTitle} was not selected by the employer.`
      } else {
        const statusLabel = String(status || '').replace(/_/g, ' ')
        statusMessage = `Your application for ${jobTitle} is ${statusLabel}.`
      }
      await addNotification({
        userId: prev.jobSeekerId,
        type: 'application',
        message: statusMessage,
        title: 'Application update',
        subtitle: `Your application status is now: ${status}.`,
        icon: 'assignment',
        triggeredBy,
        companyLogo,
        jobId: prev.jobId || null,
      })
    } catch (e) {
      console.warn('Could not notify job seeker:', e)
    }
  }
}

export async function getApplicationsForJob(jobId) {
  const q = query(collection(db, 'applications'), where('jobId', '==', jobId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getApplicationsForJobSeeker(jobSeekerId) {
  const q = query(collection(db, 'applications'), where('jobSeekerId', '==', jobSeekerId))
  const snap = await getDocs(q)
  const apps = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  const enriched = await Promise.all(
    apps.map(async (app) => {
      const job = await getJobById(app.jobId)
      const company = job?.companyId ? await getCompany(job.companyId) : null
      return {
        ...app,
        jobTitle: job?.title || job?.name || 'Unknown Job',
        jobType: job?.type || '',
        companyName: company?.name || '',
        salary: job?.salary ?? '',
      }
    })
  )
  return enriched
}

export async function getApplicationsForEmployer(ownerId) {
  const companies = await listCompaniesByOwner(ownerId)
  if (!companies.length) return []

  const companyJobs = []
  for (const c of companies) {
    const jobs = await listCompanyJobs(c.id)
    companyJobs.push(...jobs)
  }
  if (!companyJobs.length) return []

  const pairs = []
  for (const job of companyJobs) {
    const apps = await getApplicationsForJob(job.id)
    for (const app of apps) {
      pairs.push({ app, job })
    }
  }

  const enriched = await Promise.all(
    pairs.map(async ({ app, job }) => {
      const seeker = await getUserProfile(app.jobSeekerId)
      const med = await getMedicalProfileByUser(app.jobSeekerId)
      const name = seeker?.name || 'Applicant'
      const initials = name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

      const workMode = normalizeWorkModeLabel(job.accessibilityFeatures || '')
      const jobTypeLabel = mapDbJobTypeToFormLabel(job.type)

      return {
        ...app,
        jobTitle: job.title || job.name || 'Untitled Job',
        name,
        initials: initials || 'AP',
        profilePhotoUrl: seeker?.profilePhotoUrl || '',
        role: seeker?.speciality || seeker?.fieldDescription || 'Job Seeker',
        location: seeker?.address || 'Egypt',
        email: seeker?.email || '',
        experienceLevel: mapSeekerToExperienceLevel(seeker),
        disabilityType: normalizeDisabilityType(med?.disabilityType),
        workMode,
        jobTypeLabel,
      }
    })
  )

  return enriched
}


