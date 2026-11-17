'use client';

import { Camera } from 'lucide-react';
import type { ChangeEvent, Ref } from 'react';
import { rowActionClass } from './field-styles';
import { useFieldStrings } from './field-strings';
import { focusOutlineClass } from './role-tokens';
import { cn } from './utils';

/**
 * Shown only on a touch screen, and decided by CSS alone: `(hover: none)`
 * asks about the PRIMARY pointer, so a touchscreen laptop, whose browser
 * ignores `capture` and would open a mere picture picker, keeps the plain
 * control, and an iPad with a trackpad keeps its camera. It is Tailwind's
 * arbitrary variant rather than a custom one, because a Tailwind host compiles
 * this package's classes from `dist/` and never reads a variant the package's
 * own stylesheet defines; the class name alone carries the query. The server
 * render needs no guess about the device, and nothing shifts at hydration.
 */
export const TOUCH_ONLY_CLASS = 'hidden [@media(hover:none)]:flex';

/**
 * "Take photo": the button under an empty input's dropzone that opens the
 * back camera, a full-width row 48 pixels tall, a larger target than the
 * field's other ways in since it is the one a phone is held for. See
 * docs/camera.md.
 */
export function TakePhotoButton({
  label,
  disabled,
  onTake,
}: {
  /** The field's label as the form shows it, which the button's name carries. */
  label: string;
  disabled?: boolean;
  onTake: () => void;
}) {
  const s = useFieldStrings();
  return (
    <button
      type="button"
      onClick={onTake}
      disabled={disabled}
      aria-label={s.takePhotoAria(label)}
      data-take-photo=""
      className={cn(
        rowActionClass,
        'min-h-12 bg-input font-medium sm:min-h-12',
        TOUCH_ONLY_CLASS,
        focusOutlineClass,
      )}
    >
      <Camera className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      {s.takePhoto}
    </button>
  );
}

/**
 * The file input the camera opens through: `capture="environment"` asks a
 * phone for its back camera, and `accept="image/*"` for a photo. It is never
 * shown and takes no focus: "Take photo", "Add page" and a page's "Retake" are
 * the controls, and each clicks it. Kept in the layout (`sr-only`) rather than
 * `display: none`, which some mobile browsers refuse to open a picker for.
 */
export function CameraInput({
  ref,
  disabled,
  onPhoto,
}: {
  ref: Ref<HTMLInputElement>;
  disabled?: boolean;
  onPhoto: (photo: File) => void;
}) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const photo = event.target.files?.[0];
    // Emptied, so the same photo can be given again after a Remove.
    event.target.value = '';
    if (photo) onPhoto(photo);
  };
  return (
    <input
      ref={ref}
      type="file"
      accept="image/*"
      capture="environment"
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
      disabled={disabled}
      onChange={onChange}
      data-camera-input=""
    />
  );
}
