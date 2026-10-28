import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SeoService } from '@app/services/seo.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent implements OnInit {
  constructor(
    private seoService: SeoService,
  ) { }

  ngOnInit(): void {
    this.seoService.setTitle($localize`:@@bch.about.title:About bch.tx.taxi`);
    this.seoService.setDescription($localize`:@@bch.meta.about:Learn about bch.tx.taxi, a Bitcoin Cash block and mempool explorer in the tx.taxi multi-chain family.`);
  }
}
