#!/usr/bin/env bash
# Applies the TOYZ cinematic grade to a video and writes web-ready 1080p + 720p MP4s and a poster.
# Usage: scripts/grade-video.sh <input.mp4> <output-name> [poster-second] [crop]
#   crop (optional) is an ffmpeg crop expression, e.g. 1920:880:0:0 to remove burned-in bottom bars.
# Example: scripts/grade-video.sh ../_source/Bugatti.mp4 hero-bugatti 2 1920:880:0:0
set -euo pipefail
in="$1"; name="$2"; poster_t="${3:-2}"; crop="${4:-}"
grade="huesaturation=saturation=-0.32:colors=y+g+c+b,huesaturation=saturation=0.12:intensity=0.02:colors=r,eq=contrast=1.06:gamma=1.02,curves=master='0/0.01 0.16/0.13 0.5/0.5 0.84/0.87 1/0.965',colorbalance=rs=-0.015:bs=0.025:rh=0.02:bh=-0.015,vignette=angle=PI/7,unsharp=5:5:0.25"
pre=""; [ -n "$crop" ] && pre="crop=$crop,"
out="public/media"
ffmpeg -y -v error -i "$in" -an -vf "${pre}${grade},fps=30" -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -movflags +faststart "$out/$name-1080.mp4"
ffmpeg -y -v error -i "$in" -an -vf "${pre}${grade},scale=1280:-2,fps=30" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart "$out/$name-720.mp4"
ffmpeg -y -v error -ss "$poster_t" -i "$in" -frames:v 1 -vf "${pre}${grade}" -q:v 3 "$out/$name-poster.jpg"
echo "Wrote $out/$name-1080.mp4, $out/$name-720.mp4, $out/$name-poster.jpg"
