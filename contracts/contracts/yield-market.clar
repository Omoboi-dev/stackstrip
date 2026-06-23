;; yield-market: split a yield-bearing token into PT + YT, and redeem after maturity.
;;
;; Accounting model (MVP):
;;   mock-ststx has an exchange rate that only grows. We capture it at init
;;   (start-rate) and freeze it at maturity (settle-rate). For S shares deposited
;;   we mint S PT and S YT. At settlement:
;;     redeem 1 PT -> start-rate / settle-rate shares   (the principal)
;;     redeem 1 YT -> (settle-rate - start-rate) / settle-rate shares (the yield)
;;   The two always sum back to 1 share, so the pool stays solvent.
;;
;; MVP limitation: all deposits are treated as entering at the market start rate.
;; Per-deposit rate accounting is a v2 item.

(define-constant contract-owner tx-sender)

(define-constant err-owner-only (err u100))
(define-constant err-not-initialized (err u200))
(define-constant err-already-initialized (err u201))
(define-constant err-matured (err u202))
(define-constant err-not-matured (err u203))
(define-constant err-already-settled (err u204))
(define-constant err-not-settled (err u205))
(define-constant err-zero-amount (err u206))

(define-data-var initialized bool false)
(define-data-var maturity uint u0)
(define-data-var start-rate uint u0)
(define-data-var settle-rate uint u0)

(define-read-only (get-maturity) (var-get maturity))
(define-read-only (get-start-rate) (var-get start-rate))
(define-read-only (get-settle-rate) (var-get settle-rate))
(define-read-only (is-initialized) (var-get initialized))
(define-read-only (is-matured) (>= stacks-block-height (var-get maturity)))
(define-read-only (is-settled) (> (var-get settle-rate) u0))

(define-public (initialize (maturity-height uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (not (var-get initialized)) err-already-initialized)
    (var-set maturity maturity-height)
    (var-set start-rate (unwrap-panic (contract-call? .mock-ststx get-exchange-rate)))
    (var-set initialized true)
    (ok true)))

(define-public (deposit (amount uint))
  (begin
    (asserts! (var-get initialized) err-not-initialized)
    (asserts! (> amount u0) err-zero-amount)
    (asserts! (< stacks-block-height (var-get maturity)) err-matured)
    (try! (contract-call? .mock-ststx transfer amount tx-sender (as-contract tx-sender) none))
    (try! (contract-call? .pt-token mint amount tx-sender))
    (try! (contract-call? .yt-token mint amount tx-sender))
    (ok amount)))

(define-public (settle)
  (begin
    (asserts! (var-get initialized) err-not-initialized)
    (asserts! (>= stacks-block-height (var-get maturity)) err-not-matured)
    (asserts! (is-eq (var-get settle-rate) u0) err-already-settled)
    (var-set settle-rate (unwrap-panic (contract-call? .mock-ststx get-exchange-rate)))
    (ok (var-get settle-rate))))

(define-public (redeem-pt (amount uint))
  (let ((recipient tx-sender)
        (sr (var-get settle-rate)))
    (asserts! (> sr u0) err-not-settled)
    (asserts! (> amount u0) err-zero-amount)
    (let ((shares-out (/ (* amount (var-get start-rate)) sr)))
      (try! (contract-call? .pt-token burn amount recipient))
      (try! (as-contract (contract-call? .mock-ststx transfer shares-out tx-sender recipient none)))
      (ok shares-out))))

(define-public (redeem-yt (amount uint))
  (let ((recipient tx-sender)
        (sr (var-get settle-rate)))
    (asserts! (> sr u0) err-not-settled)
    (asserts! (> amount u0) err-zero-amount)
    (let ((shares-out (/ (* amount (- sr (var-get start-rate))) sr)))
      (try! (contract-call? .yt-token burn amount recipient))
      (try! (as-contract (contract-call? .mock-ststx transfer shares-out tx-sender recipient none)))
      (ok shares-out))))
