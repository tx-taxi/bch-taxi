# BCH difficulty and halving component candidate

Status: locally verified; not deployed.

This branch starts at BCH production commit `8e9b640d8d22fc99e7978499c070f19592bdc5cc` and ports the BCH Explorer difficulty adjustment and halving presentation into the current tx.taxi theme. It includes the ASERT deviation graph, difficulty/halving toggle, matching fee progress bar thickness, and source attribution. No unrelated changes from the older BCH candidate are included.

Source reference: [bitcoin-cash-explorer](https://gitlab.melroy.org/bitcoincash/bitcoin-cash-explorer), commit `8eaa47ea756cbd1459d09cdaddc89dd26019faaa` (AGPL-3.0-or-later). Attribution is included in `LICENSE` and the site's trademark policy.

Validation: `ng build --configuration production` passed on the rebased production head, with existing style budget warnings. Local browser review at desktop (1440 px) and mobile (390 px) confirmed that the difficulty graph and halving toggle render, no page errors occur, and neither viewport has horizontal overflow. Screenshots are in this directory. The live BCH site still had the prior widget before rollout.

Before deployment, compare the production `main` head with this branch's base. If production has advanced, replay this commit onto its new head and repeat the production build and relevant browser check.
