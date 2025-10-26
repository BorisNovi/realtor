import { animate, animation, query, style, transition, trigger, useAnimation } from '@angular/animations';

export enum Duration {
  Fast = 125,
  Normal = 225,
  Slow = 400,
}

export const EASE = 'cubic-bezier(0.390, 0.575, 0.565, 1.000)';
export const DURATION = `${Duration.Normal}ms`;

export function fadeInAnimation(duration: Duration | number = Duration.Normal, delay = 0) {
  return animation([style({ opacity: 0 }), animate('{{duration}} {{delay}} {{ease}}', style({ opacity: 1 }))], {
    params: {
      duration: `${duration}ms`,
      delay: `${delay}ms`,
      ease: EASE,
    },
  });
}

export function fadeOutAnimation(duration: Duration | number = Duration.Normal, delay = 0) {
  return animation(animate('{{duration}} {{delay}} {{ease}}', style({ opacity: 0 })), {
    params: {
      duration: `${duration}ms`,
      delay: `${delay}ms`,
      ease: EASE,
    },
  });
}

export const FADE_IN_ANIMATION = fadeInAnimation();
export const FADE_OUT_ANIMATION = fadeOutAnimation();

export const FADE_IN = trigger('fadeIn', [transition(':enter', useAnimation(FADE_IN_ANIMATION))]);

export const FADE_OUT = trigger('fadeOut', [transition(':leave', useAnimation(FADE_OUT_ANIMATION))]);

export const FADE = trigger('fade', [
  transition(':enter', useAnimation(FADE_IN_ANIMATION)),
  transition(':leave', useAnimation(FADE_OUT_ANIMATION)),
]);

export const FADE_LIST = trigger('fadeList', [
  transition('* => *', [
    // each time the binding value changes
    query(':enter', useAnimation(FADE_IN_ANIMATION), { optional: true }),
    query(':leave', useAnimation(FADE_OUT_ANIMATION), { optional: true }),
  ]),
]);

export const SLIDE_DOWN_ANIMATION = animation(
  [
    style({ height: 0, 'margin-top': 0, 'margin-bottom': 0, 'padding-top': 0, 'padding-bottom': 0, overflow: 'hidden' }),
    animate(
      '{{DURATION}} {{EASE}}',
      style({ height: '*', 'margin-top': '*', 'margin-bottom': '*', 'padding-top': '*', 'padding-bottom': '*' }),
    ),
  ],
  { params: { DURATION, EASE } },
);

export const SLIDE_UP_ANIMATION = animation(
  [
    style({ overflow: 'hidden' }),
    animate(
      '{{DURATION}} {{EASE}}',
      style({ height: 0, 'margin-top': 0, 'margin-bottom': 0, 'padding-top': 0, 'padding-bottom': 0 }),
    ),
  ],
  { params: { DURATION, EASE } },
);

export const SLIDE = trigger('slide', [
  transition(':enter', useAnimation(SLIDE_DOWN_ANIMATION)),
  transition(':leave', useAnimation(SLIDE_UP_ANIMATION)),
]);

export const SLIDE_HORIZONTAL_OUT_ANIMATION = animation(
  [
    style({ width: 0, 'margin-left': 0, 'margin-right': 0, 'padding-left': 0, 'padding-right': 0, overflow: 'hidden' }),
    animate(
      '{{DURATION}} {{EASE}}',
      style({ width: '*', 'margin-left': '*', 'margin-right': '*', 'padding-left': '*', 'padding-right': '*' }),
    ),
  ],
  { params: { DURATION, EASE } },
);

export const SLIDE_HORIZONTAL_IN_ANIMATION = animation(
  [
    style({ overflow: 'hidden' }),
    animate(
      '{{DURATION}} {{EASE}}',
      style({ width: 0, 'margin-left': 0, 'margin-right': 0, 'padding-left': 0, 'padding-right': 0 }),
    ),
  ],
  { params: { DURATION, EASE } },
);

export const SLIDE_HORIZONTAL = trigger('slideHorizontal', [
  transition(':enter', useAnimation(SLIDE_HORIZONTAL_OUT_ANIMATION)),
  transition(':leave', useAnimation(SLIDE_HORIZONTAL_IN_ANIMATION)),
]);

export const SLIDE_ALL_OUT_ANIMATION = animation(
  [
    style({ width: 0, height: 0, margin: 0, padding: 0, overflow: 'hidden' }),
    animate('{{DURATION}} {{EASE}}', style({ width: '*', height: '*', margin: '*', padding: '*' })),
  ],
  { params: { DURATION, EASE } },
);

export const SLIDE_ALL_IN_ANIMATION = animation(
  [style({ overflow: 'hidden' }), animate('{{DURATION}} {{EASE}}', style({ width: 0, height: 0, margin: 0, padding: 0 }))],
  { params: { DURATION, EASE } },
);

export const SLIDE_ALL = trigger('slideAll', [
  transition(':enter', useAnimation(SLIDE_ALL_OUT_ANIMATION)),
  transition(':leave', useAnimation(SLIDE_ALL_IN_ANIMATION)),
]);
