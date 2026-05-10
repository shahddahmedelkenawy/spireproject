<template>
  <q-card class="job-card" @click="$emit('open', job.id)">
    <div class="job-card-main">
      <div class="job-left">
        <q-avatar class="job-logo" size="56px">
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
  width: 100%;
  border-radius: 16px;
  padding: 20px 22px 16px;
  border: 1px solid rgba(61, 11, 82, 0.08);
  box-shadow: 0 2px 12px rgba(15, 15, 15, 0.06);
  background: #ffffff;
  transition:
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    transform 0.2s ease;
}

.job-card:hover {
  box-shadow: 0 8px 28px rgba(61, 11, 82, 0.12);
  border-color: rgba(61, 11, 82, 0.14);
}

.job-card-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.job-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1 1 auto;
  min-width: 0;
}

.job-logo {
  flex-shrink: 0;
  background: #f3e8ff;
  color: #3d0b52;
  font-weight: 700;
  font-size: 15px;
}

.job-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.job-title {
  font-size: clamp(16px, 1.25vw, 18px);
  font-weight: 700;
  color: #0f0f0f;
  line-height: 1.3;
}

.job-company {
  font-size: 14px;
  color: #5c5c66;
}

.job-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #73737d;
}

.job-location :deep(.q-icon) {
  color: #8b8b96;
}

.job-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.apply-btn {
  border-radius: 999px;
  background-color: #3d0b52;
  color: #ffffff;
  padding: 0 22px;
  min-height: 42px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(61, 11, 82, 0.35);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;
}

.apply-btn:hover,
.apply-btn:focus {
  background-color: #4f1568;
  color: #ffffff;
  box-shadow: 0 6px 20px rgba(61, 11, 82, 0.45);
  transform: translateY(-1px);
}

.job-tags {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  border-radius: 999px;
  background-color: #f4eef8;
  color: #3d0b52;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
}

@media (max-width: 599px) {
  .job-card-main {
    flex-direction: column;
    align-items: stretch;
  }

  .job-right {
    width: 100%;
    justify-content: stretch;
  }

  .apply-btn {
    width: 100%;
  }

  .job-left {
    align-items: flex-start;
  }
}
</style>

