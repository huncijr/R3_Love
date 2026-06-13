import { Directive } from '@angular/core';
import { BrnSheetTitle } from '@spartan-ng/brain/sheet';

@Directive({
  selector: '[hlmSheetTitle],hlm-sheet-title',
  hostDirectives: [BrnSheetTitle],
  host: {
    'data-slot': 'sheet-title',
  },
})
export class HlmSheetTitle {}
