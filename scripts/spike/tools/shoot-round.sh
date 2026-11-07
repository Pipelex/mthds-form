#!/bin/bash
# usage: shoot-round.sh <round>  -> shots/<round>/{view,full}/<method>--<moment>--<model>--<seed>.png
SP=/private/tmp/claude-501/-Users-lchoquel-repos-Pipelex-mthds-form/3dbd3e68-41f8-410f-a719-f18e3aec8648/scratchpad
CAP=/Users/lchoquel/repos/Pipelex/_mthds-form--designer-reach-spike/src/__stories__/spike/captures
R=$1; U='http://localhost:6006/iframe.html?viewMode=story&globals=themeView:light&id=spike-captures--capture&args=capture:'
mkdir -p $SP/shots/$R/view $SP/shots/$R/full
pairs=()
for f in $CAP/*--$R.json; do id=$(basename $f .json); pairs+=("${id%--$R}=${U}${id//./_}"); done
cd $SP/tools && node shoot.mjs $SP/shots/$R/view 1280 --viewport "${pairs[@]}" | grep -v height
cd $SP/tools && H=800 node shoot.mjs $SP/shots/$R/full 1280 "${pairs[@]}" | grep -v height
