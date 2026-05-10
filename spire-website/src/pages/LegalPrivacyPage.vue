<template>
  <q-page class="legal-page">
    <article class="legal-page__article prose-wrap">
      <p class="legal-page__eyebrow">
        Legal
      </p>
      <h1 class="legal-page__title">
        Privacy Policy
      </h1>
      <p class="legal-page__muted">
        Last updated: May 10, 2026
      </p>

      <section aria-labelledby="p1">
        <h2 id="p1" class="legal-page__h2">
          Overview
        </h2>
        <p>
          SPIRE (“we”, “us”) provides account-based tools for job seekers and employers. This policy explains
          what information we process, why we process it, and the choices available to you when you use the SPIRE
          website and related services.
        </p>
      </section>

      <section aria-labelledby="p2">
        <h2 id="p2" class="legal-page__h2">
          Information we process
        </h2>
        <p>
          Depending on how you use SPIRE, we may process account details (such as email address), profile and
          application content you submit, communications sent through the platform, and technical information
          commonly collected by web applications (such as device/browser information and basic usage signals) to
          operate and secure the service.
        </p>
      </section>

      <section aria-labelledby="p3">
        <h2 id="p3" class="legal-page__h2">
          How we use information
        </h2>
        <p>
          We use information to provide features (authentication, messaging, applications, job postings),
          improve reliability and security, communicate important service updates, and comply with applicable law.
        </p>
      </section>

      <section aria-labelledby="p4">
        <h2 id="p4" class="legal-page__h2">
          Sharing
        </h2>
        <p>
          We do not sell your personal information. We may share information with service providers who assist in
          hosting and operating the platform (for example, cloud infrastructure), when required by law, or when you
          direct us to share information as part of normal product functionality (for example, submitting an
          application to an employer).
        </p>
      </section>

      <section aria-labelledby="p5">
        <h2 id="p5" class="legal-page__h2">
          Retention and security
        </h2>
        <p>
          We retain information as needed to provide the service and meet legal obligations. We implement reasonable
          safeguards designed to protect information—but no method of transmission or storage is perfectly secure.
        </p>
      </section>

      <section aria-labelledby="p6">
        <h2 id="p6" class="legal-page__h2">
          Your choices
        </h2>
        <p>
          You may update certain profile information within the product where supported. You may also contact us for
          privacy-related requests; we will respond consistent with applicable law.
        </p>
      </section>

      <section aria-labelledby="p7">
        <h2 id="p7" class="legal-page__h2">
          Contact
        </h2>
        <p>
          Questions about privacy?
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
