import { Component, ViewChild, Input, Output, EventEmitter,
  OnInit, OnDestroy, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { StateService } from '@app/services/state.service';
import { MempoolBlockDelta, isMempoolDelta } from '@interfaces/websocket.interface';
import { TransactionStripped } from '@interfaces/node-api.interface';
import { BlockOverviewGraphComponent } from '@components/block-overview-graph/block-overview-graph.component';
import { Subscription, BehaviorSubject } from 'rxjs';
import { WebsocketService } from '@app/services/websocket.service';
import { RelativeUrlPipe } from '@app/shared/pipes/relative-url/relative-url.pipe';
import { Router } from '@angular/router';
import { Color } from '@components/block-overview-graph/sprite-types';
import TxView from '@components/block-overview-graph/tx-view';
import { FilterMode, GradientMode } from '@app/shared/filters.utils';

@Component({
  selector: 'app-mempool-block-overview',
  templateUrl: './mempool-block-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MempoolBlockOverviewComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() index: number;
  @Input() resolution = 86;
  @Input() showFilters: boolean = false;
  @Input() overrideColors: ((tx: TxView) => Color) | null = null;
  @Input() filterFlags: bigint | undefined = undefined;
  @Input() filterMode: FilterMode = 'and';
  @Input() gradientMode: GradientMode = 'fee';
  @Output() txPreviewEvent = new EventEmitter<TransactionStripped | void>();

  @ViewChild('blockGraph') blockGraph: BlockOverviewGraphComponent;

  sampleBytes = 1;
  private sampleTransactions = new Map<string, TransactionStripped>();
  lastBlockHeight: number;
  blockIndex: number;
  isLoading$ = new BehaviorSubject<boolean>(false);
  timeLtrSubscription: Subscription;
  timeLtr: boolean;
  chainDirection: string = 'right';
  poolDirection: string = 'left';

  blockSub: Subscription;
  firstLoad: boolean = true;

  constructor(
    public stateService: StateService,
    private websocketService: WebsocketService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.timeLtrSubscription = this.stateService.timeLtr.subscribe((ltr) => {
      this.timeLtr = !!ltr;
      this.chainDirection = ltr ? 'left' : 'right';
      this.poolDirection = ltr ? 'right' : 'left';
      this.cd.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.blockSub = this.stateService.mempoolBlockUpdate$.subscribe((update) => {
      // Fit this transaction sample independently of the actual block-capacity strip.
      if (isMempoolDelta(update)) {
        for (const id of update.removed) this.sampleTransactions.delete(id);
        for (const tx of update.added) this.sampleTransactions.set(tx.txid, tx);
        for (const change of update.changed || []) {
          const tx = this.sampleTransactions.get(change.txid);
          if (tx) Object.assign(tx, change);
        }
      } else {
        this.sampleTransactions = new Map(update.transactions.map(tx => [tx.txid, tx]));
      }
      this.sampleBytes = Math.max(1, [...this.sampleTransactions.values()].reduce((sum, tx) => sum + tx.vsize, 0));
      this.replaceBlock([...this.sampleTransactions.values()]);
      this.cd.markForCheck();
    });
  }

  ngOnChanges(changes): void {
    if (changes.index) {
      this.firstLoad = true;
      if (this.blockGraph) {
        this.blockGraph.clear(changes.index.currentValue > changes.index.previousValue ? this.chainDirection : this.poolDirection);
      }
      if (!this.websocketService.startTrackMempoolBlock(changes.index.currentValue) && this.stateService.mempoolBlockState && this.stateService.mempoolBlockState.block === changes.index.currentValue) {
        this.resumeBlock(Object.values(this.stateService.mempoolBlockState.transactions));
      } else {
        this.isLoading$.next(true);
      }
    }
  }

  ngOnDestroy(): void {
    this.blockGraph?.destroy();
    this.blockSub.unsubscribe();
    this.timeLtrSubscription.unsubscribe();
    this.websocketService.stopTrackMempoolBlock();
  }

  replaceBlock(transactionsStripped: TransactionStripped[]): void {
    const blockMined = (this.stateService.latestBlockHeight > this.lastBlockHeight);
    if (this.blockIndex !== this.index) {
      const direction = (this.blockIndex == null || this.index < this.blockIndex) ? this.poolDirection : this.chainDirection;
      this.blockGraph.enter(transactionsStripped, direction);
    } else {
      this.blockGraph.replace(transactionsStripped, blockMined ? this.chainDirection : this.poolDirection);
    }

    this.firstLoad = false;
    this.lastBlockHeight = this.stateService.latestBlockHeight;
    this.blockIndex = this.index;
    this.isLoading$.next(false);
  }

  updateBlock(delta: MempoolBlockDelta): void {
    const blockMined = (this.stateService.latestBlockHeight > this.lastBlockHeight);
    if (this.blockIndex !== this.index) {
      const direction = (this.blockIndex == null || this.index < this.blockIndex) ? this.poolDirection : this.chainDirection;
      this.blockGraph.replace(delta.added, direction);
    } else {
      if (blockMined) {
        this.blockGraph.update(delta.added, delta.removed, delta.changed || [], blockMined ? this.chainDirection : this.poolDirection, blockMined);
      } else {
        this.blockGraph.deferredUpdate(delta.added, delta.removed, delta.changed || [], this.poolDirection);
      }
    }

    this.lastBlockHeight = this.stateService.latestBlockHeight;
    this.blockIndex = this.index;
    this.isLoading$.next(false);
  }

  resumeBlock(transactionsStripped: TransactionStripped[]): void {
    if (this.blockGraph) {
      this.firstLoad = false;
      this.sampleTransactions = new Map(transactionsStripped.map(tx => [tx.txid, tx]));
      this.sampleBytes = Math.max(1, transactionsStripped.reduce((sum, tx) => sum + tx.vsize, 0));
      this.blockGraph.setup(transactionsStripped, true);
      this.blockIndex = this.index;
      this.isLoading$.next(false);
    } else {
      requestAnimationFrame(() => {
        this.resumeBlock(transactionsStripped);
      });
    }
  }

  onTxClick(event: { tx: TransactionStripped, keyModifier: boolean }): void {
    const url = new RelativeUrlPipe(this.stateService).transform(`/tx/${event.tx.txid}`);
    if (!event.keyModifier) {
      this.router.navigate([url]);
    } else {
      window.open(url, '_blank');
    }
  }
}
