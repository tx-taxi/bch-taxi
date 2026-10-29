import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tx-taxi-docs-intro',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './tx-taxi-docs-intro.component.html',
  styleUrls: ['./tx-taxi-docs-intro.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TxTaxiDocsIntroComponent {
  @Input() context = 'documentation';
  @Input() chainName = '';
  @Input() chainHost = '';
  get contextLabel(): string {
    return this.context === 'explorer'
      ? $localize`:@@bch.docs.context.chain-explorer:${this.chainName}:CHAIN: explorer`
      : this.context === 'documentation'
        ? $localize`:@@bch.docs.context.chain-documentation:${this.chainName}:CHAIN: documentation`
        : `${this.chainName} ${this.context}`;
  }
}
