import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src')

const jobSvc = path.join(root, 'services/jobService.js')
let js = fs.readFileSync(jobSvc, 'utf8')
if (!js.includes('String(jobId)')) {
  js = js.replace(
    'export async function deleteJob(jobId) {\n  await deleteDoc(doc(db, \'jobs\', jobId))\n}',
    "export async function deleteJob(jobId) {\n  await deleteDoc(doc(db, 'jobs', String(jobId)))\n}",
  )
  fs.writeFileSync(jobSvc, js, 'utf8')
  console.log('patched jobService deleteJob')
}

const listings = path.join(root, 'pages/EmployerJobPostingsPage.vue')
let vue = fs.readFileSync(listings, 'utf8')
vue = vue.replace(
  "import { computed, onMounted, ref } from 'vue'\nimport { useRouter } from 'vue-router'",
  "import { computed, onActivated, onMounted, ref, watch } from 'vue'\nimport { useRoute, useRouter } from 'vue-router'",
)
vue = vue.replace(
  'const router = useRouter()\nconst $q = useQuasar()',
  'const route = useRoute()\nconst router = useRouter()\nconst $q = useQuasar()',
)
vue = vue.replace(
  `  $q.dialog({
    title: 'Delete job',
    message: \`Remove "${title}"? This cannot be undone.\`,
    cancel: true,
    persistent: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(async () => {
    deletingId.value = job.id
    try {
      await deleteJob(job.id)`,
  `  $q.dialog({
    title: 'Delete job',
    message: 'Remove this job post? This cannot be undone.',
    cancel: true,
    persistent: true,
    ok: { label: 'Delete', color: 'negative' },
  }).onOk(async () => {
    deletingId.value = job.id
    try {
      await deleteJob(String(job.id))`,
)

// Fix if message still has curly quotes from original
vue = vue.replace(
  /message: `Remove [^`]+`,/,
  "message: 'Remove this job post? This cannot be undone.',",
)

if (!vue.includes('watch(')) {
  vue = vue.replace(
    'onMounted(load)\n</script>',
    `watch(
  () => route.fullPath,
  () => {
    if (route.path === '/employer/post-job') load()
  },
)

onMounted(load)
onActivated(load)
</script>`,
  )
}

fs.writeFileSync(listings, vue, 'utf8')
console.log('patched EmployerJobPostingsPage')
