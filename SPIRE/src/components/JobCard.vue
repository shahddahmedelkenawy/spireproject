<template>
  <q-card class="job-card" @click="$emit('open', job.id)">
    <div class="job-card-main">
      <div class="job-left">
        <q-avatar class="job-logo" size="40px">
          <span>{{ job.logoInitials }}</span>
        </q-avatar>
        <div class="job-info">
          <div class="job-title">
            {{ job.title }}
          </div>
          <div class="job-company">
            {{ job.company }}
          </div>
          <div class="job-location">
            <q-icon name="place" size="16px" />
            <span>{{ job.location }}</span>
          </div>
        </div>
      </div>
      <div class="job-right">
        <q-btn
          no-caps
          class="apply-btn"
          label="Apply Now"
          @click.stop="$emit('apply', job.id)"
        />
      </div>
    </div>

    <div class="job-tags">
      <q-chip
        v-for="tag in job.accessibilityTags"
        :key="tag"
        dense
        class="tag-chip"
      >
        {{ tag }}
      </q-chip>
    </div>
  </q-card>
</template>

<script setup>
const props = defineProps({
  job: {
    type: Object,
    required: true,
  },
})

defineEmits(['open', 'apply'])

void props
</script>

<style scoped>
.job-card {
  border-radius: 18px;
  padding: 14px 14px 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  background: #ffffff;
}

.job-card-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.job-left {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 247px;
}

.job-logo {
  background: #f3e8ff;
  color: #4B1E5A;
  font-weight: 700;
  font-size: 14px;
}

.job-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.job-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e1e1e;
}

.job-company {
  font-size: 13px;
  color: #6b6b6b;
}

.job-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8a8a8a;
}

.job-right {
  display: flex;
  align-items: center;
}

.apply-btn {
  border-radius: 999px;
  background-color: #4B1E5A;
  color: #ffffff;
  padding: 0 16px;
  height: 36px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(75, 30, 90, 0.35);
  transition: all 0.2s ease;
}

.apply-btn:hover,
.apply-btn:focus {
  background-color: #ffffff;
  color: #4B1E5A;
  border: 1px solid #4B1E5A;
  box-shadow: 0 6px 16px rgba(75, 30, 90, 0.4);
}

.job-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-chip {
  border-radius: 999px;
  background-color: #f3e8ff;
  color: #4B1E5A;
  font-size: 11px;
  padding: 2px 8px;
}
</style>

