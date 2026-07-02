import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '../../../ui/card/src';
import { HlmProgressImports } from '../../../ui/progress/src';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmSelectImports } from '../../../ui/select/src';

import {
  LucideAngularModule,
  LUCIDE_ICONS,
  LucideIconProvider,
  Ruler,
  Palette,
  Cake,
  Heart,
  Sparkles,
  Star,
  ArrowRight,
  ArrowLeft,
  Gift,
  RotateCcw,
  AlertCircle,
} from 'lucide-angular';
import { UserService } from '../../../services/user.service';
export interface QuizQuestion {
  id: string;
  section: number;
  text: string;
  type: 'text' | 'radio' | 'number' | 'select' | 'text_with_options';
  options?: string[];
  image?: string;
  placeholder?: string;
}

export interface QuizAnswer {
  questionId: string;
  value: string;
}

export interface GiftRecommendation {
  title: string;
  description: string;
  priceRange: string;
  reason: string;
}

const ALL_QUESTIONS: QuizQuestion[] = [
  // === SECTION 0: GENERAL ===
  {
    id: 'g1',
    section: 0,
    text: "What is your partner's approximate height?",
    type: 'select',
    options: ['Under 160cm', '160-170cm', '170-180cm', 'Over 180cm'],
    image: 'Ruler',
    placeholder: 'Select height range',
  },
  {
    id: 'g2',
    section: 0,
    text: 'How would you describe their general style?',
    type: 'radio',
    options: ['Casual / Sporty', 'Elegant / Classic', 'Alternative / Edgy', 'Minimalist / Clean'],
    image: 'Palette',
  },
  {
    id: 'g3',
    section: 0,
    text: 'How old is your partner?',
    type: 'number',
    image: 'Cake',
    placeholder: 'Enter age',
  },
  {
    id: 'g4',
    section: 0,
    text: 'What is their body type?',
    type: 'radio',
    options: ['Slim', 'Average', 'Athletic', 'Curvy'],
    image: 'Heart',
  },
  {
    id: 'g5',
    section: 0,
    text: 'What is their hair color / style?',
    type: 'text_with_options',
    options: ['Blonde', 'Brunette', 'Red', 'Black'],
    image: 'Sparkles',
    placeholder: 'e.g. Blonde, long, wavy',
  },

  // === SECTION 1: INTERESTS ===
  {
    id: 'i1',
    section: 1,
    text: 'What are their favorite hobbies?',
    type: 'text_with_options',
    options: ['Gaming', 'Reading', 'Sports', 'Music'],
    image: 'Star',
    placeholder: 'e.g. Painting, hiking, gaming',
  },
  {
    id: 'i2',
    section: 1,
    text: 'Do they prefer experiences or physical gifts?',
    type: 'radio',
    options: ['Experiences', 'Physical gifts', 'Both equally'],
    image: 'Gift',
  },
  {
    id: 'i3',
    section: 1,
    text: 'What is their favorite color?',
    type: 'text_with_options',
    options: ['Blue', 'Pink', 'Green', 'Black'],
    image: 'Palette',
    placeholder: 'e.g. Pastel pink, navy blue',
  },
  {
    id: 'i4',
    section: 1,
    text: 'What kind of music do they love?',
    type: 'text_with_options',
    options: ['Pop', 'Rock', 'Classical', 'Hip-hop'],
    image: 'Heart',
    placeholder: 'e.g. K-pop, jazz, rock',
  },
  {
    id: 'i5',
    section: 1,
    text: 'Any allergies or things they dislike?',
    type: 'text_with_options',
    options: ['Flowers', 'Chocolate', 'Strong scents', 'Nothing specific'],
    image: 'Sparkles',
    placeholder: 'e.g. Allergic to flowers',
  },

  // === SECTION 2: DEEP DIVE ===
  {
    id: 'd1',
    section: 2,
    text: 'How do they spend weekends?',
    type: 'text_with_options',
    options: ['Outdoors', 'Home relaxing', 'Social events', 'Creative projects'],
    image: 'Star',
    placeholder: 'e.g. Reading at a café',
  },
  {
    id: 'd2',
    section: 2,
    text: 'What is their dream vacation?',
    type: 'text_with_options',
    options: ['Beach resort', 'Mountain hiking', 'City exploration', 'Cultural tour'],
    image: 'Heart',
    placeholder: 'e.g. Japan, Maldives',
  },
  {
    id: 'd3',
    section: 2,
    text: 'What is their love language?',
    type: 'radio',
    options: [
      'Words of affirmation',
      'Quality time',
      'Receiving gifts',
      'Acts of service',
      'Physical touch',
    ],
    image: 'Gift',
  },
  {
    id: 'd4',
    section: 2,
    text: 'What did they buy last for themselves?',
    type: 'text_with_options',
    options: ['Clothes', 'Tech gadget', 'Book', 'Skincare'],
    image: 'Sparkles',
    placeholder: 'e.g. A new keyboard',
  },
  {
    id: 'd5',
    section: 2,
    text: "What would make them say 'wow'?",
    type: 'text_with_options',
    options: ['Personalized gift', 'Experience', 'Handmade item', 'Surprise trip'],
    image: 'Star',
    placeholder: 'e.g. Personalized jewelry',
  },
];

