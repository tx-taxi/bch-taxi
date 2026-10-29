import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { bchFaqDocs, bchRestDocs, bchWebsocketDocs, BchDocsItem } from '@app/docs/api-docs/bch-api-docs-data';

@Component({
  selector: 'app-api-docs-nav',
  templateUrl: './api-docs-nav.component.html',
  styleUrls: ['./api-docs-nav.component.scss'],
  standalone: false,
})
export class ApiDocsNavComponent implements OnInit, OnChanges {
  @Input() whichTab: 'faq' | 'rest' | 'websocket' = 'faq';
  @Output() navLinkClickEvent = new EventEmitter<{ event: Event; fragment: string }>();
  tabData: BchDocsItem[] = [];

  ngOnInit(): void {
    this.selectDocs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.whichTab && !changes.whichTab.firstChange) this.selectDocs();
  }

  private selectDocs(): void {
    this.tabData = this.whichTab === 'rest' ? bchRestDocs : this.whichTab === 'websocket' ? bchWebsocketDocs : bchFaqDocs;
  }

  anchorHref(fragment: string): string {
    return `${document.location.pathname}${document.location.search}#${fragment}`;
  }

  navLinkClick(event: MouseEvent, fragment: string): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    this.navLinkClickEvent.emit({ event, fragment });
  }
}
