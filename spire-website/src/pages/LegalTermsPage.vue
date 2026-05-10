<template>
  <q-page class="legal-page">
    <article class="legal-page__article prose-wrap">
      <p class="legal-page__eyebrow">
        Legal
      </p>
      <h1 class="legal-page__title">
        Terms of Service
      </h1>
      <p class="legal-page__muted">
        Last updated: May 10, 2026
      </p>

      <section aria-labelledby="t1">
        <h2 id="t1" class="legal-page__h2">
          Agreement
        </h2>
        <p>
          By accessing or using SPIRE, you agree to these Terms. If you do not agree, do not use the service.
        </p>
      </section>

      <section aria-labelledby="t2">
        <h2 id="t2" class="legal-page__h2">
          The service
        </h2>
        <p>
          SPIRE provides tools to discover opportunities, apply to roles, communicate with other users, and manage
          hiring workflows. Features may change over time as we improve the product.
        </p>
      </section>

      <section aria-labelledby="t3">
        <h2 id="t3" class="legal-page__h2">
          Accounts and eligibility
        </h2>
        <p>
          You are responsible for your account credentials and for activity under your account. You agree to provide
          accurate information and to comply with applicable laws when using SPIRE.
        </p>
      </section>

      <section aria-labelledby="t4">
        <h2 id="t4" class="legal-page__h2">
          User content
        </h2>
        <p>
          You retain rights to content you submit. You grant SPIRE a license to host, process, and display that
          content as needed to operate the service (for example, showing your profile or application to intended
          recipients).
        </p>
      </section>

      <section aria-labelledby="t5">
        <h2 id="t5" class="legal-page__h2">
          Acceptable use
        </h2>
        <p>
          You agree not to misuse SPIRE—including attempting to disrupt the service, scrape data in violation of
          technical limits, harass users, post unlawful content, or attempt unauthorized access.
        </p>
      </section>

      <section aria-labelledby="t6">
        <h2 id="t6" class="legal-page__h2">
          Disclaimers
        </h2>
        <p>
          SPIRE is provided “as is” to the maximum extent permitted by law. We do not guarantee uninterrupted or
          error-free operation. Hiring outcomes depend on many factors outside SPIRE’s control.
        </p>
      </section>

      <section aria-labelledby="t7">
        <h2 id="t7" class="legal-page__h2">
          Limitation of liability
        </h2>
        <p>
          To the maximum extent permitted by law, SPIRE’s total liability for claims arising from these Terms or the
          service will be limited as permitted by applicable law.
        </p>
      </section>

      <section aria-labelledby="t8">
        <h2 id="t8" class="legal-page__h2">
          Contact
        </h2>
        <p>
          Questions about these terms?
          <router-link class="legal-page__inline-link" to="/contact">Contact us</router-link>.
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
  margin: 0 0 8px;
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.15;
  font-weight: 800;
  color: #1b0f24;
}

.legal-page__muted {
  margin: 0 0 22px;
  font-size: 14px;
  color: rgba(27, 15, 36, 0.62);
}

.legal-page__h2 {
  margin: 26px 0 12px;
  font-size: 18px;
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
