#!/usr/bin/env bash
# Applies the TOYZ finish to a video and writes web-ready files to public/media:
#   <name>-1080.mp4 (desktop, ~2.6 Mbit/s), <name>-720.mp4 (phones, ~1 Mbit/s) and <name>-poster.jpg (first frame).
# The finish is light (the showroom film is already graded): calmer greens/blues, slightly richer reds,
# a gentle S-curve, a soft vignette and light sharpening after a Lanczos downscale. Audio is removed (videos play muted),
# frame rate becomes 29.97 fps, and the end fades out so the loop restarts cleanly.
# Usage: scripts/grade-video.sh <input> <output-name> [start-second] [end-second] [crop]
#   crop (optional) is an ffmpeg crop expression, e.g. 1920:880:0:0 to remove burned-in bars.
# Example: scripts/grade-video.sh "../toyz website video v1_prob4.mp4" hero-showroom 0 28.2
set -euo pipefail
in="$1"; name="$2"; ss="${3:-0}"; to="${4:-}"; crop="${5:-}"
[ -z "$to" ] && to=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
grade="huesaturation=saturation=-0.14:colors=y+g+c+b,huesaturation=saturation=0.08:intensity=0.015:colors=r,eq=contrast=1.05,curves=master='0/0.012 0.18/0.16 0.5/0.5 0.82/0.845 1/0.975',colorbalance=rs=-0.01:bs=0.018:rh=0.015:bh=-0.01,vignette=angle=PI/8"
pre=""; [ -n "$crop" ] && pre="crop=$crop,"
out="public/media"; tmp=$(mktemp -d)
fade_st=$(python3 -c "print(max(0, round($to - $ss - 0.6, 3)))")
encode() { # width bitrate maxrate suffix
  local vf="${pre}fps=30000/1001,scale=$1:-2:flags=lanczos,${grade},unsharp=5:5:0.3,fade=t=out:st=${fade_st}:d=0.6"
  local x264="-c:v libx264 -preset slow -tune film -profile:v high -pix_fmt yuv420p -g 60 -keyint_min 30 -b:v $2 -maxrate $3 -bufsize $3 -an"
  ffmpeg -y -v error -ss "$ss" -to "$to" -i "$in" -vf "$vf" $x264 -pass 1 -passlogfile "$tmp/p$4" -f mp4 /dev/null
  ffmpeg -y -v error -ss "$ss" -to "$to" -i "$in" -vf "$vf" $x264 -pass 2 -passlogfile "$tmp/p$4" -movflags +faststart "$out/$name-$4.mp4"
}
encode 1920 2600k 4000k 1080
encode 1280 1050k 1700k 720
ffmpeg -y -v error -ss "$ss" -i "$in" -frames:v 1 -vf "${pre}scale=1920:-2:flags=lanczos,${grade},unsharp=5:5:0.3" -q:v 3 "$out/$name-poster.jpg"
rm -rf "$tmp"
echo "Wrote $out/$name-1080.mp4, $out/$name-720.mp4, $out/$name-poster.jpg"
