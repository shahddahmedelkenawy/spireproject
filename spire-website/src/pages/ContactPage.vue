<template>
  <q-page class="contact-page">
    <div class="contact-page__inner">
      <header class="contact-page__header">
        <p class="contact-page__eyebrow">
          Contact
        </p>
        <h1 class="contact-page__title">
          Talk with the SPIRE team
        </h1>
        <p class="contact-page__sub">
          Questions about hiring, accessibility, partnerships, or support? Send us a message— we read every note.
        </p>
      </header>

      <q-card flat bordered class="contact-page__card">
        <q-card-section>
          <q-form class="contact-form" @submit.prevent="submit">
            <q-input
              v-model="name"
              outlined
              label="Your name"
              :rules="[(v) => !!v || 'Name is required']"
              lazy-rules
            />
            <q-input
              v-model="email"
              outlined
              type="email"
              label="Email"
              :rules="[
                (v) => !!v || 'Email is required',
                (v) => /.+@.+\..+/.test(v) || 'Enter a valid email',
              ]"
              lazy-rules
            />
            <q-input
              v-model="message"
              outlined
              type="textarea"
              autogrow
              label="How can we help?"
              :rules="[(v) => !!v || 'Message is required']"
              lazy-rules
            />

            <div class="contact-form__actions">
              <q-btn
                type="submit"
                color="primary"
                unelevated
                no-caps
                class="contact-form__submit"
                label="Send message"
              />
            </div>

            <p class="contact-form__hint">
              This opens your email app with your message pre-filled. You can replace the recipient address in your mail client if needed.
            </p>
          </q-form>
        </q-card-section>
      </q-card>

      <aside class="contact-page__aside" aria-label="Other ways to reach us">
        <p>
          Prefer browsing first?
          <router-link class="contact-page__link" to="/jobs">Explore open roles</router-link>
          or
          <router-link class="contact-page__link" to="/companies">browse companies</router-link>.
        </p>
      </aside>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { Notify } from 'quasar'

/** Update this to your team inbox before launch. */
const CONTACT_EMAIL = 'support@spire.app'

const name = ref('')
const email = ref('')
const message = ref('')

function submit() {
  const subject = encodeURIComponent(`SPIRE web contact: ${name.value}`)
  const body = encodeURIComponent(
    `Name: ${name.value}\nEmail: ${email.value}\n\n${message.value}\n`,
  )
  const href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`

  try {
    window.location.href = href
    Notify.create({
      type: 'positive',
      message: 'Opening your email app…',
      timeout: 2500,
    })
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Could not open email. Please contact us directly.',
    })
  }
}
</script>

<style scoped>
.contact-page {
  padding: clamp(24px, 4vw, 48px) 0 clamp(48px, 8vw, 80px);
}

.contact-page__inner {
  width: 100%;
  max-width: min(720px, 100%);
  margin: 0 auto;
}

.contact-page__eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(61, 11, 82, 0.75);
}

.contact-page__title {
  margin: 0 0 12px;
  font-size: clamp(28px, 4vw, 36px);
  line-height: 1.15;
  font-weight: 800;
  color: #1b0f24;
}

.contact-page__sub {
  margin: 0 0 24px;
  font-size: 16px;
  line-height: 1.65;
  color: rgba(27, 15, 36, 0.78);
}

.contact-page__card {
  border-radius: var(--spire-radius-lg);
  box-shadow: var(--spire-shadow-soft);
}

.contact-form {
  display: grid;
  gap: 14px;
}

.contact-form__actions {
  margin-top: 6px;
}

.contact-form__submit {
  min-width: 160px;
  border-radius: 999px;
}

.contact-form__hint {
  margin: 12px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(27, 15, 36, 0.62);
}

.contact-page__aside {
  margin-top: 18px;
  font-size: 14px;
  line-height: 1.65;
  color: rgba(27, 15, 36, 0.72);
}

.contact-page__link {
  color: #3d0b52;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
