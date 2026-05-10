<template>
  <q-card
    class="applicant-card"
    :class="{ 'applicant-card--dashboard': variant === 'dashboard' }"
    @click="onCardClick"
  >
    <div class="row-top">
      <q-avatar size="44px" class="avatar">
        <img v-if="applicant.profilePhotoUrl" :src="applicant.profilePhotoUrl" alt="" class="avatar-img">
        <span v-else>{{ applicant.initials }}</span>
      </q-avatar>

      <div class="main-col">
        <template v-if="variant === 'applications'">
          <!-- Same row as reference: name + role on the left, outlined Accept/Reject on the right -->
          <div class="apps-layout-row">
            <div class="info-stack">
              <div class="name">{{ applicant.name }}</div>
              <div class="role">{{ applicant.role }}</div>
            </div>
            <div class="actions actions--inline" @click.stop>
              <q-btn
                unelevated
                no-caps
                dense
                label="Accept"
                class="accept-btn"
                @click="$emit('accept', applicant.id)"
              />
              <q-btn
                unelevated
                no-caps
                dense
                label="Reject"
                class="reject-btn"
                @click="$emit('reject', applicant.id)"
              />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="name-actions-row">
            <div class="info">
              <div class="name">{{ applicant.name }}</div>
              <div class="role">{{ applicant.role }}</div>
            </div>
          </div>
        </template>

        <div
          v-if="variant === 'dashboard' && expanded"
          class="dash-actions"
          @click.stop
        >
          <q-btn
            no-caps
            dense
            outline
            icon="chat_bubble_outline"
            label="Message"
            class="dash-btn dash-btn--outline"
            @click="openMessages"
          />
          <q-btn
            no-caps
            dense
            unelevated
            icon="person"
            label="View full profile"
            class="dash-btn dash-btn--solid"
            @click="openFullProfile"
          />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  applicant: {
    type: Object,
    required: true,
  },
  variant: {
    type: String,
    default: 'applications',
    validator: (v) => ['applications', 'dashboard'].includes(v),
  },
})

const emit = defineEmits(['open', 'accept', 'reject'])

const router = useRouter()
const expanded = ref(false)

watch(
  () => props.applicant.id,
  () => {
    expanded.value = false
  },
)

function onCardClick() {
  if (props.variant === 'dashboard') {
    expanded.value = !expanded.value
    return
  }
  emit('open', props.applicant.id)
}

function openMessages() {
  const uid = props.applicant.jobSeekerId
  if (uid) {
    router.push(`/employer/messages/chat/${encodeURIComponent(uid)}`)
  }
}

function openFullProfile() {
  router.push(`/employer/applicant/${props.applicant.id}`)
}
</script>

<style scoped>
.applicant-card {
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 12px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.15s ease;
}

.applicant-card:active {
  transform: scale(0.99);
}

.row-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.main-col {
  flex: 1;
  min-width: 0;
}

.apps-layout-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-width: 0;
}

.info-stack {
  flex: 1;
  min-width: 0;
}

.name-actions-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.info {
  min-width: 0;
  flex: 1;
}

.avatar {
  background: #ede7f6;
  color: #4b1d5a;
  font-weight: 600;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name {
  font-size: 16px;
  font-weight: 500;
  color: #222222;
}

.role {
  font-size: 13px;
  color: #8a8a8a;
  margin-top: 4px;
}

.actions--inline {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
}

/* Reference: white pill, thin dark outline, dark text (both actions match) */
.accept-btn,
.reject-btn {
  border-radius: 999px !important;
  background: #ffffff !important;
  color: #1a1a1a !important;
  border: 1px solid rgba(30, 30, 30, 0.38) !important;
  font-weight: 600;
  font-size: 13px;
  padding: 6px 14px;
  min-height: 36px;
  box-shadow: none !important;
}

.accept-btn :deep(.q-btn__wrapper),
.reject-btn :deep(.q-btn__wrapper) {
  box-shadow: none !important;
}

.dash-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(61, 11, 82, 0.08);
}

.dash-btn {
  flex: 1;
  min-width: min(140px, 100%);
  border-radius: 999px;
  font-weight: 600;
  min-height: 40px;
}

.dash-btn--outline {
  color: #3d0b52 !important;
  border: 2px solid #3d0b52 !important;
  background: #ffffff !important;
}

.dash-btn--outline :deep(.q-icon) {
  color: #3d0b52;
}

.dash-btn--solid {
  background: #3d0b52 !important;
  color: #ffffff !important;
}

.dash-btn--solid :deep(.q-icon) {
  color: #ffffff;
}

.applicant-card--dashboard .name-actions-row {
  align-items: center;
}
</style>
