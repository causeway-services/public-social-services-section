;; Guix package definition for the Koios News scheduled runtime.  Lives
;; beside the service it packages; module name is derived mechanically from
;; the repository path (load with `-L <repository root>`), and the file is
;; also loadable directly: `guix build -f koios-news.scm` through
;; scripts/run-pinned-guix.sh.
(define-module (lib emsenn services 561-group services public-services-section services public-social-services-section services public-media-services-section services media-services-section services public-news-media-services-section services koios-news koios-news)
  #:use-module (gnu packages)
  #:use-module (gnu packages bash)
  #:use-module (guix build-system trivial)
  #:use-module (guix gexp)
  #:use-module (guix packages)
  #:export (koios-news-scheduled-runtime-package))

;; local-file resolves relative to this file, which sits in the service's
;; own directory — no repository-root archaeology needed.
(define package-json
  (local-file "package.json" "koios-news-package.json"))
(define operation
  (local-file "bin/koios-news-routine-operation.mjs" "koios-news-routine-operation.mjs"))
(define operation-config
  (local-file "config/routine-operation.json" "koios-news-routine-operation.json"))
(define routine-job-queue
  (local-file "src/routine-job-queue.mjs" "koios-news-routine-job-queue.mjs"))
(define routine-publication
  (local-file "routine-publication-current/src/routine-publication.mjs" "koios-news-routine-publication.mjs"))
(define static-publication
  (local-file "static-delivery-current/src/publication.mjs" "koios-news-static-publication.mjs"))
(define editorial-authority
  (local-file "services/editorial-publication-authority/src/editorial-publication-authority.mjs" "koios-news-editorial-publication-authority.mjs"))

(define runtime-source
  (computed-file
   "koios-news-scheduled-runtime-source"
   #~(begin
       (use-modules (ice-9 ftw))
       (for-each mkdir
                 (list #$output
                       (string-append #$output "/bin")
                       (string-append #$output "/config")
                       (string-append #$output "/src")
                       (string-append #$output "/routine-publication-current")
                       (string-append #$output "/routine-publication-current/src")
                       (string-append #$output "/static-delivery-current")
                       (string-append #$output "/static-delivery-current/src")
                       (string-append #$output "/services")
                       (string-append #$output "/services/editorial-publication-authority")
                       (string-append #$output "/services/editorial-publication-authority/src")))
       (copy-file #$package-json (string-append #$output "/package.json"))
       (copy-file #$operation (string-append #$output "/bin/koios-news-routine-operation.mjs"))
       (copy-file #$operation-config (string-append #$output "/config/routine-operation.json"))
       (copy-file #$routine-job-queue (string-append #$output "/src/routine-job-queue.mjs"))
       (copy-file #$routine-publication (string-append #$output "/routine-publication-current/src/routine-publication.mjs"))
       (copy-file #$static-publication (string-append #$output "/static-delivery-current/src/publication.mjs"))
       (copy-file #$editorial-authority (string-append #$output "/services/editorial-publication-authority/src/editorial-publication-authority.mjs")))))

(define-public (koios-news-scheduled-runtime-package)
  (let ((node-24 (specification->package "node@24.18.0")))
   (package
    (name "koios-news-scheduled-runtime")
    (version "0.0.7")
    (source runtime-source)
    (build-system trivial-build-system)
    (arguments
     (list
      #:modules '((guix build utils))
      #:builder
      #~(begin
          (use-modules (guix build utils))
          (let ((runtime (string-append #$output "/libexec/koios-news"))
                (bin (string-append #$output "/bin")))
            (mkdir-p runtime)
            (mkdir-p bin)
            (copy-recursively #$source runtime)
            (call-with-output-file (string-append bin "/koios-news-routine-operation")
              (lambda (port)
                (format port "#!~a/bin/bash~%exec ~a/bin/node ~a/bin/koios-news-routine-operation.mjs \"$@\"~%"
                        #$bash-minimal #$node-24 runtime)))
            (chmod (string-append bin "/koios-news-routine-operation") #o555)))))
    (inputs (list bash-minimal node-24))
    (home-page "https://koios.news")
    (synopsis "Exact scheduled Koios News offline-candidate runtime")
    (description "This package carries the exact package.json, selected operation, and six declared runtime files admitted by ScheduledActivityDelivery.  It includes a pinned Node 24 interpreter but no credentials, editorial authority, job, schedule, network provider, Cloudflare effect, or mutable customer custody.")
    (license #f))))

;; Loadable-file entry: evaluating this file yields the package.
(koios-news-scheduled-runtime-package)
