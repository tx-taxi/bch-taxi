import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { bchFaqDocs, bchRestDocs, bchWebsocketDocs, BchDocsItem } from '@app/docs/api-docs/bch-api-docs-data';

@Component({
  selector: 'app-api-docs',
  templateUrl: './api-docs.component.html',
  styleUrls: ['./api-docs.component.scss'],
  standalone: false,
})
export class ApiDocsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() whichTab: 'faq' | 'rest' | 'websocket' = 'faq';
  docs: BchDocsItem[] = [];

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.selectDocs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.whichTab && !changes.whichTab.firstChange) this.selectDocs();
  }

  private selectDocs(): void {
    this.docs = this.whichTab === 'rest' ? bchRestDocs : this.whichTab === 'websocket' ? bchWebsocketDocs : bchFaqDocs;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.route.snapshot.fragment) {
        this.anchorLinkClick({ event: null, fragment: this.route.snapshot.fragment });
      }
    });
  }

  anchorLinkClick(event: { event: Event | null; fragment: string }): void {
    event.event?.preventDefault();
    const element = document.getElementById(event.fragment);
    if (!element) return;
    window.scrollTo({ top: element.offsetTop - (window.innerWidth <= 992 ? 100 : 72), behavior: 'smooth' });
    window.history.pushState({}, '', `${document.location.pathname}#${event.fragment}`);
  }

  ngOnDestroy(): void { }
}
