#!/usr/bin/env python3
"""One-time verified source migration from previous native-entity prototype.
Both branches remain immutable inputs; only this active recovery branch is changed.
The last D0/D1 native schema repair and current-value protections stay in force.
"""
from pathlib import Path
import subprocess

APP=Path("src/app/energy-card.js")
native=subprocess.check_output([
  "git","show","origin/work/energy-native-interface-closure-20261011:src/app/energy-card.js"
],text=True)
current=APP.read_text(encoding="utf-8")
def block(s,begin,end):
    if s.count(begin)!=1 or s.count(end)<1: raise ValueError(f"Anchor mismatch: {begin} / {end}")
    start=s.index(begin)
    stop=s.index(end,start)
    if stop<=start: raise ValueError(f"Bad block: {begin}")
    return s[start:stop]
def transplant(begin,end):
    global current
    before=block(current,begin,end)
    after=block(native,begin,end)
    current=current.replace(before,after,1)
def exact(old,new):
    global current
    n=current.count(old)
    if n<1: raise ValueError(f"Expected anchor not found: {old[:100]}")
    current=current.replace(old,new)
    return n

# Canonical object+command rows must participate in HA subscriptions.
transplant("    subscriptionEntityIds(surfaces = []) {","    entitySignature(entityIds = []) {")
# Remove singleton Public V2 sensor as product interface.
transplant("    publicUxEntities() {","    allRows() {")
# Native product identity and provenance; preserve our own financial/plan readers.
transplant("    assets() {","    asset(assetId) {")
# The product projection is now from direct canonical HA entities.
transplant("    publicV2() {","    experiencePresence() {") if False else None
old=block(current,"    publicV2() {","    experiencePresence() {")
new=block(native,"    canonicalProduct() {","    experiencePresence() {")
current=current.replace(old,new,1)
exact("this.publicV2()","this.canonicalProduct()")
exact("rt.publicV2()","rt.canonicalProduct()")
# Nested runtime references also route to the new canonical product boundary.
current=current.replace(".publicV2()",".canonicalProduct()")
# Provenance labels must name the actually consulted native HA authority.
current=current.replace("RHI_ENERGY_PUBLIC_CONTRACT_V2","RHI_ENERGY_CANONICAL_PROPERTY_V2")

# The runtime command inventory is direct native button publication. It must
# not be intersected with an absent aggregate command listing.
old=block(current,"    commands() {","    commandVisible(command) {")
new="""    commands() {
      return this.commandContract().rows;
    }
"""
current=current.replace(old,new,1)

# No obsolete hardcoded Public V2 sensor may show up in diagnostics.
exact("[UX_INTERFACES.publicV2,'Energy Public V2',", "[RELEASE_ENTITY,'Energy release diagnostics',")
# The original renderer is retained, but never infer a product-ready footer
# from the presence of a diagnostics-only publisher.
assert "readEnergyPublicV2(" not in current
assert "UX_INTERFACES.publicV2" not in current
assert "RHI_ENERGY_PUBLIC_CONTRACT_V2" not in current
APP.write_text(current,encoding="utf-8")

# Exact product-boundary files from the native-entity implementation.
# The source's original tests are retained; new native fixture augments them.
test=Path("validation/test_native_energy_backend_interfaces.js")
if not test.is_file():raise ValueError("Expected native regression test not checked out")
print("Migrated native Energy canonical object, command and property UI boundary")
