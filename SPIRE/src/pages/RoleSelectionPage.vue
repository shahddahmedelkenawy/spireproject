<template>
  <q-page class="role-page">
    <div class="inner">
      <h1>Select your role</h1>
      <q-btn no-caps class="role-btn" label="Join as Job Seeker" @click="$router.push({ path: '/signup', query: { role: 'seeker' } })" />
      <q-btn no-caps class="role-btn" label="Join as Employer" @click="$router.push({ path: '/signup', query: { role: 'employer' } })" />
    </div>
  </q-page>
</template>

<style scoped>
.role-page{display:flex;align-items:center;justify-content:center;background:#ffffff;min-height:100vh}
.inner{width:100%;max-width:420px;padding:16px;display:flex;flex-direction:column;gap:12px}
h1{font-size:20px;font-weight:600;color:#4B1D5A;margin:0 0 4px}
.role-btn{height:46px;border-radius:999px;background:#4B1D5A;color:#fff}
</style>

