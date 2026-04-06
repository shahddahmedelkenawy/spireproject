<template>
  <q-page class="iq-question-page">
    <div class="page-inner">
      <div class="top-section">
        <div class="question-meta">
          <span class="question-count">
            Question {{ currentQuestion }} of {{ totalQuestions }}
          </span>
        </div>
        <q-linear-progress
          :value="progressValue"
          color="white"
          track-color="rgba(255, 255, 255, 0.25)"
          rounded
          size="10px"
          class="progress-bar"
        />
      </div>

      <div class="question-section">
        <h2 class="question-text">
          {{ currentQuestionData.text }}
        </h2>

        <div class="options-list">
          <div
            v-for="option in currentQuestionData.options"
            :key="option.value"
            class="option-card"
            :class="{ 'option-card--selected': selectedAnswer === option.value }"
            @click="selectAnswer(option.value)"
          >
            <div class="option-content">
              <q-radio
                v-model="selectedAnswer"
                :val="option.value"
                color="white"
                class="option-radio"
              />
              <div class="option-label">
                <span class="option-letter">{{ option.value }}.</span>
                <span class="option-text">{{ option.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-section">
        <div class="selected-text">
          Answer Selected is:
          <span class="selected-answer">
            {{ selectedAnswer ? selectedAnswer : 'None' }}
          </span>
        </div>

        <div class="question-actions">
          <q-btn
            no-caps
            class="outline-btn back-btn"
            label="Back"
            :disable="currentQuestion === 1"
            @click="goBack"
          />
          <q-btn
            no-caps
            class="outline-btn next-btn"
            :label="isLastQuestion ? 'Finish' : 'Next'"
            @click="goNext"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/userStore'
import { useAuthStore } from 'src/stores/authStore'
import { saveIqTestResult } from 'src/services/iqTestService'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()

const totalQuestions = 8

const primaryQuestions = [
  {
    id: 1,
    text: 'What is the next number in the sequence: 2, 4, 6, 8?',
    options: [
      { value: 'A', label: '9' },
      { value: 'B', label: '10' },
      { value: 'C', label: '12' },
      { value: 'D', label: '14' },
    ],
    correct: 'B',
  },
  {
    id: 2,
    text: 'Which shape has the fewest sides?',
    options: [
      { value: 'A', label: 'Triangle' },
      { value: 'B', label: 'Square' },
      { value: 'C', label: 'Pentagon' },
      { value: 'D', label: 'Hexagon' },
    ],
    correct: 'A',
  },
  {
    id: 3,
    text: 'If all roses are flowers, and some flowers fade quickly, then:',
    options: [
      { value: 'A', label: 'All roses fade quickly' },
      { value: 'B', label: 'Some roses may fade quickly' },
      { value: 'C', label: 'No roses fade quickly' },
      { value: 'D', label: 'Roses are not flowers' },
    ],
    correct: 'B',
  },
  {
    id: 4,
    text: 'What is 15 + 27?',
    options: [
      { value: 'A', label: '32' },
      { value: 'B', label: '40' },
      { value: 'C', label: '42' },
      { value: 'D', label: '44' },
    ],
    correct: 'C',
  },
  {
    id: 5,
    text: 'Which number is the smallest?',
    options: [
      { value: 'A', label: '0.5' },
      { value: 'B', label: '0.05' },
      { value: 'C', label: '0.15' },
      { value: 'D', label: '0.25' },
    ],
    correct: 'B',
  },
  {
    id: 6,
    text: 'If today is Monday, what day will it be after 3 days?',
    options: [
      { value: 'A', label: 'Thursday' },
      { value: 'B', label: 'Wednesday' },
      { value: 'C', label: 'Friday' },
      { value: 'D', label: 'Sunday' },
    ],
    correct: 'B',
  },
  {
    id: 7,
    text: 'Find the odd one out: cat, dog, bird, car',
    options: [
      { value: 'A', label: 'Cat' },
      { value: 'B', label: 'Dog' },
      { value: 'C', label: 'Bird' },
      { value: 'D', label: 'Car' },
    ],
    correct: 'D',
  },
  {
    id: 8,
    text: 'Which number completes the pattern: 3, 6, 12, 24, ?',
    options: [
      { value: 'A', label: '30' },
      { value: 'B', label: '36' },
      { value: 'C', label: '40' },
      { value: 'D', label: '48' },
    ],
    correct: 'D',
  },
]

const retakeQuestions = [
  {
    id: 1,
    text: 'What is the next number in the sequence: 1, 3, 5, 7?',
    options: [
      { value: 'A', label: '8' },
      { value: 'B', label: '9' },
      { value: 'C', label: '10' },
      { value: 'D', label: '11' },
    ],
    correct: 'B',
  },
  {
    id: 2,
    text: 'Which shape has the most sides?',
    options: [
      { value: 'A', label: 'Triangle' },
      { value: 'B', label: 'Square' },
      { value: 'C', label: 'Pentagon' },
      { value: 'D', label: 'Hexagon' },
    ],
    correct: 'D',
  },
  {
    id: 3,
    text: 'If all birds can fly, and a sparrow is a bird, then:',
    options: [
      { value: 'A', label: 'Sparrows cannot fly' },
      { value: 'B', label: 'Some sparrows cannot fly' },
      { value: 'C', label: 'Sparrows can fly' },
      { value: 'D', label: 'Birds are not animals' },
    ],
    correct: 'C',
  },
  {
    id: 4,
    text: 'What is 9 × 6?',
    options: [
      { value: 'A', label: '42' },
      { value: 'B', label: '48' },
      { value: 'C', label: '52' },
      { value: 'D', label: '54' },
    ],
    correct: 'D',
  },
  {
    id: 5,
    text: 'Which number is the largest?',
    options: [
      { value: 'A', label: '0.8' },
      { value: 'B', label: '0.18' },
      { value: 'C', label: '0.75' },
      { value: 'D', label: '0.65' },
    ],
    correct: 'A',
  },
  {
    id: 6,
    text: 'If today is Friday, what day was it 2 days ago?',
    options: [
      { value: 'A', label: 'Wednesday' },
      { value: 'B', label: 'Monday' },
      { value: 'C', label: 'Tuesday' },
      { value: 'D', label: 'Sunday' },
    ],
    correct: 'A',
  },
  {
    id: 7,
    text: 'Find the odd one out: red, blue, circle, green',
    options: [
      { value: 'A', label: 'Red' },
      { value: 'B', label: 'Blue' },
      { value: 'C', label: 'Circle' },
      { value: 'D', label: 'Green' },
    ],
    correct: 'C',
  },
  {
    id: 8,
    text: 'Which number completes the pattern: 5, 10, 20, 40, ?',
    options: [
      { value: 'A', label: '45' },
      { value: 'B', label: '60' },
      { value: 'C', label: '80' },
      { value: 'D', label: '70' },
    ],
    correct: 'C',
  },
]

const isRetake = computed(() => route.query.variant === '2')

const questions = computed(() => (isRetake.value ? retakeQuestions : primaryQuestions))

const answers = ref({})
const selectedAnswer = ref('')

const currentQuestion = computed(() => {
  const id = parseInt(route.params.id, 10)
  if (Number.isNaN(id) || id < 1 || id > totalQuestions) {
    return 1
  }
  return id
})

const currentQuestionData = computed(() => {
  return questions.value.find(q => q.id === currentQuestion.value) || questions.value[0]
})

const progressValue = computed(() => currentQuestion.value / totalQuestions)

const isLastQuestion = computed(() => currentQuestion.value === totalQuestions)

watch(
  () => currentQuestion.value,
  (newVal) => {
    selectedAnswer.value = answers.value[newVal] || ''
  },
  { immediate: true }
)

function selectAnswer(val) {
  selectedAnswer.value = val
}

function saveCurrentAnswer() {
  if (selectedAnswer.value) {
    answers.value = {
      ...answers.value,
      [currentQuestion.value]: selectedAnswer.value,
    }
  }
}

async function goNext() {
  saveCurrentAnswer()

  if (isLastQuestion.value) {
    const currentQuestions = questions.value
    let score = 0
    currentQuestions.forEach((q) => {
      const ans = answers.value[q.id]
      if (ans && ans === q.correct) {
        score += 1
      }
    })

    const percentage = Math.round((score / totalQuestions) * 100)
    const passed = percentage >= 60

    userStore.setIqResult({
      score,
      total: totalQuestions,
      percentage,
      passed,
      answers: answers.value,
    })

    if (authStore.user?.uid) {
      await saveIqTestResult({
        userId: authStore.user.uid,
        result: percentage,
      })
    }

    router.push('/job-seeker/iq-result')
    return
  }

  const nextId = currentQuestion.value + 1
  router.push({
    path: `/job-seeker/iq-test/${nextId}`,
    query: { ...route.query },
  })
}

function goBack() {
  if (currentQuestion.value <= 1) {
    router.back()
    return
  }

  saveCurrentAnswer()
  const prevId = currentQuestion.value - 1
  router.push({
    path: `/job-seeker/iq-test/${prevId}`,
    query: { ...route.query },
  })
}
</script>

<style scoped>
.iq-question-page {
  min-height: 100vh !important;
  min-height: 100dvh !important;
  background-color: #4B1E5A;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: stretch;
}

.page-inner {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 16px 24px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 0;
  flex: 1;
}

.top-section {
  margin-bottom: 16px;
}

.question-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.question-count {
  font-size: 14px;
  font-weight: 600;
}

.progress-bar {
  margin-top: 4px;
}

.question-section {
  flex: 1;
  margin-top: 16px;
}

.question-text {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
  line-height: 1.5;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-card {
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: transparent;
}

.option-card--selected {
  background-color: rgba(255, 255, 255, 0.16);
  border-color: #ffffff;
}

.option-content {
  display: flex;
  align-items: center;
}

.option-radio :deep(.q-radio__inner--truthy .q-radio__icon) {
  color: #ffffff;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.option-letter {
  font-weight: 700;
}

.option-text {
  flex: 1;
}

.bottom-section {
  margin-top: 20px;
}

.selected-text {
  font-size: 13px;
  margin-bottom: 12px;
}

.selected-answer {
  font-weight: 700;
  margin-left: 4px;
}

.outline-btn {
  border-radius: 25px;
  background-color: #ffffff;
  color: #4B1E5A;
  border: 2px solid #ffffff;
  font-weight: 600;
  height: 46px;
  width: 100%;
  transition: all 0.2s ease;
}

.question-actions {
  display: flex;
  gap: 10px;
}

.back-btn,
.next-btn {
  flex: 1;
}

.outline-btn:hover,
.outline-btn:focus {
  background-color: #4B1E5A;
  color: #ffffff;
  border-color: #ffffff;
}
</style>

