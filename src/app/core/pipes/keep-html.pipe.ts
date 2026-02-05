import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'keepHtml', pure: false,
    standalone: true
})
export class EscapeHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(content: any) {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
