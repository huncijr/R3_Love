import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '../../../ui/card/src';
import { HlmProgressImports } from '../../../ui/progress/src';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmBadge } from '@spartan-ng/helm/badge';
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
} from 'lucide-angular';

export interface QuizQuestion {
  id: string;
  section: number;
  text: string;
  type: 'text' | 'radio' | 'number' | 'select';
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
    type: 'text',
    image: 'Sparkles',
    placeholder: 'e.g. Blonde, long, wavy',
  },

  // === SECTION 1: INTERESTS ===
  {
    id: 'i1',
    section: 1,
    text: 'What are their favorite hobbies?',
    type: 'text',
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
    type: 'text',
    image: 'Palette',
    placeholder: 'e.g. Pastel pink, navy blue',
  },
  {
    id: 'i4',
    section: 1,
    text: 'What kind of music do they love?',
    type: 'text',
    image: 'Heart',
    placeholder: 'e.g. K-pop, jazz, rock',
  },
  {
    id: 'i5',
    section: 1,
    text: 'Any allergies or things they dislike?',
    type: 'text',
    image: 'Sparkles',
    placeholder: 'e.g. Allergic to flowers',
  },

  // === SECTION 2: DEEP DIVE ===
  {
    id: 'd1',
    section: 2,
    text: 'How do they spend weekends?',
    type: 'text',
    image: 'Star',
    placeholder: 'e.g. Reading at a café',
  },
  {
    id: 'd2',
    section: 2,
    text: 'What is their dream vacation?',
    type: 'text',
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
    type: 'text',
    image: 'Sparkles',
    placeholder: 'e.g. A new keyboard',
  },
  {
    id: 'd5',
    section: 2,
    text: "What would make them say 'wow'?",
    type: 'text',
    image: 'Star',
    placeholder: 'e.g. Personalized jewelry',
  },
];

const SECTION_NAMES = ['General Info', 'Interests & Taste', 'Deep Dive'];
const SECTION_ICONS = ['Ruler', 'Heart', 'Sparkles'];

function generateRecommendation(answers: QuizAnswer[]): GiftRecommendation[] {
  return [
    {
      title: 'Personalized Star Map',
      description: 'A custom map of the stars on your anniversary date.',
      priceRange: '$30 - $50',
      reason: 'Romantic and meaningful for partners who love experiences.',
    },
    {
      title: 'Premium Skincare Set',
      description: 'High-quality Korean skincare routine set.',
      priceRange: '$40 - $80',
      reason: 'Based on their interest in self-care and aesthetics.',
    },
    {
      title: 'Concert Tickets',
      description: 'Tickets to see their favorite artist live.',
      priceRange: '$60 - $150',
      reason: 'Perfect for someone who values experiences and music.',
    },
  ];
}

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
        RotateCcw,
        Gift,
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

  questionsInSection = computed(() =>
    ALL_QUESTIONS.filter((q) => q.section === this.currentSection()),
  );

  currentQuestion = computed(() => this.questionsInSection()[this.currentQuestionIndex()]);

  progressPercent = computed(() => {
    const total = ALL_QUESTIONS.length;
    let answered = 0;
    for (let s = 0; s < this.currentSection(); s++) {
      answered += ALL_QUESTIONS.filter((q) => q.section === s).length;
    }
    answered += this.currentQuestionIndex();
    return Math.round((answered / total) * 100);
  });

  sectionProgress = computed(() => {
    const sectionQ = this.questionsInSection();
    return Math.round(((this.currentQuestionIndex() + 1) / sectionQ.length) * 100);
  });

  getAnswerValue(qid: string): string {
    return this.answers().find((a) => a.questionId === qid)?.value || '';
  }

  setAnswer(value: string) {
    const qid = this.currentQuestion().id;
    this.answers.update((list) => {
      const filtered = list.filter((a) => a.questionId !== qid);
      return [...filtered, { questionId: qid, value }];
    });
  }

  sectionName = computed(() => SECTION_NAMES[this.currentSection()]);

  canProceed(): boolean {
    const val = this.getAnswerValue(this.currentQuestion().id);
    return val.trim().length > 0;
  }

  next() {
    if (!this.canProceed()) return;
    const sectionQ = this.questionsInSection();
    if (this.currentQuestionIndex() < sectionQ.length - 1) {
      this.currentQuestionIndex.update((i) => i + 1);
    } else if (this.currentSection() < 2) {
      this.currentSection.update((s) => s + 1);
      this.currentQuestionIndex.set(0);
    } else {
      this.finishQuiz();
    }
  }

  private finishQuiz() {
    this.isCompleted.set(true);
    this.recommendations.set(generateRecommendation(this.answers()));
  }

  restart() {
    this.currentSection.set(0);
    this.currentQuestionIndex.set(0);
    this.answers.set([]);
    this.isCompleted.set(false);
    this.recommendations.set([]);
  }
}
