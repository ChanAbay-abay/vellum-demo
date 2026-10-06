#!/bin/bash
# Rebuild the spec from the skeleton then re-attach reference PBR evidence (run from anywhere).
set -e
W=/Users/chanchan/Programming/Iridel/demos/vellum-demo/context/3d/fuerza
cd ~/.claude/skills/img2threejs
python3 $W/build_spec.py $W/skeleton.json $W/object-sculpt-spec.json
for m in frame-white carbon-black rim-carbon tyre-rubber steel drivetrain-black cockpit-black saddle-black stripe-paints; do
  python3 forge/stage1_intake/extract_pbr_evidence.py $W/crops/$m.png --out-dir $W/material-evidence/$m --material-id $m --target-threshold 0.7 --spec $W/object-sculpt-spec.json --in-place --report $W/material-evidence/$m.json >/dev/null
done
python3 forge/stage2_spec/validate_sculpt_spec.py $W/object-sculpt-spec.json --strict-quality
