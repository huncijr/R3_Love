import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '../../../ui/card/src';
import { HlmProgressImports } from '../../../ui/progress/src';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmSelectImports } from '../../../ui/select/src';
import { getNames } from 'country-list';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../enviroments/enviroment.prod';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/Auth/auth';
import { UserContext } from '../../../services/UserContext/user-context';
import { Router, RouterLink } from '@angular/router';

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
  Book,
  Pin,
  SquareArrowOutUpRight,
  X,
  Trash2,
  Undo2,
  CornerDownLeft,
  ClockAlert,
} from 'lucide-angular';
import { CdkAriaLive } from '../../../../../node_modules/@angular/cdk/types/_a11y-module-chunk';
import { ToastrService } from 'ngx-toastr';

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

interface storeLocation {
  name: string;
  address: string;
}
export interface GiftRecommendation {
  title: string;
  description: string;
  priceRange: string;
  reason: string;
  onlineLinks?: string[];
  stores?: storeLocation[];
}

interface GiftRecommendationSet {
  id: string;
  answers: any;
  recommendations: GiftRecommendation[];
  createdAt: string;
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
    RouterLink,
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
        Book,
        SquareArrowOutUpRight,
        Pin,
        X,
        Trash2,
        Undo2,
        CornerDownLeft,
        ClockAlert,
      }),
      multi: true,
    },
  ],
})
export class GiftFinder implements OnInit {
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
  validationError = signal('');
  loadingMessage = signal('');

  deepQuestions = signal<QuizQuestion[]>([]);
  practicalQuestions = signal<QuizQuestion[]>([]);
  isDeepPhase = signal(false);
  isPracticalPhase = signal(false);

  isLocationPhase = signal(false);
  selectedCountry = signal<string>('');

  countries = [
    { code: 'PREFER_NOT_TO_SAY', name: 'Prefer not to say' },
    ...Object.entries(getNames()).map(([code, name]) => ({ code, name })),
  ];
  selectedCity = signal<string>('');
  cityOptions = signal<string[]>([]);
  isLoadingCities = signal(false);
  cityError = signal<string | null>(null);
  showCityDropdown = signal(false);
  cityQuery = signal<string>('');
  filteredCities = computed(() => {
    const query = this.cityQuery().toLowerCase();
    if (!query) return this.cityOptions().slice(0, 10);
    return this.cityOptions()
      .filter((city) => city.toLowerCase().includes(query))
      .slice(0, 10);
  });

  currentRecIndex = signal(0);
  cardAnimationKey = signal(0);
  isAnimating = signal(false);

  showGuestBlur = signal(false);
  isSaving = false;
  finalAnswers = signal<any[]>([]);
  rateLimitReached = signal(false);

  currentRecommendation = computed(() => this.recommendations()[this.currentRecIndex()]);

  recommendationHistory = signal<GiftRecommendationSet[]>([]);
  showHistory = signal(false);
  isHistoryLoading = signal(false);
  selectedHistorySet = signal<GiftRecommendationSet | null>(null);

  selectedRecIndex = signal(0);

  selectedRecommendation = computed(() => {
    const set = this.selectedHistorySet();
    if (!set) return null;
    return set.recommendations[this.selectedRecIndex()] || null;
  });

  selectedHasLocationData = computed(() => {
    const rec = this.selectedRecommendation();
    return !!rec?.stores && rec.stores.length > 0;
  });

  selectedHasOnlineLinks = computed(() => {
    const rec = this.selectedRecommendation();
    return !!rec?.onlineLinks && rec.onlineLinks.length > 0;
  });

  hasAnyRecommendations = computed(
    () => this.recommendations().length > 0 || this.recommendationHistory().length > 0,
  );

  hasLocationData = computed(() => {
    const rec = this.currentRecommendation();
    console.log(rec);
    return !!rec?.stores && rec.stores.length > 0;
  });

  hasOnlineLinks = computed(() => {
    const rec = this.currentRecommendation();
    console.log(rec);
    return !!rec?.onlineLinks && rec.onlineLinks.length > 0;
  });

