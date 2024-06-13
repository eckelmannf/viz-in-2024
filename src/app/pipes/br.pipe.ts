import { Pipe, PipeTransform, Sanitizer } from '@angular/core';

@Pipe({
  name: 'br',
  standalone: true
})
export class BrPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    // console.log("POPE", value)
    
    return value.replaceAll('\n', '<br>');
  }

}
