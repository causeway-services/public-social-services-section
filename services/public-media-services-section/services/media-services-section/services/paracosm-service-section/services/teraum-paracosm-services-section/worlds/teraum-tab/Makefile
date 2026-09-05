FENNEL ?= fennel
TAB_ROOT ?= /home/emsenn/info/lib/emsenn/services/561-group/services/engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/computer-mud-engineering-services-section/services/computer-mud-engine-engineering-services-section/apps/tab

FENNEL_TAB = TAB_ROOT="$(TAB_ROOT)" "$(FENNEL)" --add-fennel-path "$(TAB_ROOT)/?.fnl"

.DEFAULT_GOAL := verify

check:
	@command -v "$(FENNEL)" >/dev/null || { echo "Teraum TAB requires Fennel; set FENNEL=/path/to/fennel" >&2; exit 1; }
	@test -f "$(TAB_ROOT)/tab.fnl" || { echo "TAB_ROOT does not name a TAB engine: $(TAB_ROOT)" >&2; exit 1; }

verify: check
	@$(FENNEL_TAB) tests/verify.fnl

load: check
	@$(FENNEL_TAB) run.fnl

topology: check
	@$(FENNEL_TAB) tools/topology.fnl

.PHONY: check verify load topology
