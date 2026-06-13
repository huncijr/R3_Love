import { Directive } from '@angular/core';
import { BrnSheetDescription } from '@spartan-ng/brain/sheet';

@Directive({
  selector: '[hlmSheetDescription],hlm-sheet-description',
  hostDirectives: [BrnSheetDescription],
  host: {
    'data-slot': 'sheet-description',
  },
})
export class HlmSheetDescription {}
