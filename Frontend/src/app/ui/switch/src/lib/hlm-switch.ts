import { Component, computed, input, output } from '@angular/core';
import { BrnSwitch, BrnSwitchThumb } from '@spartan-ng/brain/switch';
import { hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';

@Component({
  selector: 'hlm-switch',
  imports: [BrnSwitch, BrnSwitchThumb],
  template: `
    <brn-switch
      [checked]="checked()"
      (checkedChange)="checkedChange.emit($event)"
      [disabled]="disabled()"
      [ariaLabel]="ariaLabel()"
      [id]="id()"
      [name]="name()"
      [class]="_computedClass()"
    >
      <brn-switch-thumb [class]="_thumbComputedClass()"></brn-switch-thumb>
    </brn-switch>
  `,
  host: {
    '[attr.data-slot]': '"switch"',
  },
})
export class HlmSwitch {
  // Whether the switch is toggled on
  public readonly checked = input<boolean>(false);

  // Emits when the user toggles the switch
  public readonly checkedChange = output<boolean>();

  // Whether the switch is disabled
  public readonly disabled = input<boolean>(false);

  // Accessibility label for screen readers
  public readonly ariaLabel = input<string | null>(null);

  // Id and name for form usage
  public readonly id = input<string | null>(null);
  public readonly name = input<string | null>(null);

  // Extra Tailwind classes for the switch track and thumb
  public readonly class = input<ClassValue>('');
  public readonly thumbClass = input<ClassValue>('');

  // Styled track of the switch
  protected readonly _computedClass = computed(() =>
    hlm(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
      this.checked() ? 'bg-primary' : 'bg-input',
      this.class(),
    ),
  );

  protected readonly _thumbComputedClass = computed(() =>
    hlm(
      'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
      this.checked() ? 'translate-x-5' : 'translate-x-0',
      this.thumbClass(),
    ),
  );
}
