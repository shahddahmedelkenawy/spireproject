<template>
  <div class="employer-messages-host">
    <MessagesListView variant="employer" />
  </div>
</template>

<script setup>
import MessagesListView from 'src/components/messaging/MessagesListView.vue'
</script>

<style scoped>
/* Same purple as job seeker MessagesListView (.msg-list-page → #4b1d4f) */
.employer-messages-host {
  background-color: #4b1d4f;
  min-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  min-height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
}
</style>
