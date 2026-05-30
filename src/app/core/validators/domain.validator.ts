import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function domainValidator(domain: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;

    if (!value) {
      return null;
    }

    if (!value.endsWith(domain)) {
      return { invalidDomain: true };
    }

    return null;
  };
}
