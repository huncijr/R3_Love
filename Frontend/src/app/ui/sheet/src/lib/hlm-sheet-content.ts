import { Component, computed, input } from '@angular/core';
import { BrnSheetContent } from '@spartan-ng/brain/sheet';
import { hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';

@Component({
  selector: 'hlm-sheet-content',
  hostDirectives: [BrnSheetContent],
  template: ` <ng-content /> `,
  host: {
    '[class]': '_computedClass()',
  },
})
export class HlmSheetContent {
  public readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly _computedClass = computed(() =>
    hlm(
      'bg-background z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
      'fixed inset-y-0 right-0 h-full w-3/4 border-l border-border p-6 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
      this.userClass(),
    ),
  );
}
