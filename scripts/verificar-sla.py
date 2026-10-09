#!/usr/bin/env python3
"""Evalua un .jtl (CSV de JMeter) contra el SLA de la Practica 5: p95 < SLA_P95_MS y 0 % de errores.

Uso: verificar-sla.py <resultados.jtl> <sla_p95_ms>
Imprime una tabla Markdown (para $GITHUB_STEP_SUMMARY) y sale con 1 si se incumple el SLA.
"""
import csv
import math
import sys


def p95(valores):
    orden = sorted(valores)
    return orden[max(0, math.ceil(0.95 * len(orden)) - 1)]


def main():
    archivo, sla = sys.argv[1], int(sys.argv[2])
    filas = list(csv.DictReader(open(archivo, encoding="utf-8")))
    if not filas:
        print("::error title=Rendimiento::El archivo " + archivo + " no tiene muestras", file=sys.stderr)
        sys.exit(1)
    grupos = {}
    for f in filas:
        grupos.setdefault(f["label"], []).append(f)
    grupos["TOTAL"] = filas
    print("### Rendimiento (JMeter) - SLA: p95 < %d ms y 0 %% de errores\n" % sla)
    print("| Endpoint | Muestras | Promedio (ms) | p95 (ms) | Errores | Cumple |")
    print("|---|---|---|---|---|---|")
    ok = True
    for nombre, fs in grupos.items():
        tiempos = [int(f["elapsed"]) for f in fs]
        errores = sum(1 for f in fs if f["success"] != "true")
        cumple = p95(tiempos) < sla and errores == 0
        ok &= cumple
        print("| %s | %d | %d | %d | %.1f %% | %s |" % (nombre, len(fs), sum(tiempos) / len(fs), p95(tiempos),
                                                       100.0 * errores / len(fs), "✅" if cumple else "❌"))
    if not ok:
        print("::error title=SLA incumplido::p95 >= %d ms o hay errores (ver el resumen del run)" % sla, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
