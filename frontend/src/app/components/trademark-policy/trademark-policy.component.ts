import { Component } from '@angular/core';
import { SeoService } from '@app/services/seo.service';

@Component({
  selector: 'app-trademark-policy',
  templateUrl: './trademark-policy.component.html',
  styleUrls: ['./trademark-policy.component.scss'],
  standalone: false,
})
export class TrademarkPolicyComponent {
  constructor(
    private seoService: SeoService,
  ) { }

  ngOnInit(): void {
    this.seoService.setTitle($localize`:@@bch.meta.trademark-title:Trademark & Attribution`);
    this.seoService.setDescription($localize`:@@bch.meta.trademark:Trademark and attribution notes for bch.tx.taxi, including upstream mempool/mempool attribution and project independence.`);
  }
}
