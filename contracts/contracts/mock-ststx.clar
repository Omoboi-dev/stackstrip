;; mock-ststx: a testnet stand-in for stSTX. A SIP-010 token with an exchange
;; rate we can advance to simulate Bitcoin stacking yield accruing over time.
;; Mainnet later replaces this with the real stSTX.

(impl-trait .sip-010-trait.sip-010-trait)

(define-fungible-token mock-ststx)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-rate-decrease (err u102))

(define-data-var token-name (string-ascii 32) "Mock Stacked STX")
(define-data-var token-symbol (string-ascii 32) "mock-stSTX")
(define-data-var token-uri (optional (string-utf8 256)) none)

;; Exchange rate scaled by 1e8. Starts at 1.0 and only grows, representing yield.
(define-data-var exchange-rate uint u100000000)

(define-read-only (get-exchange-rate)
  (ok (var-get exchange-rate)))

(define-public (set-exchange-rate (new-rate uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (>= new-rate (var-get exchange-rate)) err-rate-decrease)
    (var-set exchange-rate new-rate)
    (ok true)))

;; Open faucet so anyone can get test tokens.
(define-public (mint (amount uint) (recipient principal))
  (ft-mint? mock-ststx amount recipient))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (try! (ft-transfer? mock-ststx amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)))

(define-read-only (get-name) (ok (var-get token-name)))
(define-read-only (get-symbol) (ok (var-get token-symbol)))
(define-read-only (get-decimals) (ok u6))
(define-read-only (get-balance (who principal)) (ok (ft-get-balance mock-ststx who)))
(define-read-only (get-total-supply) (ok (ft-get-supply mock-ststx)))
(define-read-only (get-token-uri) (ok (var-get token-uri)))
