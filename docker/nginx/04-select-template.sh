#!/bin/sh
set -eu

HTTP_TEMPLATE="/etc/nginx/templates/http.conf.tpl"
HTTPS_TEMPLATE="/etc/nginx/templates/https.conf.tpl"
TARGET_TEMPLATE="/etc/nginx/templates/default.conf.template"

ENABLE_SSL="${NGINX_ENABLE_SSL:-false}"
CERT_PATH="${NGINX_SSL_CERT_PATH:-}"
KEY_PATH="${NGINX_SSL_KEY_PATH:-}"

is_true() {
    case "${1}" in
        1|true|TRUE|yes|YES|on|ON) return 0 ;;
        *) return 1 ;;
    esac
}

if is_true "$ENABLE_SSL" && [ -n "$CERT_PATH" ] && [ -n "$KEY_PATH" ] && [ -f "$CERT_PATH" ] && [ -f "$KEY_PATH" ]; then
    cp "$HTTPS_TEMPLATE" "$TARGET_TEMPLATE"
    echo "[nginx-entrypoint] SSL habilitado: usando plantilla HTTPS"
else
    cp "$HTTP_TEMPLATE" "$TARGET_TEMPLATE"
    if is_true "$ENABLE_SSL"; then
        echo "[nginx-entrypoint] SSL solicitado pero faltan certificados; arrancando en HTTP sin error"
    else
        echo "[nginx-entrypoint] SSL deshabilitado; arrancando en HTTP"
    fi
fi
