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

  navLinkClick(event: Event, fragment: string): void {
    event.preventDefault();
    this.navLinkClickEvent.emit({ event, fragment });
  }
}
