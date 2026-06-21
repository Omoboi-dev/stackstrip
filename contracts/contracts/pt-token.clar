;; pt-token: the Principal Token. Redeemable for principal at maturity.
;; Mint and burn are locked to the market contract, set once via set-minter.

(impl-trait .sip-010-trait.sip-010-trait)

(define-fungible-token pt)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-not-minter (err u103))
(define-constant err-minter-set (err u104))

(define-data-var token-name (string-ascii 32) "Stackstrip Principal Token")
(define-data-var token-symbol (string-ascii 32) "PT")
(define-data-var token-uri (optional (string-utf8 256)) none)

(define-data-var minter principal contract-owner)
(define-data-var minter-locked bool false)

(define-public (set-minter (new-minter principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (not (var-get minter-locked)) err-minter-set)
    (var-set minter new-minter)
    (var-set minter-locked true)
    (ok true)))

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq contract-caller (var-get minter)) err-not-minter)
    (ft-mint? pt amount recipient)))

(define-public (burn (amount uint) (owner principal))
  (begin
    (asserts! (is-eq contract-caller (var-get minter)) err-not-minter)
    (ft-burn? pt amount owner)))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (try! (ft-transfer? pt amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)))

(define-read-only (get-name) (ok (var-get token-name)))
(define-read-only (get-symbol) (ok (var-get token-symbol)))
(define-read-only (get-decimals) (ok u6))
(define-read-only (get-balance (who principal)) (ok (ft-get-balance pt who)))
(define-read-only (get-total-supply) (ok (ft-get-supply pt)))
(define-read-only (get-token-uri) (ok (var-get token-uri)))