const SECTION_NAMES = ['General Info', 'Interests & Taste', 'Deep Dive'];
const SECTION_ICONS = ['Ruler', 'Heart', 'Sparkles'];

@Component({
  selector: 'app-gift',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmButton,
    HlmCardImports,
    HlmProgressImports,
    HlmInput,
    HlmLabel,
    LucideAngularModule,
    HlmBadge,
    HlmSelectImports,
  ],
  templateUrl: './gift.html',
  styleUrl: './gift.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({
        Ruler,
        Palette,
        Cake,
        Heart,
        Sparkles,
        Star,
        ArrowLeft,
        ArrowRight,
        RotateCcw,
        Gift,
        AlertCircle,
      }),
      multi: true,
    },
  ],
})
export class GiftFinder {
  currentSection = signal(0);
  currentQuestionIndex = signal(0);
  answers = signal<QuizAnswer[]>([]);
  isCompleted = signal(false);
  recommendations = signal<GiftRecommendation[]>([]);
  showCustomInput = signal(false);
  customValue = signal('');
  animationKey = signal(0);

  aiQuestions = signal<QuizQuestion[]>([]);
  isAiPhase = signal(false);
  isFinalPhase = signal(false);

  isLoadingRecommendations = signal(false);
  loadingProgress = signal(0);

  errorMessage = signal('');
  loadingMessage = signal('');

  deepQuestions = signal<QuizQuestion[]>([]);
  practicalQuestions = signal<QuizQuestion[]>([]);
  isDeepPhase = signal(false);
  isPracticalPhase = signal(false);

  LOADING_MESSAGES = [
    'Analyzing your answers...',
    'Creating gift recommendations ...',
    'Determining what they would love...',
    'Personalizing results just for you ...',
  ];

  constructor(private userService: UserService) {}

  allCurrentQuestions = computed<QuizQuestion[]>(() => {
    if (this.isDeepPhase()) return this.deepQuestions();
    if (this.isPracticalPhase()) return this.practicalQuestions();
    return ALL_QUESTIONS.filter((q) => q.section === this.currentSection());
  });

  currentQuestion = computed(() => this.allCurrentQuestions()[this.currentQuestionIndex()]);

  // Calculates overall quiz completion percentage across all sections
  progressPercent = computed(() => {
    const totalStatic = 9;
    const totalDeep = 5;
    const totalPractical = 5;
    const total = totalStatic + totalDeep + totalPractical;

    if (this.isDeepPhase()) {
      return Math.round(((totalStatic + this.currentQuestionIndex() + 1) / total) * 100);
    }
    if (this.isPracticalPhase()) {
      return Math.round(
        ((totalStatic + totalDeep + this.currentQuestionIndex() + 1) / total) * 100,
      );
    }
    if (this.isCompleted()) return 100;

    const completedBefore = this.currentSection() * 3;
    return Math.round(((completedBefore + this.currentQuestionIndex() + 1) / total) * 100);
  });

  // Calculates completion percentage within the current section only
  sectionProgress = computed(() => {
    const sectionQ = this.allCurrentQuestions();
    return Math.round(((this.currentQuestionIndex() + 1) / sectionQ.length) * 100);
  });

  getAnswerValue(qid: string): string {
    return this.answers().find((a) => a.questionId === qid)?.value || '';
  }

  // Stores or updates an answer for the current question
  setAnswer(value: string) {
    const qid = this.currentQuestion().id;
    this.answers.update((list) => {
      const filtered = list.filter((a) => a.questionId !== qid);
      return [...filtered, { questionId: qid, value }];
    });
  }

  // Returns the display name of the current section
  sectionName = computed(() => {
    if (this.isDeepPhase()) return 'Deep Dive';
    if (this.isPracticalPhase()) return 'Practical Details';
    if (this.isFinalPhase()) return 'Result';
    return SECTION_NAMES[this.currentSection()];
  });

  // Checks if the current question has a valid answer before allowing progression
  canProceed(): boolean {
    const val = this.getAnswerValue(this.currentQuestion().id);
    return val.trim().length > 0;
  }

  // Advances to the next question, section, or triggers completion
  next() {
    if (!this.canProceed()) return;
    const sectionQ = this.allCurrentQuestions();
    this.showCustomInput.set(false);
    this.customValue.set('');

    if (this.currentQuestionIndex() < sectionQ.length - 1) {
      this.currentQuestionIndex.update((i) => i + 1);
    } else if (this.isDeepPhase()) {
      this.finishDeepPhase();
    } else if (this.isPracticalPhase()) {
      this.finishPracticalPhase();
    } else if (this.currentSection() < 2) {
      this.currentSection.update((s) => s + 1);
      this.currentQuestionIndex.set(0);
    } else {
      this.finishStaticPhase();
    }
    this.animationKey.update((k) => k + 1);
  }

