import logging
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from flask import Flask, flash, redirect, render_template, request, url_for

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "database.db"
MAX_TITLE_LENGTH = 150
MAX_CONTENT_LENGTH = 5000

app = Flask(__name__, template_folder="templates")
app.config["SECRET_KEY"] = "ataa-replit-free-tier-secret"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def is_valid_http_url(url_text: str) -> bool:
    """Validate HTTP(S) links to prevent malformed URL submissions."""
    parsed = urlparse(url_text)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def validate_post_input(title: str, content: str) -> tuple[bool, str]:
    cleaned_title = title.strip()
    cleaned_content = content.strip()

    if not cleaned_title or not cleaned_content:
        return False, "العنوان والمحتوى مطلوبان ولا يمكن أن يكونا فارغين."

    if len(cleaned_title) > MAX_TITLE_LENGTH:
        return False, f"العنوان طويل جدًا (الحد الأقصى {MAX_TITLE_LENGTH} حرفًا)."

    if len(cleaned_content) > MAX_CONTENT_LENGTH:
        return False, f"المحتوى طويل جدًا (الحد الأقصى {MAX_CONTENT_LENGTH} حرفًا)."

    for token in cleaned_content.split():
        if token.startswith(("http://", "https://")) and not is_valid_http_url(token):
            return False, "يوجد رابط غير صالح في المحتوى."

    return True, ""


def get_db_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(
        DATABASE_PATH,
        timeout=10,
        isolation_level=None,
        check_same_thread=False,
    )
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA journal_mode=WAL")
    connection.execute("PRAGMA busy_timeout = 10000")
    connection.execute("PRAGMA synchronous = NORMAL")
    return connection


def init_db() -> None:
    DATABASE_PATH.touch(exist_ok=True)
    try:
        with get_db_connection() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS posts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
                    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
                    timestamp TEXT NOT NULL
                )
                """
            )
    except sqlite3.Error:
        logger.exception("Database initialization failed.")
        raise


@app.route("/")
def index():
    posts = []
    db_error = False

    try:
        with get_db_connection() as connection:
            posts = connection.execute(
                "SELECT id, title, content, timestamp FROM posts ORDER BY id DESC LIMIT 200"
            ).fetchall()
    except sqlite3.Error:
        db_error = True
        logger.exception("Failed to load posts from database.")

    return render_template("index.html", posts=posts, db_error=db_error)


@app.route("/submit", methods=["POST"])
def submit_post():
    title = request.form.get("title", "")
    content = request.form.get("content", "")

    is_valid, error_message = validate_post_input(title, content)
    if not is_valid:
        flash(error_message, "error")
        return redirect(url_for("index"))

    timestamp = datetime.now(timezone.utc).isoformat(timespec="seconds")

    try:
        with get_db_connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            connection.execute(
                "INSERT INTO posts (title, content, timestamp) VALUES (?, ?, ?)",
                (title.strip(), content.strip(), timestamp),
            )
        flash("تم نشر المساهمة بنجاح ✅", "success")
    except sqlite3.IntegrityError:
        flash("تعذر حفظ المساهمة بسبب بيانات غير صالحة.", "error")
        logger.exception("Integrity error while saving post.")
    except sqlite3.Error:
        flash("حدث خطأ في قاعدة البيانات. حاول مرة أخرى بعد قليل.", "error")
        logger.exception("Database write failed.")

    return redirect(url_for("index"))


init_db()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
