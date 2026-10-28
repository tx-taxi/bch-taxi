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
  readonly explorerLabel = $localize`:@@bch.docs.context.explorer:explorer`;
  readonly documentationLabel = $localize`:@@bch.docs.context.documentation:documentation`;
}
