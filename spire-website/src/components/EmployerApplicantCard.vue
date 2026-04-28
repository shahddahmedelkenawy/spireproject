<template>
  <q-card class="applicant-card" @click="$emit('open', applicant.id)">
    <div class="row-top">
      <q-avatar size="44px" class="avatar">
        <img v-if="applicant.profilePhotoUrl" :src="applicant.profilePhotoUrl" alt="" class="avatar-img">
        <span v-else>{{ applicant.initials }}</span>
      </q-avatar>
      <div class="info">
        <div class="name">{{ applicant.name }}</div>
        <div class="role">{{ applicant.role }}</div>
      </div>
    </div>

    <div class="actions">
      <q-btn
        no-caps
        icon="check"
        label="Accept"
        class="accept-btn"
        @click.stop="$emit('accept', applicant.id)"
      />
      <q-btn
        no-caps
        icon="close"
        label="Reject"
        class="reject-btn"
        @click.stop="$emit('reject', applicant.id)"
      />
    </div>
  </q-card>
</template>

<script setup>
defineProps({
  applicant: {
    type: Object,
    required: true,
  },
})

defineEmits(['open', 'accept', 'reject'])
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

.avatar {
  background: #ede7f6;
  color: #4B1D5A;
  font-weight: 600;
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
  color: #8A8A8A;
}

.actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}

.accept-btn {
  flex: 1;
  border-radius: 999px;
  background: #DFF2E7;
  color: #1F8A5B;
  font-weight: 600;
}

.reject-btn {
  flex: 1;
  border-radius: 999px;
  background: #F6E2E2;
  color: #C0392B;
  font-weight: 600;
}
</style>