  showQuestionCard = computed(
    () => !this.isLocationPhase() && !this.isLoadingRecommendations() && !this.isCompleted(),
  );

  private msgInterval?: ReturnType<typeof setInterval>;
  private progressInterval?: ReturnType<typeof setInterval>;

  stepLabel = computed(() => {
    if (this.isDeepPhase()) return 'Extra Step +1';
    if (this.isPracticalPhase()) return 'Extra Step +2';
    if (this.isFinalPhase() || this.isCompleted()) return 'Extra Step +3';
    return `Step ${this.currentSection() + 1} of 3`;
  });

  LOADING_MESSAGES_QUESTIONS = [
    { threshold: 0, text: 'Analyzing your answers...' },
    { threshold: 20, text: 'Crafting personalized questions...' },
    { threshold: 40, text: 'Digging deeper into what they love...' },
    { threshold: 60, text: 'Almost ready with the next questions...' },
    { threshold: 80, text: 'Finalizing the questions...' },
  ];

  LOADING_MESSAGES_GIFTS = [
    { threshold: 0, text: 'Analyzing your answers...' },
    { threshold: 20, text: 'Creating gift recommendations...' },
    { threshold: 40, text: 'Determining what they would love...' },
    { threshold: 60, text: 'Almost there...' },
    { threshold: 80, text: 'Personalizing results just for you...' },
  ];

  constructor(
    private userService: UserService,
    private userContext: UserContext,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private router: Router,
  ) {}
  ngOnInit() {
    const pendingAnswers = localStorage.getItem('gift_pending_answers');
    const pendingRecommendations = localStorage.getItem('gift_pending_recommendations');
    const showHistory = localStorage.getItem('gift_show_history') === 'true';
    if (showHistory) {
      this.showHistory.set(true);
    }

    if (this.authService.isLoggedIn()) {
      if (pendingAnswers && pendingRecommendations) {
        const cleanAnswers = this.stripTypenames(JSON.parse(pendingAnswers));
        const cleanRecommendations = this.stripTypenames(JSON.parse(pendingRecommendations));
        this.userService
          .saveGiftRecommendations({
            answers: cleanAnswers,
            recommendations: cleanRecommendations,
          })
          .subscribe({
            next: () => {
              localStorage.removeItem('gift_pending_answers');
              localStorage.removeItem('gift_pending_recommendations');
              this.loadHistory();
            },
            error: (err) => {
              console.error('Pending save failed', err);
            },
          });
      } else {
        this.loadHistory();
      }
    } else if (pendingAnswers && pendingRecommendations) {
      this.finalAnswers.set(JSON.parse(pendingAnswers));
      this.answers.set(JSON.parse(pendingAnswers));
      this.recommendations.set(JSON.parse(pendingRecommendations));
      this.isCompleted.set(true);
      this.showGuestBlur.set(true);
      document.body.classList.add('overflow-hidden');
    }
  }

  allCurrentQuestions = computed<QuizQuestion[]>(() => {
    if (this.isDeepPhase()) return this.deepQuestions();
    if (this.isPracticalPhase()) return this.practicalQuestions();
    return ALL_QUESTIONS.filter((q) => q.section === this.currentSection());
  });

  goToAccount() {
    this.router.navigate(['/account']);
    document.body.classList.remove('overflow-hidden');
  }

