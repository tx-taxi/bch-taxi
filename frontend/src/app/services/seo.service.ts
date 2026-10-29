import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { StateService } from '@app/services/state.service';
import { nativeSeoPages, nativeSeoScreenshot } from '@app/shared/native-seo-pages';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  network = '';
  baseTitle = 'bch.tx.taxi';
  baseDescription = 'Explore Bitcoin Cash blocks, transactions, addresses, fees and mining activity.';
  baseDomain = 'bch.tx.taxi';

  canonicalLink: HTMLLinkElement = document.getElementById('canonical') as HTMLLinkElement;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private stateService: StateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    // save original meta tags
    // A deep link's entity metadata must not become the site's reset defaults.
    try {
      const canonicalUrl = new URL(this.canonicalLink?.href || '');
      this.baseDomain = canonicalUrl?.host;
    } catch (e) {
      // leave as default
    }

    this.stateService.networkChanged$.subscribe((network) => this.network = network);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) {route = route.firstChild;}
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      switchMap(route => route.data),
    ).subscribe((data) => {
      this.clearSoft404();
      this.updateCanonical(this.router.url.split('?')[0].split('#')[0]);
      if (this.documentMetadata()) { this.setTitle(''); this.setDescription(''); }
    });
  }

  private activeLocale(): 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'nl' | 'ja' | 'zh' | 'pl' | 'da' | undefined {
    const match = window.location.pathname.match(/^\/(es|fr|de|it|pt|ru|nl|ja|zh|pl|da)(?:\/|$)/);
    return match?.[1] as 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'nl' | 'ja' | 'zh' | 'pl' | 'da' | undefined;
  }

  private documentMetadata() {
    if (this.activeLocale()) return undefined;
    let path = this.router.url.split('?')[0].split('#')[0];
    try { path = decodeURIComponent(path); } catch {}
    return nativeSeoPages[path.replace(/\/$/, '') || '/'];
  }

  setTitle(newTitle: string): void {
    const fullTitle = this.documentMetadata()?.title || newTitle + ' - ' + this.getTitle();
    const imageAlt = nativeSeoScreenshot.alt;
    this.titleService.setTitle(fullTitle);
    this.metaService.updateTag({ property: 'og:title', content: fullTitle});
    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle});
    this.metaService.updateTag({ property: 'og:image:alt', content: imageAlt});
    this.metaService.updateTag({ name: 'twitter:image:alt', content: imageAlt});
    this.metaService.updateTag({ property: 'og:meta:ready', content: 'ready'});
  }

  resetTitle(): void {
    const title = this.documentMetadata()?.title || this.getTitle();
    const imageAlt = nativeSeoScreenshot.alt;
    this.titleService.setTitle(title);
    this.metaService.updateTag({ property: 'og:title', content: title});
    this.metaService.updateTag({ name: 'twitter:title', content: title});
    this.metaService.updateTag({ property: 'og:image:alt', content: imageAlt});
    this.metaService.updateTag({ name: 'twitter:image:alt', content: imageAlt});
    this.metaService.updateTag({ property: 'og:meta:ready', content: 'ready'});
  }

  setEnterpriseTitle(title: string, override: boolean = false) {
    if (override) {
      this.baseTitle = title;
    } else {
      this.baseTitle = title + ' - ' + this.baseTitle;
    }
    this.resetTitle();
  }

  setDescription(newDescription: string): void {
    newDescription = this.documentMetadata()?.description || newDescription;
    this.metaService.updateTag({ name: 'description', content: newDescription});
    this.metaService.updateTag({ name: 'twitter:description', content: newDescription});
    this.metaService.updateTag({ property: 'og:description', content: newDescription});
  }

  resetDescription(): void {
    this.metaService.updateTag({ name: 'description', content: this.getDescription()});
    this.metaService.updateTag({ name: 'twitter:description', content: this.getDescription()});
    this.metaService.updateTag({ property: 'og:description', content: this.getDescription()});
  }

  updateCanonical(path) {
    const locale = this.activeLocale();
    // Localized canonical URLs identify the page, not tracking parameters or anchors.
    if (locale) path = path.split('?')[0].split('#')[0];
    try { path = decodeURIComponent(path); } catch {}
    path = path.replace(/\/$/, '') || '/';
    const canonicalUrl = 'https://' + this.baseDomain + (locale ? '/' + locale : '') + path;
    this.canonicalLink.setAttribute('href', canonicalUrl);
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });
  }

  getTitle(): string {
    const locale = this.activeLocale();
    if (locale && !this.network) return this.baseTitle + ' - ' + ({es: 'Explorador de Bitcoin Cash', fr: 'Explorateur Bitcoin Cash', de: 'Bitcoin-Cash-Explorer', it: 'Esploratore Bitcoin Cash', pt: 'Explorador Bitcoin Cash', ru: 'Обозреватель Bitcoin Cash', nl: 'Bitcoin Cash-verkenner', ja: 'Bitcoin Cashエクスプローラー', zh: 'Bitcoin Cash 区块浏览器', pl: 'Eksplorator Bitcoin Cash', da: 'Bitcoin Cash-udforsker'}[locale]);
    if (this.network === 'testnet')
      {return this.baseTitle + ' - Bitcoin Testnet3';}
    if (this.network === 'testnet4')
      {return this.baseTitle + ' - Bitcoin Testnet4';}
    if (this.network === 'signet')
      {return this.baseTitle + ' - Bitcoin Signet';}
    if (this.network === 'liquid')
      {return this.baseTitle + ' - Liquid Network';}
    if (this.network === 'liquidtestnet')
      {return this.baseTitle + ' - Liquid Testnet';}
    return this.baseTitle + ' - ' + (this.network ? this.ucfirst(this.network) : 'Bitcoin Cash') + ' Explorer';
  }

  getDescription(): string {
    const locale = this.activeLocale();
    if (locale) return ({es: 'Explora bloques, transacciones, direcciones, comisiones y actividad de minería de Bitcoin Cash.', fr: 'Explorez les blocs, transactions, adresses, frais et activités de minage Bitcoin Cash.', de: 'Entdecken Sie Bitcoin-Cash-Blöcke, Transaktionen, Adressen, Gebühren und Mining-Aktivitäten.', it: 'Esplora blocchi, transazioni, indirizzi, commissioni e attività di mining Bitcoin Cash.', pt: 'Explore blocos, transações, endereços, taxas e atividade de mineração Bitcoin Cash.', ru: 'Изучайте блоки, транзакции, адреса, комиссии и майнинг Bitcoin Cash.', nl: 'Bekijk Bitcoin Cash-blokken, transacties, adressen, kosten en miningactiviteiten.', ja: 'Bitcoin Cashのブロック、トランザクション、アドレス、手数料、マイニング状況を確認できます。', zh: '查看 Bitcoin Cash 区块、交易、地址、手续费和挖矿活动。', pl: 'Przeglądaj bloki, transakcje, adresy, opłaty i aktywność wydobywczą Bitcoin Cash.', da: 'Udforsk Bitcoin Cash-blokke, transaktioner, adresser, gebyrer og miningaktivitet.'})[locale];
    return this.documentMetadata()?.description || this.baseDescription;
  }

  ucfirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  clearSoft404() {
    window['soft404'] = false;
  }

  logSoft404() {
    window['soft404'] = true;
  }
}
