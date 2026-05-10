<template>
  <q-page class="legal-page">
    <article class="legal-page__article prose-wrap">
      <p class="legal-page__eyebrow">
        About SPIRE
      </p>
      <h1 class="legal-page__title">
        Hiring focused on ability
      </h1>
      <p class="legal-page__lead">
        SPIRE connects employers and job seekers through an accessible experience designed for clarity,
        dignity, and efficiency—from discovery and applications to messaging and profile tools.
      </p>

      <section aria-labelledby="mission-heading">
        <h2 id="mission-heading" class="legal-page__h2">
          Our mission
        </h2>
        <p>
          We believe hiring should evaluate ability first. SPIRE helps teams publish roles, manage applicants,
          and communicate with candidates while giving job seekers structured paths to showcase strengths and
          pursue meaningful work.
        </p>
      </section>

      <section aria-labelledby="access-heading">
        <h2 id="access-heading" class="legal-page__h2">
          Accessibility and inclusion
        </h2>
        <p>
          The platform is built with accessibility-minded patterns and responsive layouts across desktop,
          tablet, and mobile browsers—so people can participate comfortably on the devices they already use.
        </p>
      </section>

      <section aria-labelledby="start-heading">
        <h2 id="start-heading" class="legal-page__h2">
          Get started
        </h2>
        <p>
          Ready to explore roles or post a job?
          <router-link class="legal-page__inline-link" to="/signup">Create an account</router-link>,
          or <router-link class="legal-page__inline-link" to="/login">sign in</router-link>
          if you already have one.
        </p>
      </section>
    </article>
  </q-page>
</template>

<style scoped>
.legal-page {
  padding: clamp(24px, 4vw, 48px) 0 clamp(48px, 8vw, 80px);
}

.prose-wrap {
  width: 100%;
  max-width: min(760px, 100%);
  margin: 0 auto;
}

.legal-page__eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(61, 11, 82, 0.75);
}

.legal-page__title {
  margin: 0 0 16px;
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.15;
  font-weight: 800;
  color: #1b0f24;
}

.legal-page__lead {
  margin: 0 0 28px;
  font-size: 18px;
  line-height: 1.6;
  color: rgba(27, 15, 36, 0.78);
}

.legal-page__h2 {
  margin: 28px 0 12px;
  font-size: 20px;
  font-weight: 800;
  color: #1b0f24;
}

p {
  margin: 0 0 14px;
  font-size: 16px;
  line-height: 1.7;
  color: rgba(27, 15, 36, 0.82);
}

.legal-page__inline-link {
  color: #3d0b52;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