  private finishStaticPhase() {
    this.isLoadingRecommendations.set(true);
    this.loadingProgress.set(0);
    this.loadingMessage.set('Analyzing your answers ...');

    const answerWithText = this.answers().map((answer) => {
      const question = ALL_QUESTIONS.find((q) => q.id === answer.questionId);
      return {
        questionId: answer.questionId,
        questionText: question?.text || answer.questionId,
        value: answer.value,
      };
    });

    this.userService.generateDeepQuestions(answerWithText).subscribe({
      next: (questions) => {
        this.isLoadingRecommendations.set(false);
        this.aiQuestions.set(questions);
        this.isAiPhase.set(true);
        this.currentQuestionIndex.set(0);
        this.currentSection.set(0);
      },
      error: (err) => {
        console.error('Deep questions failed', err);
        this.isLoadingRecommendations.set(false);
        this.errorMessage.set('Failed to generate follow-up questions. Please try again later.');
      },
    });
  }

  private finishDeepPhase() {
    this.isLoadingRecommendations.set(true);
    this.loadingMessage.set('Preparing practical questions ...');

    const allAnswers = this.answers().map((a) => {
      const q = ALL_QUESTIONS.find((q) => (q.id = a.questionId));
      return { questionId: a.questionId, questionText: q?.text || a.questionId, value: a.value };
    });

    this.userService.generatePracticalQuestions(allAnswers).subscribe({
      next: (questions) => {
        this.isLoadingRecommendations.set(false);
        this.practicalQuestions.set(questions);
        this.isPracticalPhase.set(true);
        this.isDeepPhase.set(false);
        this.currentQuestionIndex.set(0);
      },
      error: (err) => {
        console.error('Practical questions failed', err);
        this.errorMessage.set('Failed to generate practical questions. Please try again.');
        this.isLoadingRecommendations.set(false);
      },
    });
  }
  private finishPracticalPhase() {
    this.isLoadingRecommendations.set(true);
    this.loadingMessage.set('Generating gift recommendations...');
    const allQuestions = [
      ...ALL_QUESTIONS.flat(),
      ...this.deepQuestions(),
      ...this.practicalQuestions(),
    ];

    const allAnswers = this.answers().map((a) => {
      const q = allQuestions.find((q) => q.id === a.questionId);
      return { questionId: a.questionId, questionText: q?.text || a.questionId, value: a.value };
    });

    this.userService.getGiftRecommendations(allAnswers).subscribe({
      next: (recs) => {
        this.isLoadingRecommendations.set(false);
        this.recommendations.set(recs);
        this.isCompleted.set(true);
      },
      error: (err) => {
        console.error('Recommendation failed', err);
        this.errorMessage.set('Failed to get recommendations. Please try again.');
        this.isLoadingRecommendations.set(false);
      },
    });
  }
  // Triggers the AI recommendation loading simulation with progress bar and cycling messages
  private finishAiPhase() {
    this.isLoadingRecommendations.set(true);
    this.loadingProgress.set(0);

    let msgIdx = 0;
    this.loadingMessage.set(this.LOADING_MESSAGES[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % this.LOADING_MESSAGES.length;
      this.loadingMessage.set(this.LOADING_MESSAGES[msgIdx]);
    }, 800);

    const progressInterval = setInterval(() => {
      this.loadingProgress.update((p) => Math.min(p + 2, 95));
    }, 80);

    this.userService.getGiftRecommendations(this.answers()).subscribe({
      next: (recommendations) => {
        clearInterval(msgInterval);
        clearInterval(progressInterval);
        this.loadingProgress.set(100);
        this.isLoadingRecommendations.set(false);
        this.isCompleted.set(true);
        this.recommendations.set(recommendations);
      },
      error: (err) => {
        clearInterval(msgInterval);
        clearInterval(progressInterval);
        this.isLoadingRecommendations.set(false);
        console.error(`AI recommendation failed`, err);
        this.errorMessage.set('Failed to get gift recommendations. Please try again later.');
      },
    });
  }

  onAnswerSelected(value: string) {
    this.setAnswer(value);
    setTimeout(() => {
      this.next();
    }, 200);
  }

  onEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.canProceed()) {
      this.next();
    }
  }

  // Allows pressing Enter to submit a custom text input
  onCustomEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.customValue().trim()) {
      this.submitCustom();
    }
  }

  // Saves the custom text input as the answer and hides the input field
  submitCustom() {
    if (this.customValue().trim()) {
      this.onAnswerSelected(this.customValue().trim());
      this.showCustomInput.set(false);
      this.customValue.set('');
    }
  }

  // Resets all quiz state to allow retaking the gift finder
  restart() {
    this.currentSection.set(0);
    this.currentQuestionIndex.set(0);
    this.answers.set([]);
    this.isCompleted.set(false);
    this.recommendations.set([]);
    this.isDeepPhase.set(false);
    this.isPracticalPhase.set(false);
    this.deepQuestions.set([]);
    this.practicalQuestions.set([]);
    this.aiQuestions.set([]);
    this.isFinalPhase.set(false);
    this.errorMessage.set(``);
    this.showCustomInput.set(false);
    this.customValue.set('');
    this.animationKey.update((k) => k + 1);
  }
}
