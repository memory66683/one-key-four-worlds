#!/usr/bin/env bash
# 一键发布到 GitHub Pages
# 用法：./deploy.sh "这次改了什么"
set -euo pipefail
cd "$(dirname "$0")"

REPO="memory66683/one-key-four-worlds"

TOKEN="${GITHUB_TOKEN:-$(security find-generic-password -s okfw-deploy -w 2>/dev/null || true)}"
if [ -z "${TOKEN}" ]; then
  read -rsp "GitHub token (repo 权限): " TOKEN; echo
fi

git add -A
git commit -m "${1:-update}" >/dev/null 2>&1 || echo "（没有新改动）"

ASKPASS="$(mktemp)"
trap 'rm -f "$ASKPASS"' EXIT
printf '#!/bin/sh\ncase "$1" in *[Uu]sername*) echo "x-access-token";; *) echo "%s";; esac\n' "$TOKEN" > "$ASKPASS"
chmod +x "$ASKPASS"

# GIT_CONFIG_GLOBAL=/dev/null：绕过本机全局的 ghfast.top 镜像改写
GIT_CONFIG_GLOBAL=/dev/null GIT_ASKPASS="$ASKPASS" GIT_TERMINAL_PROMPT=0 \
  git push "https://github.com/${REPO}.git" main

echo "✅ 已推送。GitHub Pages 约 1 分钟后更新："
echo "   https://memory66683.github.io/one-key-four-worlds/"