  // Recursively removes Apollo __typename fields from objects/arrays
  private stripTypenames<T>(obj: T): T {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.stripTypenames(item)) as unknown as T;
    }
    if (obj !== null && typeof obj === 'object') {
      const cleaned: any = {};
      for (const key of Object.keys(obj)) {
        if (key === '__typename') continue;
        cleaned[key] = this.stripTypenames((obj as any)[key]);
      }
      return cleaned as T;
    }
    return obj;
  }

  private validateAnswer(value: string): string | null {
    const q = this.currentQuestion();
    const trimmed = value.trim();

    if (q.id === 'g3') {
      const age = Number(trimmed);
      if (Number.isNaN(age) || age < 12 || age > 99) {
        return 'Please enter an age between 12 and 99';
      }
    }
    if (
      q.type === 'text' ||
      q.type === 'text_with_options' ||
      (q.type === 'number' && q.id !== 'g3')
    ) {
      if (trimmed.length > 100) {
        return 'Please keep your answer under 100 characters';
      }
    }
    return null;
  }

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
    const error = this.validateAnswer(value);
    this.validationError.set(error || '');
    if (error) return;

    const qid = this.currentQuestion().id;
    this.answers.update((list) => {
      const filtered = list.filter((a) => a.questionId !== qid);
      return [...filtered, { questionId: qid, value }];
    });
  }

  private toastr = inject(ToastrService);

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
    return val.trim().length > 0 && this.validationError() === '';
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
    this.startLoading('Analyzing your answers...', this.LOADING_MESSAGES_QUESTIONS);

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
        this.stopLoading();
        this.deepQuestions.set(questions);
        this.isDeepPhase.set(true);
        this.currentQuestionIndex.set(0);
      },
      error: (err) => {
        this.stopLoading();
        console.error('Deep questions failed', err);
        this.errorMessage.set('Failed to generate deep questions. Please try again later.');
      },
    });
  }

  private finishDeepPhase() {
    this.startLoading('Preparing practical questions...', this.LOADING_MESSAGES_QUESTIONS);

    const allQuestions = [...ALL_QUESTIONS, ...this.deepQuestions()];
    const allAnswers = this.answers().map((a) => {
      const q = allQuestions.find((q) => q.id === a.questionId);
      return { questionId: a.questionId, questionText: q?.text || a.questionId, value: a.value };
    });

    this.userService.generatePracticalQuestions(allAnswers).subscribe({
      next: (questions) => {
        this.stopLoading();
        this.practicalQuestions.set(questions);
        this.isPracticalPhase.set(true);
        this.isDeepPhase.set(false);
        this.currentQuestionIndex.set(0);
      },
      error: (err) => {
        this.stopLoading();
        console.error('Practical questions failed', err);
        this.errorMessage.set('Failed to generate practical questions. Please try again.');
      },
    });
  }

  finishLocationPhase() {
    this.isLocationPhase.set(false);
    this.startLoading('Generating gift recommendations...', this.LOADING_MESSAGES_GIFTS);

    const allQuestions = [...ALL_QUESTIONS, ...this.deepQuestions(), ...this.practicalQuestions()];
    const allAnswers = this.answers().map((a) => {
      const q = allQuestions.find((q) => q.id === a.questionId);
      return { questionId: a.questionId, questionText: q?.text || a.questionId, value: a.value };
    });

    if (this.selectedCountry() && this.selectedCountry() !== 'PREFER_NOT_TO_SAY') {
      const selectedCountryName =
        this.countries.find((c) => c.code === this.selectedCountry())?.name ||
        this.selectedCountry();
      const cityPart = this.selectedCity() ? `${this.selectedCity()}, ` : '';
      allAnswers.push({
        questionId: 'location',
        questionText: 'Where are you from',
        value: `${cityPart}${selectedCountryName}`,
      });
      if (this.userContext.isLoggedIn()) {
        console.log(selectedCountryName);
        this.userService.updateUserCountry(selectedCountryName).subscribe({
          next: (updatedUser: any) => {
            this.userContext.login(updatedUser, this.authService.getToken()!);
          },
          error: (err: any) => console.error('Failed to save country', err),
        });
      }
    } else if (this.selectedCountry() === 'PREFER_NOT_TO_SAY') {
      allAnswers.push({
        questionId: 'location',
        questionText: 'Where are you from',
        value: 'Prefer not to say',
      });
    }

    this.finalAnswers.set(allAnswers);

    this.userService.getGiftRecommendations(allAnswers).subscribe({
      next: (recs) => {
        this.stopLoading();
        console.log(recs);
        this.currentRecIndex.set(0);
        this.recommendations.set(recs);
        this.isCompleted.set(true);

        if (this.authService.isLoggedIn()) {
          const cleanAnswers = this.stripTypenames(allAnswers);
          const cleanRecommendations = this.stripTypenames(recs);
          this.userService
            .saveGiftRecommendations({
              answers: cleanAnswers,
              recommendations: cleanRecommendations,
            })
            .subscribe({
              next: () => {
                this.showGuestBlur.set(false);
                this.loadHistory();
              },
              error: (saveErr) => {
                console.error('Save failed', saveErr);
              },
            });
        } else {
          localStorage.setItem('gift_pending_answers', JSON.stringify(allAnswers));
          localStorage.setItem('gift_pending_recommendations', JSON.stringify(recs));
          this.showGuestBlur.set(true);
        }
      },
      error: (err) => {
        this.stopLoading();
        console.error('Recommendation failed', err);
        if (err.status === 429 || err.message?.includes('limit')) {
          this.rateLimitReached.set(true);
        } else {
          this.errorMessage.set('Failed to get recommendations. Please try again.');
        }
      },
    });
  }

  private finishPracticalPhase() {
    this.isLocationPhase.set(true);
  }

  getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  getFirstStoreQuery(stores?: storeLocation[]): string {
    if (!stores || stores.length === 0) return '';
    const store = stores[0];
    return `${store.name} ${store.address}`;
  }

  getMapUrl(query: string): SafeResourceUrl {
    const url = `https://www.google.com/maps/embed/v1/place?key=${environment.googleMapsApiKey}&q=${encodeURIComponent(query)}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Builds a Google Maps search link for a store name and address
  getGoogleMapsSearchUrl(store: storeLocation): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name + ' ' + store.address)}`;
  }

  getDomainFromUrl(url: string): string {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname;
      return hostname.replace(/^www\./, '');
    } catch (error) {
      return 'Link';
    }
  }

  onCountryChange(code: string) {
    this.selectedCountry.set(code);
    this.selectedCity.set('');
    this.cityOptions.set([]);
    this.cityError.set(null);

    if (code && code !== 'PREFER_NOT_TO_SAY') {
      const countryName = this.countries.find((c) => c.code === code)?.name || code;
      this.loadCities(countryName);
    }
  }

  onCityInput(value: string) {
    this.cityQuery.set(value);
    this.selectedCity.set(value);
    this.showCityDropdown.set(true);
  }

  selectCity(city: string): void {
    this.cityQuery.set(city);
    this.selectedCity.set(city);
    this.showCityDropdown.set(false);
  }

  hideCityDropdown(): void {
    setTimeout(() => this.showCityDropdown.set(false), 150);
  }

  async loadCities(countryName: string): Promise<void> {
    this.cityQuery.set('');
    this.showCityDropdown.set(false);
    this.isLoadingCities.set(true);
    this.cityError.set(null);
    try {
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: countryName }),
      });
      if (!res.ok) throw new Error('Failed to load cities');
      const data = await res.json();
      this.cityOptions.set(data.data || []);
    } catch (error: any) {
      this.cityError.set(error.message || 'Could not load cities');
    } finally {
      this.isLoadingCities.set(false);
    }
  }

  goBackToHistory(): void {
    this.showHistory.set(true);
  }

  // Moves to the next recommendation with a short animation lock
  nextRecommendation() {
    if (this.currentRecIndex() < this.recommendations().length - 1 && !this.isAnimating()) {
      this.goToRecommendation(this.currentRecIndex() + 1);
    }
  }

  // Moves to the previous recommendation with a short animation lock
  previousRecommendation() {
    if (this.currentRecIndex() > 0 && !this.isAnimating()) {
      this.goToRecommendation(this.currentRecIndex() - 1);
    }
  }

  deleteSelectedRecommendation() {
    const set = this.selectedHistorySet();
    if (!set) return;
    this.userService.deleteGiftRecommendations(set.id).subscribe({
      next: () => {
        this.closeHistory();
        this.recommendations.set([]);
        this.loadHistory();
        this.toastr.success('Succesfully Deleted!', 'Success');
      },
      error: (err) => {
        console.error('Failed to delete recommendation set:', err);
      },
    });
  }

  // Jumps to a specific recommendation and replays the entrance animation
  goToRecommendation(index: number) {
    if (index === this.currentRecIndex() || this.isAnimating()) return;
    this.isAnimating.set(true);
    this.currentRecIndex.set(index);
    this.cardAnimationKey.update((k) => k + 1);
    setTimeout(() => this.isAnimating.set(false), 250);
  }

  // Triggers the AI recommendation loading simulation with progress bar and cycling messages
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
    const value = this.customValue().trim();
    if (!value) return;

    const error = this.validateAnswer(value);
    this.validationError.set(error || '');
    if (error) return;

    this.onAnswerSelected(value);
    this.showCustomInput.set(false);
    this.customValue.set('');
  }

  continueToHistory() {
    this.showHistory.set(true);
    localStorage.setItem('gift_show_history', 'true');
  }
  private startLoading(initialMessage: string, messages: { threshold: number; text: string }[]) {
    this.clearLoadingIntervals();
    this.isLoadingRecommendations.set(true);
    this.loadingProgress.set(0);
    this.loadingMessage.set(initialMessage);

    let lastMessageIndex = -1;

    this.progressInterval = setInterval(() => {
      this.loadingProgress.update((p) => Math.min(p + 2, 95));

      const currentProgress = this.loadingProgress();
      let messageIndex = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (currentProgress >= messages[i].threshold) {
          messageIndex = i;
          break;
        }
      }

      if (messageIndex !== -1 && messageIndex !== lastMessageIndex) {
        lastMessageIndex = messageIndex;
        this.loadingMessage.set(messages[messageIndex].text);
      }
    }, 80);
  }

  private stopLoading() {
    this.clearLoadingIntervals();
    this.isLoadingRecommendations.set(false);
    this.loadingProgress.set(100);
  }

  private clearLoadingIntervals() {
    if (this.msgInterval) {
      clearInterval(this.msgInterval);
      this.msgInterval = undefined;
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = undefined;
    }
  }

  openHistorySet(set: GiftRecommendationSet) {
    this.selectedHistorySet.set(set);
  }

  closeHistory() {
    this.selectedHistorySet.set(null);
  }
  previousSelectedRecommendation() {
    if (this.selectedRecIndex() > 0) {
      this.selectedRecIndex.update((i) => i - 1);
    }
  }

  nextSelectedRecommendation() {
    const set = this.selectedHistorySet();
    if (!set) return;
    if (this.selectedRecIndex() < set.recommendations.length - 1) {
      this.selectedRecIndex.update((i) => i + 1);
    }
  }

  // Resets all quiz state to allow retaking the gift finder
  restart() {
    this.clearLoadingIntervals();
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
    this.errorMessage.set('');
    this.showCustomInput.set(false);
    this.customValue.set('');
    this.isLoadingRecommendations.set(false);
    this.loadingProgress.set(0);
    this.currentRecIndex.set(0);
    this.cardAnimationKey.set(0);
    this.selectedCountry.set('');
    this.animationKey.update((k) => k + 1);
    this.showHistory.set(false);
    this.selectedHistorySet.set(null);
    this.selectedCity.set('');
    this.cityOptions.set([]);
    this.cityError.set(null);
    localStorage.removeItem('gift_show_history');
  }

  loadHistory() {
    this.isHistoryLoading.set(true);
    console.log('loadHistory called, recommendations length:', this.recommendations().length);

    this.userService.getGiftRecommendationsHistory().subscribe({
      next: (res) => {
        const history: GiftRecommendationSet[] = res.data?.getGiftRecommendationsHistory || [];
        this.recommendationHistory.set(history);

        if (history.length === 0) {
          this.recommendations.set([]);
          this.isCompleted.set(false);
          this.showHistory.set(false);
          this.showGuestBlur.set(false);
        } else if (this.recommendations().length === 0) {
          const latest = history[0];
          console.log('loading latest session:', latest);
          this.finalAnswers.set(latest.answers);
          this.answers.set(latest.answers);
          this.recommendations.set(latest.recommendations);
          this.isCompleted.set(true);
          this.showGuestBlur.set(false);
          this.showHistory.set(true);
        }
        this.isHistoryLoading.set(false);
      },
      error: (err) => {
        console.error('History load failed', err);
      },
    });
  }
}
