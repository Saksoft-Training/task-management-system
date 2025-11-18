import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncatePipe'
})
export class TruncatePipePipe implements PipeTransform {

  transform(value: string | undefined, limit: number = 80): string {
  if (!value) return '';
  return value.length > limit ? value.substring(0, limit) + '...' : value;
}

}
