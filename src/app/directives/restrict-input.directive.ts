import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appRestrictInput]',
  standalone: true,
})
export class RestrictInputDirective {
  // Este patrón es para validar un string COMPLETO (usado en onPaste)
  // Fíjate en "ñÁÉÍÓÚÜÑ" al final de las letras permitidas
  private readonly allowedStringPattern = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]*$/;

  // Este patrón es para validar UN SOLO CARÁCTER (usado en onKeydown)
  // También incluye "ñÁÉÍÓÚÜÑ"
  private readonly allowedSingleCharPattern = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]$/;

  constructor() {}

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const controlKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'Clear',
      'Copy', 'Paste',
    ];

    if (controlKeys.includes(event.key)) {
      return;
    }

    if ((event.ctrlKey || event.metaKey) &&
        ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) {
      return;
    }

    if (event.key.startsWith('F') && !isNaN(parseInt(event.key.substring(1), 10))) {
        return;
    }

    // Aquí se usa allowedSingleCharPattern, que ya incluye la ñ/Ñ
    if (event.key && event.key.length === 1 && !this.allowedSingleCharPattern.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData?.getData('text/plain');

    if (pastedText) {
      // Aquí se usa allowedStringPattern, que ya incluye la ñ/Ñ
      if (!this.allowedStringPattern.test(pastedText)) {
        event.preventDefault();
      }
    }
  }
}