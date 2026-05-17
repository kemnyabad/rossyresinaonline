#!/usr/bin/env python3
"""
Rossy Resina operations report.

This script is intentionally outside the Next.js runtime. It is for admin
diagnostics, reports, and scheduled jobs.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import ssl
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlparse


ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = ROOT / ".env"
REPORTS_ROOT = ROOT / "reports" / "ops"


def load_env(path: Path = ENV_PATH) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def to_jsonable(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def write_json(path: Path, payload: Any) -> None:
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, default=to_jsonable),
        encoding="utf-8",
    )


def write_csv(path: Path, rows: list[dict[str, Any]], fieldnames: list[str]) -> None:
    with path.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({key: to_jsonable(row.get(key, "")) for key in fieldnames})


@dataclass
class DbConfig:
    host: str
    port: int
    user: str
    password: str
    database: str
    ssl_disabled: bool = False


def parse_database_url(value: str) -> DbConfig:
    parsed = urlparse(value)
    if parsed.scheme not in {"mysql", "mysql2"}:
        raise ValueError("Only mysql/mysql2 DATABASE_URL is supported by this script.")
    query = parse_qs(parsed.query)
    return DbConfig(
        host=parsed.hostname or "localhost",
        port=int(parsed.port or 3306),
        user=unquote(parsed.username or ""),
        password=unquote(parsed.password or ""),
        database=(parsed.path or "").lstrip("/"),
        ssl_disabled=str(query.get("sslaccept", [""])[0]).lower() == "disable",
    )


def fetch_db_report(days: int, stock_threshold: int) -> dict[str, Any]:
    try:
        import pymysql  # type: ignore
    except ImportError as exc:
        raise RuntimeError("PyMySQL is not installed. Run: python -m pip install -r scripts/python/requirements.txt") from exc

    db_url = os.environ.get("DATABASE_URL", "")
    if not db_url:
        raise RuntimeError("DATABASE_URL is missing.")

    config = parse_database_url(db_url)
    ssl_context = None if config.ssl_disabled else ssl.create_default_context()
    connection = pymysql.connect(
        host=config.host,
        port=config.port,
        user=config.user,
        password=config.password,
        database=config.database,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
        ssl=ssl_context,
    )

    try:
        with connection.cursor() as cursor:
            cursor.execute("select count(*) as count from Product")
            product_count = int(cursor.fetchone()["count"])

            cursor.execute(
                """
                select id, title, code, stock, price
                from Product
                where stock <= %s
                order by stock asc, title asc
                limit 200
                """,
                (stock_threshold,),
            )
            low_stock = list(cursor.fetchall())

            cursor.execute("select count(*) as count from `Order`")
            order_count = int(cursor.fetchone()["count"])

            cursor.execute(
                """
                select status, count(*) as orders, coalesce(sum(total), 0) as total
                from `Order`
                where createdAt >= date_sub(now(), interval %s day)
                group by status
                order by status asc
                """,
                (days,),
            )
            orders_by_status = list(cursor.fetchall())

            cursor.execute(
                """
                select id, createdAt, status, total, customerName, customerEmail, customerPhone
                from `Order`
                where status = 'PENDING'
                order by createdAt asc
                limit 300
                """
            )
            pending_orders = list(cursor.fetchall())

            cursor.execute(
                """
                select rt.id, rt.number, rt.status, rt.buyerName, rt.buyerEmail, rt.buyerPhone,
                       r.title as rifaTitle, rt.createdAt
                from RifaTicket rt
                join Rifa r on r.id = rt.rifaId
                where rt.status = 'PENDING'
                order by rt.createdAt asc
                limit 300
                """
            )
            pending_rifa_tickets = list(cursor.fetchall())

        return {
            "source": "database",
            "productCount": product_count,
            "orderCount": order_count,
            "ordersByStatus": orders_by_status,
            "lowStock": low_stock,
            "pendingOrders": pending_orders,
            "pendingRifaTickets": pending_rifa_tickets,
        }
    finally:
        connection.close()


def load_json(path: Path) -> Any:
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def fetch_json_report(stock_threshold: int) -> dict[str, Any]:
    products = load_json(ROOT / "src" / "data" / "products.json")
    orders = load_json(ROOT / "src" / "data" / "orders.json")

    low_stock: list[dict[str, Any]] = []
    for item in products if isinstance(products, list) else []:
        stock = int(item.get("stock") or item.get("quantity") or 0)
        if stock <= stock_threshold:
            low_stock.append(
                {
                    "id": item.get("id") or item.get("_id") or "",
                    "title": item.get("title") or item.get("name") or "",
                    "code": item.get("code") or "",
                    "stock": stock,
                    "price": item.get("price") or 0,
                }
            )

    pending_orders = []
    for item in orders if isinstance(orders, list) else []:
        status = str(item.get("status") or "").upper()
        if status in {"PENDING", "PENDIENTE", "PENDIENTE POR CONFIRMAR"}:
            pending_orders.append(item)

    return {
        "source": "json",
        "productCount": len(products) if isinstance(products, list) else 0,
        "orderCount": len(orders) if isinstance(orders, list) else 0,
        "ordersByStatus": [],
        "lowStock": low_stock,
        "pendingOrders": pending_orders,
        "pendingRifaTickets": [],
    }


def build_summary(report: dict[str, Any], days: int, stock_threshold: int) -> dict[str, Any]:
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": report["source"],
        "windowDays": days,
        "stockThreshold": stock_threshold,
        "productCount": report["productCount"],
        "orderCount": report["orderCount"],
        "lowStockCount": len(report["lowStock"]),
        "pendingOrderCount": len(report["pendingOrders"]),
        "pendingRifaTicketCount": len(report["pendingRifaTickets"]),
        "ordersByStatus": report["ordersByStatus"],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate Rossy Resina operations reports.")
    parser.add_argument("--days", type=int, default=30, help="Order summary window in days.")
    parser.add_argument("--stock-threshold", type=int, default=5, help="Low stock threshold.")
    parser.add_argument("--json-only", action="store_true", help="Use local JSON files instead of DATABASE_URL.")
    args = parser.parse_args()

    load_env()

    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    output_dir = REPORTS_ROOT / timestamp
    output_dir.mkdir(parents=True, exist_ok=True)

    if args.json_only:
        report = fetch_json_report(args.stock_threshold)
    else:
        try:
            report = fetch_db_report(args.days, args.stock_threshold)
        except Exception as exc:
            print(f"Database report unavailable: {exc}")
            print("Falling back to local JSON data.")
            report = fetch_json_report(args.stock_threshold)

    summary = build_summary(report, args.days, args.stock_threshold)
    write_json(output_dir / "summary.json", summary)
    write_csv(output_dir / "low_stock.csv", report["lowStock"], ["id", "title", "code", "stock", "price"])
    write_csv(
        output_dir / "pending_orders.csv",
        report["pendingOrders"],
        ["id", "createdAt", "status", "total", "customerName", "customerEmail", "customerPhone"],
    )
    write_csv(
        output_dir / "pending_rifa_tickets.csv",
        report["pendingRifaTickets"],
        ["id", "createdAt", "rifaTitle", "number", "status", "buyerName", "buyerEmail", "buyerPhone"],
    )

    print(f"Report generated: {output_dir}")
    print(json.dumps(summary, ensure_ascii=False, indent=2, default=to_jsonable))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
